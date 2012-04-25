/*global widget, UIItem*/
var ToolbarIcon = {    
	initButton: function() {
		ToolbarIcon.button = opera.contexts.toolbar.createItem({
			disabled: false,
			title: widget.name,
			icon: 'images/icon-18.png',
			popup: {
				href: 'popup.html',
				width: 325,
				height: 450
			},
			badge: {} // need to create an empty object now so it can be potentially modified later
		});
	},

	// creates a title for the icon based on the number of error reports
	title: function(c) {
		var count = parseInt(c);

		if (count > 0) {
			return count === 1 ? 
			    'A bug was reported on this ' + (widget.preferences['display-reports-by'] || 'website') : 
			    count + ' bugs were reported on this ' + (widget.preferences['display-reports-by'] || 'website');
		}

		return 'Report a problem on this website';
	},

	create: function(badgeProperties) {
		if (opera.hasOwnProperty('contexts')) {
			// Set the properties of the button

			var	icon = opera.contexts.toolbar[0], i;

			if (!window.hasOwnProperty('UIItem') || !(icon instanceof UIItem))  {
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

	// update the badge on the toolbar icon with the right reports count
	updateBadge: function() {
		var
			mode         = widget.preferences['display-reports-by'] || 'domain',
			tab          = opera.extension.tabs ? opera.extension.tabs.getFocused() : '',
			page_address = getPageAddress(),
			domain_name  = getDomainName() // get the second item in the result's array (the matched text in the parentheses)
		;
		
		if (tab) {
			ToolbarIcon.button.disabled = false;
			
			if (sessionStorage.getItem(page_address)) {
				var 
					count = sessionStorage.getItem(page_address),
					badge = {
						display: 'block',
						textContent: count,
						color: 'white',
						backgroundColor: '#c12a2a'
					}
				;
				
				// add a title to the button
				ToolbarIcon.button.title = ToolbarIcon.title(count);

				// create the badge 
				ToolbarIcon.create(badge);
			} else {
				// display a "?" badge to show that the actual reports count is loading
				var loadingBadge = {
					display: 'block',
					textContent: ' ? ',
					color: 'white',
					title: 'Loading reports count...',
					backgroundColor: '#c12a2a'
				};

				ToolbarIcon.create(loadingBadge);

				sendRequest('GET', 'ajax_request_handler.php?mode=get_reports_count&method=' + mode + '&page=' + encodeURIComponent(page_address) + '&domain=' + encodeURIComponent(domain_name), function(data) {
					if (data) {
						var badge = {
							display: 'block',
							textContent: data,
							color: 'white',
							backgroundColor: '#c12a2a'
						};

						// create the badge
						ToolbarIcon.create(badge);
						sessionStorage.setItem(page_address, data);
					}
				}, null, true);
			}
		}
	},

	// select the right state for the button
	init: function() { 
		if (typeof ToolbarIcon.button === 'undefined') {
			ToolbarIcon.initButton();
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
	var page_address = getPageAddress();

	sessionStorage.removeItem(page_address); // Erase the cached error report count for the current page if it is set. It is updated when the page loads
	ToolbarIcon.init();
};

window.onload = ToolbarIcon.create;

function getOS () {
	sendRequest('GET', 'ajax_request_handler.php?mode=get_OS', function(data) {
		opera.extension.broadcastMessage({'system' : data});
	}, null, true);
}

function getPageAddress () {
	var tab = opera.extension.tabs ? opera.extension.tabs.getFocused() : '';
	return tab && tab.url ? tab.url.replace(/\/$/ig, '') : ''; // remove trailing slashes
}

function getDomainName () {
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
	var
		mode         = widget.preferences['display-reports-by'] || 'domain',
		page_address = getPageAddress(),
		tab          = opera.extension.tabs ? opera.extension.tabs.getFocused() : '',
		domain_name  = getDomainName()
	;

	if (event.data === 'get_frame_content') {    
		if (tab) {
			sendRequest ('GET', 'ajax_request_handler.php?mode=get_report_list&count=50&page=1&domain=' + encodeURIComponent(domain_name) + '&method=' + mode + '&page=1&url=' + encodeURIComponent(page_address), function(data) {
				event.source.postMessage({frame_content : JSON.stringify(JSON.parse(data).list)});
			}, null, true);
		}
	} else if (event.data === 'initialize badge') {
		ToolbarIcon.updateBadge();
	}
};