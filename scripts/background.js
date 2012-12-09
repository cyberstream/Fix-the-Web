/** 
 * @global widget 
 * @global UIItem 
*/

var ToolbarIcon = {
    initButton: function() {
        var buttonObj = {
            disabled: false,
            title: widget.name,
            icon: 'images/icon-18.png',
            popup: {
                href: 'popup.html',
                width: 325,
                height: 450
            },
            badge: {} // need to create an empty object now so it can be potentially modified later
        };
        
        ToolbarIcon.button = opera.contexts.toolbar.createItem(buttonObj);
    },
    
    // creates a title for the icon based on the number of error reports
    title: function(c) {
        var count = parseInt(c);

        // TODO: make this badge title fully translatable 
        if (count > 0) {
            return count === 1 ?                    
                    i18n.bug_reported_on[widget.preferences['display-reports-by']] :
                    count + ' ' + i18n.bugs_reported_on[widget.preferences['display-reports-by']];
        }

        return (typeof i18n != 'undefined' && "report_site_problem" in i18n ? i18n.report_site_problem : 'Report a problem on this website');
    },
            
    // add the button to the toolbar
    create: function(badgeProperties) {
        if (opera.hasOwnProperty('contexts')) {
            // Set the properties of the button

            var icon = opera.contexts.toolbar[0], i;

            if (!window.hasOwnProperty('UIItem') || !(icon instanceof UIItem)) {
                // Create the button and add it to the toolbar
                ToolbarIcon.initButton();
                icon = ToolbarIcon.button;

                // put the button in the proper state
                ToolbarIcon.button.disabled = !opera.extension.tabs.getFocused();

                // add the icon to the toolbar
                opera.contexts.toolbar.addItem(ToolbarIcon.button);
            }

            // if there was data passed representing a badge, then add the badge to the icon
            if (typeof badgeProperties === 'object') {
                // create a title for the button based on the number of reports
                icon.title = ToolbarIcon.title(badgeProperties.textContent);

                // loop through the badgeProperties object and assign each key: val to a key: val in the toolbar icon badge
                for (i in badgeProperties) {
                    if (badgeProperties.hasOwnProperty(i)) {
                        icon.badge[i] = badgeProperties[i];
                    }
                }
            }
        }
    },
            
    // returns a count of error reports for the badge for the current tab's url or domain (depending on the preference)
    getBadgeCount: function() {
        var mode = widget.preferences['display-reports-by'] || 'domain',
              tab_info = {
                    page: getPageAddress(),
                    domain: getDomainName()
                },
                mode_id = tab_info[mode];

        if ( mode == 'disabled' ) return 0;

        // Attempt to parse the summary object
        try {
            var summary_object = JSON.parse(widget.preferences['reports-summary']);
        } catch (e) {

            // output and error message and abort the function by returning "0"
            console.log('[FtW error] Error parsing reports summary');
            return 0;
        }

        // make sure the summary_object array is populated before continuing
        if (summary_object.length != 0) {
            var reports_list = summary_object['by_' + mode];

            if (mode_id in reports_list)
                return reports_list[mode_id];
        }

        return 0; // if no value has been returned yet, then return 0
    },
            
    // update the badge on the toolbar icon with the right reports count
    updateBadge: function() {
        var tab = opera.extension.tabs ? opera.extension.tabs.getFocused() : '', 
              mode = widget.preferences['display-reports-by'] || 'domain';

        if (tab) {
            ToolbarIcon.button.disabled = false;
            
            // Destroy the badge if it is disabled
            if ( mode == 'disabled' ) {
                ToolbarIcon.create({ textContent: '' });                
                return;
            }
            
            // Don't create the badge unless the reports' summary has been updated
            if ( widget.preferences['reports-summary'] != '{"by_domain":{},"by_page":{},"total_number":0}' ) {
                var badgeCount = ToolbarIcon.getBadgeCount(),                
                    badge = {
                        display: 'block',
                        textContent: badgeCount ? ' ' + badgeCount + ' ' : 0, // get badge count and add padding if there are error reports
                        color: 'white',
                        backgroundColor: badgeCount ? '#c12a2a' : '#555'
                    };
                
                // create the badge
                ToolbarIcon.create(badge);
            }
        }
    },
            
    // select the right state for the button
    init: function() {
        // If the button is not explicitly allowed in preferences, then check if it is created. If so, remove it. Otherwise, just abort the function.
        if ( widget.preferences['toolbar-icon'] != 'enable' ) {
            if ( opera.contexts.toolbar.length ) {
                opera.contexts.toolbar.removeItem(opera.contexts.toolbar[0]);
                if ( "button" in ToolbarIcon) delete ToolbarIcon.button;
            }
            
            return;
        }
        
        if (typeof ToolbarIcon.button === 'undefined') {
            ToolbarIcon.initButton();
            ToolbarIcon.create();
        }

        var tab = opera.extension.tabs.getFocused();

        if (tab) {
            ToolbarIcon.button.disabled = false;
            ToolbarIcon.updateBadge();
        } else {
            ToolbarIcon.button.disabled = true;
            ToolbarIcon.button.badge.display = 'none';
        }
    }
};

