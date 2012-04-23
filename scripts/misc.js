/*global widget, OAuth*/
var CONFIG = {
	defaultHost: 'http://localhost/Fix-the-Web-Server-Side/', // the default domain to make AJAX requests to; *must have* the trailing slash "/"
	twitter: {
		consumerKey: "frKRutacGx6VUkMhwQeJ6Q",
		consumerSecret: "aUEFth57HGgRQC0pYjkCwrIZUpROLCVvPBZsM4dg",
		requestTokenUrl: "https://api.twitter.com/oauth/request_token",
		authorizationUrl: "https://api.twitter.com/oauth/authenticate",
		accessTokenUrl: "https://api.twitter.com/oauth/access_token"
	}
};

function getUserName (callback) {
	"use strict";
	if (isLoggedIn() && typeof OAuth !== 'undefined') {
		var 
			access_token = widget.preferences.access_token || '',
			oauth = new OAuth(CONFIG.twitter),
			r
		;
			
		if (typeof callback !== 'function') {
			callback = function(data) {
//				parsedResponse = data && data.text && data.text !== '' && JSON.parse(data.text) ? JSON.parse(data.text) : {};
//				return parsedResponse.screen_name || false;
				console.log(data);
			};
		}
		
		oauth.setAccessToken(access_token.split('|'));
		oauth.get('https://api.twitter.com/1/account/verify_credentials.json', callback, function(data) {
			console.log('[FtW Error]: ' + data);
		});
		return true;
	} 
	return false;
}

// Detect if the user is authenticated
function isLoggedIn () {
	"use strict";
	var access_token = widget.preferences.access_token || '';
	return !(!access_token.length || access_token === '|' || access_token === 'none');
}

/* function sendRequest() makes sending AJAX requests easier and simpler
 * method: GET or POST (must use CORS for cross-domain POST requests, otherwise it won't work)
 * url: the URL address to send the request to
 * callback (optional): a callback function to be run when the request completes
 * params (optional): the params in JSON e.g. {key: 'val', key2: 'val2', ...}
 * useDefaultHost (optional boolean): whether to use the default domain (specified in the CONFIG section at the top of this file)
 */

function sendRequest (method, url, callback, params, useDefaultHost) {
	"use strict";
	// enable jQuery to make cross-domain requests
	$.support.cors = true;
	
	// if useDefaultHost is undefined or true, then use the hostname specified in CONFIG
	if (typeof useDefaultHost === 'undefined' || useDefaultHost) {
		url = CONFIG.defaultHost + url;
	}

	try {
		if (method.toLowerCase() !== 'get' && method.toLowerCase() !== 'post') {
			throw 'Invalid method "' + method.toUpperCase() + '" was specified. AJAX request could not be completed.' ;
		} else {
			// execute the request
			$.ajax ({
				type: method.toUpperCase(),
				url: url,
				data: params,
				success: callback
			});
		}
	} catch (error) { 
		console.log('[FtW error] AJAX error: ' + error);
		return;
	}
} // end sendRequest() function

// the update() function pulls the patches script from Github and puts its contents in widget.preferences['patches']
function update(callback) {
	"use strict";
	var
		r = new XMLHttpRequest(),
		error = false,
		updated = 0
	;
	
	if (typeof widget.preferences["patches-checksum"] === 'undefined') {
		widget.preferences["patches-checksum"] = '0';
	}
	
	r.onreadystatechange = function() {
		var checksum;
		if (this.readyState === 4 && this.status === 200 || this.responseXML !== '') {
			// Pull the last checksum from localStorage and compare it to the checksum of the most recent commit on Github.
			// If the file was updated, then update the local copy of it
			this.onload = function() {
				widget.preferences.setItem('last-update', Math.ceil(Date.now() / 1000));
				window.sessionStorage.setItem('updated', '1');
				
				if ( this.responseXML && this.responseXML.getElementsByTagName("entry")[0] ) {
					// can't we use querySelector here? it could be much shorter
					// like this: checksum = this.responseXML.querySelector('entry id > *').nodeValue.match(/\/([\d\w]*)/)[1];
					// or xpath: checksum = this.responseXML.selectNodes('//entry//id/*[0]')[0].nodeValue.match(/\/([\d\w]*)/)[1];
					checksum = this.responseXML.getElementsByTagName("entry")[0].getElementsByTagName('id')[0].firstChild.nodeValue.match(/\/([\d\w]*)/)[1];
				} else {
					error = true;	
				}

				updated = (checksum === widget.preferences["patches-checksum"] ? 1 : 0);

				if (typeof checksum !== 'undefined' && checksum !== widget.preferences["patches-checksum"]) {
					widget.preferences["patches-checksum"] = checksum;
					updated = 2;
					
					sendRequest('GET', 'https://raw.github.com/cyberstream/Fix-the-Web-CSS-Patches/master/patches.json', 
						function(data) {
							// TODO if patches.js exceeds the storage quota of one widget.preferences variable, 
							// then split the file's contents up between multiple widget.preferences variables (like the ad block lists in Opera AdBlock)
							// store the patches script in localStorage. Will turn it into a script element in 'includes/include.js'

							widget.preferences.patches = data.replace(/(\r\n|\n|\r)/gm, '');
														
							console.log('Fix the Web\'s patches.json file was just updated.');
						}, null, false);
				} else if (checksum === 'undefined') {
					error = true;
				}
				
				if (typeof callback === 'function') {
					if (error) {
						console.log ('Fix the Web Error:' + error);
						callback(0);
					} else {
						callback(updated);
					}
				}
			};
		}
	};
	
	r.open('GET', 'https://github.com/cyberstream/Fix-the-Web-CSS-Patches/commits/master.atom', true);

	try {
		// Check for security error (Opera is offline)
		r.send();
	} catch(error) {
		console.log('Error: ' + error);
		if (typeof callback === 'function') {
			callback(0);
		}
	}
}

// handle how often the CSS patches are updated
if (widget.preferences.getItem("update-interval")) {
	if (!widget.preferences.getItem("last-update")) {
		widget.preferences.setItem('last-update', '0');
	}
	
	var
		update_interval = widget.preferences.getItem("update-interval"),
		last_update = widget.preferences['last-update']
	;
	// "update-interval" in widget.preferences will determine how often the patches.js file is updated
	// update-interval is in minutes, but setTimeout accepts milliseconds, so convert update-interval to seconds unit
	setTimeout(function() {
		"use strict";
		var
			current_timestamp = Math.ceil(Date.now() / 1000),
			convert
		;
		
		if (update_interval > 0 && update_interval <= 720) {
			if (current_timestamp - last_update >= update_interval * 60) {
				update();
			}
		} else if (update_interval === 0) { // if the value of update interval is "0", then only update the patches file once when the browser starts
			if (window.sessionStorage.getItem('updated') !== 1) {
				update();
			}
		} else if (update_interval > 720 && update_interval < 960 && update_interval % 60 === 0) { 
			// If the value is between 720-960, then it needs special treatment. 
			// These values don't actually mean literal minutes like they did if they passed the first if() condition. 
			// 780 => every day, 840 => once every three days, 900 => once every week
			
			convert = {
				'780': 60 * 60 * 24, // number of seconds in a day
				'840': 60 * 60 * 24 * 3, // number of seconds in three days
				'900': 60 * 60 * 24 * 7
			};
			
			if (current_timestamp - last_update >= convert[update_interval]) {
				update();
			}
		}
	}, 1000 * 60 * 2); // this test will run every 2 minutes to see if the patches file needs to check for an update
}