CONFIG = {
    defaultHost: 'http://localhost/', // the default domain to make AJAX post requests to; *must have* the trailing slash "/"
    twitter: {
        consumerKey: "frKRutacGx6VUkMhwQeJ6Q",
        consumerSecret: "aUEFth57HGgRQC0pYjkCwrIZUpROLCVvPBZsM4dg",
        requestTokenUrl: "https://api.twitter.com/oauth/request_token",
        authorizationUrl: "https://api.twitter.com/oauth/authenticate",
        accessTokenUrl: "https://api.twitter.com/oauth/access_token"
    }
}

ToolbarIcon = {
    button : false,
    
    create : function(badgeProperties) {
        if (opera.contexts) {
            // Set the properties of the button
            var buttonProperties = {
                disabled: false,
                title: widget.name,
                icon: 'images/icon-18.png',
                popup: {
                    href: 'popup.html',
                    width: 325,
                    height: 450
                },
                badge: {} // need to create an empty object now so it can be potentially modified later
            }

            var icon = opera.contexts.toolbar[0];

            // if the button already was created and there is badge information passed to this function, then edit the icon's badge
            if (typeof icon != 'undefined' && icon instanceof UIItem && typeof badgeProperties == 'object') {
                if (parseInt(badgeProperties.textContent) > 0) {
                    icon.title = parseInt(badgeProperties.textContent) == 1 ? 
                        'A bug was reported on this ' + (widget.preferences['display-reports-by'] || 'website') : 
                        badgeProperties.textContent+ ' bugs were reported on this ' + (widget.preferences['display-reports-by'] || 'domain');
                }

                for (i in badgeProperties) { // loop through the badgeProperties object and assign each key: val to a key: val in the toolbar icon badge
                    icon.badge[i] = badgeProperties[i]
                }
            } else {
                // Create the button and add it to the toolbar
                ToolbarIcon.button = opera.contexts.toolbar.createItem(buttonProperties);
                                
                // if there was data passed representing a badge, then add the badge to the icon
                if (typeof badgeProperties == 'object') {
                    if (parseInt(badgeProperties.textContent) > 0) {
                        ToolbarIcon.button.title = parseInt(badgeProperties.textContent) == 1 ? 
                            'A bug was reported on this ' + (widget.preferences['display-reports-by'] || 'website') : 
                            badgeProperties.textContent+ ' bugs were reported on this ' + (widget.preferences['display-reports-by'] || 'domain');
                    }

                    for (i in badgeProperties) { // loop through the badgeProperties object and assign each key: val to a key: val in the toolbar icon badge
                        ToolbarIcon.button.badge[i] = badgeProperties[i]
                    }
                }
                
                ToolbarIcon.init(); // put the button in the proper state
                
                opera.contexts.toolbar.addItem(ToolbarIcon.button);
            }
        }
    },
    
    // update the badge on the toolbar icon with the right reports count
    updateBadge: function() {
        var mode = widget.preferences['display-reports-by'] || 'domain',
              tab = opera.extension.tabs ? opera.extension.tabs.getFocused() : '',
              page_address = tab ? tab.url.replace(/#(.*)/, '').replace(/\/$/ig, '') : '', // remove trailing slashes and the hash segment of the URL
              domain_name = page_address.match(/:\/\/([^\/]+)\/?/) ? page_address.match(/:\/\/([^\/]+)\/?/)[1] : ''; // get the second item in the result's array (the matched text in the parentheses)
        
        if (tab) {
            ToolbarIcon.button.disabled = false;
            if (sessionStorage.getItem(page_address)) {
                var count = sessionStorage.getItem(page_address),
                      badge = {
                          display: 'block',
                          textContent: count,
                          color: 'white',
                          backgroundColor: '#c12a2a'
                      }
                
                if (parseInt(count) > 0) {
                    ToolbarIcon.button.title = parseInt(count) == 1 ? 
                        'A bug was reported on this ' + (widget.preferences['display-reports-by'] || 'website') : 
                        count+ ' bugs were reported on this ' + (widget.preferences['display-reports-by'] || 'domain');
                } else ToolbarIcon.button.title = 'Report a bug on this website'

                // create the badge              
                ToolbarIcon.create(badge);
            }
            else {
                sendRequest ('GET', 'ajax_request_handler.php?mode=get_reports_count&method=' + mode + '&page=' + encodeURIComponent(page_address) + '&domain=' + encodeURIComponent(domain_name), function(data) {
                    if (data) {
                        var badge = {
                                display: 'block',
                                textContent: data,
                                color: 'white',
                                backgroundColor: '#c12a2a'
                            }

                        // create the badge              
                        ToolbarIcon.create(badge);
                        sessionStorage.setItem(page_address, data);
                    }
                }, true);
            }
        }
    },
    
    // select the right state for the button
    init: function() {
        if ( !ToolbarIcon.button ) {
            console.log( 'Oops, no button!' )
            return;
        }
        
        var tab = opera.extension.tabs.getFocused();
        if (tab) {
            ToolbarIcon.button.disabled = false;
            ToolbarIcon.updateBadge()
        } else {
            ToolbarIcon.button.disabled = true;
            ToolbarIcon.button.badge.display = 'none'
        }
    }
}

// button is enabled when tab is ready
opera.extension.onconnect = ToolbarIcon.init
opera.extension.tabs.onfocus = ToolbarIcon.init
opera.extension.tabs.onblur = ToolbarIcon.init

// detect if the user is authenticated
function isLoggedIn () {
    var access_token = widget.preferences.access_token || '';
    
    if ( !access_token.length || access_token == '|' || access_token == 'none') return false;
    else return true;
}

function getUserName (callback) {
    if ( isLoggedIn() && typeof OAuth != 'undefined') {
        var r,
             access_token = widget.preferences.access_token || '';
             oauth = new OAuth (CONFIG.twitter);
             
        if (typeof callback != 'function') {
            callback = function(data) {
//                parsedResponse = data && data.text && data.text != '' && JSON.parse(data.text) ? JSON.parse(data.text) : {};
//                return parsedResponse.screen_name || false;
                console.log(data)
            } 
        }
        
        oauth.setAccessToken(access_token.split('|'));
        oauth.get ('https://api.twitter.com/1/account/verify_credentials.json', callback, function(data) {
            console.log('Error: ' + data)
        });
    } else return false;
}

/* function sendRequest() makes sending AJAX requests easier and simpler
 * method: GET or POST (must use CORS for cross-domain POST requests, otherwise it won't work)
 * url: the URL address to send the request to
 * callback (optional): a callback function to be run when the request completes
 * params (optional): the params in JSON e.g. {key: 'val', key2: 'val2', ...}
 * useDefaultHost (optional boolean): whether to use the default domain (specified in the CONFIG section at the top of this file)
 */

function sendRequest (method, url, callback, params, useDefaultHost) {
    var xhr = new XMLHttpRequest();
    
    // if useDefaultHost is undefined or true, then use the hostname specified in CONFIG
    if (typeof useDefaultHost == 'undefined' || useDefaultHost) url = CONFIG.defaultHost + url
   
    xhr.onreadystatechange = function() {
        if (this.status == 200 && this.readyState == 4) {
            if (typeof callback == 'function') callback(this.responseText);
        }
    }
     
    // serialize the parameters passed into this function, if there are any. 
    // For example, change {key: 'val', key2: 'val2'} to 'key=val&key2=val2'
    if (typeof params == 'object' && params) {
        var serialized_data = '';
        
        for (i in params) {
            if (typeof first_iteration == 'undefined') {
                serialized_data += i + '=' + encodeURIComponent(params[i]);
                var first_iteration = true;
            } else // we need to add an ampersand (&) at the beginning if there are already parameters in the query string
                serialized_data += '&' + i + '=' + encodeURIComponent(params[i]); 
        }
    } else serialized_data = false;    
    try {
        if (method.toLowerCase() != 'get') throw 'Invalid method "' + method + '" was specified. AJAX request could not be completed.' ;
        else {            
            xhr.open(method, url + (serialized_data && serialized_data.length ? '?' + serialized_data : ''), true)
            xhr.send(null);
        }
    } catch(error) { 
        console.log('Error: ' + error);
        return false;
    }
} // end sendRequest() function

// the update() function pulls the patches script from Github and puts its contents in widget.preferences['patches-js']
function update(callback) {    
    var r = new XMLHttpRequest();        
    error = false,
    updated = 0;
    
    if (typeof widget.preferences["patches-js-checksum"] == 'undefined') 
        widget.preferences["patches-js-checksum"] = '0'
    
    r.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200 || this.responseXML != '') {
            // Pull the last checksum from localStorage and compare it to the checksum of the most recent commit on Github.
            // If the file was updated, then update the local copy of it
            this.onload = function() {
                if (this.responseXML && this.responseXML.getElementsByTagName("entry")) 
                    var checksum = this.responseXML.getElementsByTagName("entry")[0].getElementsByTagName('id')[0].firstChild.nodeValue.match(/\/([\d\w]*)/)[1]
                else error = true

                updated = (checksum == widget.preferences["patches-js-checksum"] ? 1 : 0);

                if (typeof checksum != 'undefined' && checksum != widget.preferences["patches-js-checksum"]) {
                    widget.preferences["patches-js-checksum"] = checksum;    
                    updated = 2;
                    
                    sendRequest('GET', 'https://raw.github.com/cyberstream/Fix-the-Web-Patch-Script/master/patches.js', 
                        function(data) {
                            // TODO if patches.js exceeds the storage quota of one widget.preferences variable, 
                            // then split the file's contents up between multiple widget.preferences variables (like the ad block lists in Opera AdBlock)
                            // store the patches script in localStorage. Will turn it into a script element in 'includes/include.js'

                            widget.preferences['patches-js'] = data
                            console.log('Fix the Web\'s patches.js file was just updated.');
                        }, null, false);
                } else if (checksum == 'undefined') error = true;
                
                if (typeof callback == 'function') {
                    if (error) {
                        console.log ('Fix the Web Error:' + error);
                        callback(0);
                    }
                    else callback(updated);
                }
            }
        }
    }
    
    r.open('GET', 'https://github.com/cyberstream/Fix-the-Web-Patch-Script/commits/master.atom', true);

    try {
        r.send()
    } catch(error) {
        console.log('Error: ' + error)
        if (typeof callback == 'function') callback(0);
    }
}