// Enable the toolbar button when the tab is ready

if (opera.extension.tabs) {
    opera.extension.tabs.onfocus = ToolbarIcon.init;
    opera.extension.tabs.onblur = ToolbarIcon.init;
}

opera.extension.onconnect = function() {
    ToolbarIcon.init();
};

window.onload = ToolbarIcon.init;

function getOS() {
    sendRequest('GET', 'ajax_request_handler.php?mode=get_OS', function(data) {
        opera.extension.broadcastMessage({'system': data});
    }, null, true);
}

function getPageAddress() {
    var tab = opera.extension.tabs ? opera.extension.tabs.getFocused() : '';
    return tab && tab.url ? tab.url.replace(/\/$/ig, '') : ''; // remove trailing slashes
}

function getDomainName() {
    var url = getPageAddress();
    return url.match(/:\/\/([^\/]+)\/?/) ? url.match(/:\/\/([^\/]+)\/?/)[1] : ''; // get the second item in the result's array (the matched text in the parentheses)
}

opera.extension.onconnect = function(e) {
    try {
        e.source.postMessage('reply');
    } catch (err) {
        // handle error
    }
};

// Handle incoming messages
opera.extension.onmessage = function(event) {
    var mode = (widget.preferences['display-reports-by'] && (widget.preferences['display-reports-by']).match(/(domain|page)/ig) ? 
                        widget.preferences['display-reports-by'] : 'domain') || 'domain',
            page_address = getPageAddress(),
            tab = opera.extension.tabs ? opera.extension.tabs.getFocused() : '',
            domain_name = getDomainName();

    if (event.data === 'get_frame_content') {
        if (tab) {
            sendRequest('get', 'ajax_request_handler.php?mode=get_report_list&count=50&page=1&domain=' + encodeURIComponent(domain_name) + '&method=' + mode + '&url=' + encodeURIComponent(page_address), 
                function(data) {
                    var parsed_data = {};
                    
                  //  {frame_content: JSON.stringify(JSON.parse(data).list)}
                    
                    if ( data.length ) {
                        try {
                            parsed_data = JSON.parse(data);
                        } catch (e) {
                            // JSON parsing error handler
                            parsed_data.error = i18n.error_loading_reports;                            
                        }
                    }
                    
                    // add special translated messages to display in the frame
                    parsed_data.i18n = {
                        view_all_languages: i18n.view_all_languages,
                        no_reports: i18n.no_reports,
                        expanded: i18n.expanded,
                        collapsed: i18n.collapsed,
                        expand_thread: i18n.expand_thread,
                        collapse_thread: i18n.collapse_thread,
                        page: i18n.page
                    };
                    
                    event.source.postMessage ({frame_content: parsed_data});
                },
            null, true, function() {
                // AJAX error handler
                event.source.postMessage ({frame_content: {error: i18n.error_loading_reports}});
            });
        }
    } else if (event.data === 'initialize badge') {
        ToolbarIcon.init();
    }
}