if(widget.preferences.getItem("update-interval"))
    // "update-interval" in widget.preferences will determine how often the patches.js file is updated
    // update-interval is in minutes, but setTimeout accepts milliseconds, so convert update-interval to seconds unit
    setTimeout(update(), (widget.preferences.getItem("update-interval") * 1000 * 60)); 

function getOS () {
    sendRequest('GET', 'ajax_request_handler.php?mode=get_OS', function(data) {
        opera.extension.broadcastMessage({'system' : data})
    }, true);
}

opera.extension.onconnect = function(e) {
    e.source.postMessage('reply');
}

opera.extension.onmessage = function(event) {
    var mode = widget.preferences['display-reports-by'] || 'domain',
            tab = opera.extension.tabs ? opera.extension.tabs.getFocused() : '',
            page_address = tab ? tab.url.replace(/#(.*)/, '').replace(/\/$/ig, '') : '', // remove trailing slashes and the hash segment of the URL
            domain_name = page_address.match(/:\/\/([^\/]+)\/?/) ? page_address.match(/:\/\/([^\/]+)\/?/)[1] : ''; // get the second item in the result's array (the matched text in the parentheses)
    
    if (event.data == 'get_frame_content') {    
        if (tab) {
            sendRequest ('GET', 'ajax_request_handler.php?mode=get_frame_content&method=' + mode + '&page=' + encodeURIComponent(page_address) + '&domain=' + encodeURIComponent(domain_name), function(data) {
                event.source.postMessage({frame_content : data})
            }, true);
        }
    } else if (event.data == 'initialize badge') {
        ToolbarIcon.updateBadge();
    }
}