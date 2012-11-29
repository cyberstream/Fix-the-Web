/* Global widget and OAuth configuration */
var CONFIG = {
	defaultHost: 'http://www.operaturkiye.net/fix-the-web/', // the default domain to make AJAX requests to; *must have* the trailing slash "/"
	twitter: {
		consumerKey: 'frKRutacGx6VUkMhwQeJ6Q',
		consumerSecret: 'aUEFth57HGgRQC0pYjkCwrIZUpROLCVvPBZsM4dg',
		requestTokenUrl: 'https://api.twitter.com/oauth/request_token',
		authorizationUrl: 'https://api.twitter.com/oauth/authenticate',
		accessTokenUrl: 'https://api.twitter.com/oauth/access_token'
	}
};

function getUserName (callback) {
	"use strict";
	if (isLoggedIn() && typeof OAuth !== 'undefined') {
		var access_token = widget.preferences.access_token || '',
                                          oauth = new OAuth(CONFIG.twitter),
                                          r;
			
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

/** 
 *      Detect if the user is authenticated
 *      @return {boolean} True if user is logged in, false if user is not logged in
 */

function isLoggedIn () {
	"use strict";
	var access_token = widget.preferences.access_token || '';
	return !(!access_token.length || access_token === '|' || access_token === 'none');
}

/** 
 * Makes sending AJAX requests simpler and more suited to this extension's needs
 * @param {string} method - GET or POST (must use CORS for cross-domain POST requests, otherwise it won't work)
 * @param {string} url - The URL address to send the request to
 * @param {function} callback - Optional; a callback function to be run when the request completes
 * @param {object} params - Optional; the params in JSON format e.g. {key: 'val', key2: 'val2', ...}
 * @param {boolean} useDefaultHost - Optional; whether to use the default domain specified in the CONFIG section at the top of this file. Default is true
 * @param {function} errorFunc - Optional; a function to run if the request fails; three args: XMLHttpRequest, testStatus, errorThrown
 */

function sendRequest (method, url, callback, params, useDefaultHost, errorFunc) {
    "use strict";
    
    // enable jQuery to make cross-domain requests
    $.support.cors = true;
	
    if ( typeof errorFunc !== 'function' ) var errorFunc = function() {};

    // if useDefaultHost is undefined or true, then use the hostname specified in CONFIG
    if (typeof useDefaultHost === 'undefined' || useDefaultHost) {
        var url = CONFIG.defaultHost + url;
    }

    if (method.toLowerCase() !== 'get' && method.toLowerCase() !== 'post') {
        console.log('Invalid method "' + method.toUpperCase() + '" was specified. AJAX request could not be completed.');
        return;
    }
        
    try {
        // execute the request    
        $.ajax ({
                type: method.toUpperCase(),
                url: url,
                data: params,
                success: callback,
                error: errorFunc
        });
    } catch (error) { 
        console.log('[FtW error] AJAX error: ' + error);
        return;
    }
} // end sendRequest() function



/** 
 *  Fetches a complete list of reports for use by the badge
 *  @param {function} callbackFunc - A function to be run when the update process is completed; the first parameter will be the status message.
 */

function updateReportSummary (callbackFunc) {
    var updateReportUrl = 'ajax_request_handler.php?mode=get_reports_summary&last_summary_count=' + widget.preferences['last-reports-count'] || 0,
          callback = (typeof callbackFunc === 'function' ? callbackFunc : function() {});
    
    sendRequest("get", updateReportUrl, function (data) {
        
         // if the data is up to date, then abort the update function
        if ( data == 'current' ) {
            callback ('current');
            return;
        }
        
        try {
            var parsedResponse = JSON.parse(data);
            
            widget.preferences['last-reports-count'] = parsedResponse.total_number;
            widget.preferences['reports-summary'] = JSON.stringify(parsedResponse);
            
            callback ('updated');
            return;
        } catch (e) {
            console.log('[FtW error] badge list could not be updated.');
            callback ('error'); // default action if the callback wasn't called yet
        }
        
        // update the badge in the currently opened tab since the reports list was updated
        if ( typeof ToolbarIcon == 'object' && "init" in ToolbarIcon ) ToolbarIcon.init();       
    }, null, true, function(xhr, statusText, exceptionMessage) {
    
        // If there is a 404, then the connection is down, or the server is down.
        if (xhr.status === 404) 
            callback ('connect-error');
        
        // Otherwise, just return a generic error message
        else
            callback ('error');
    });
}

/** 
*  Checks if the patches stored at http://wedata.net/databases/Fix-the-Web.json have been updated since the last time the extension updated its CSS patches list.
*  @param {function} callback - A function to be called when request is complete; 
*                                                  arg1 is passed the status of the update, arg2 is passed the timestamp of the last DB update.
 */

function cssPatchesAreCurrent (callback) {
    $.ajax ({
        url: 'http://wedata.net/databases/Fix-the-Web.json', 
        dataType: 'json',
        success: function(obj) {
            if ( obj && 'updated_at' in obj ) {
                try {
                    var lastUpdate = (new Date (obj.updated_at)).valueOf(),
                          lastLocalUpdate = widget.preferences['last-patches-update'] || 0;

                    if ( lastLocalUpdate == lastUpdate ) {
                        callback (1, lastUpdate); // 1 = up to date
                        return;
                    } else {
                        callback (2, lastUpdate); // 2 = out of date
                        return;
                    }
                } catch (e) {
                    console.log ('[FtW error] Could not determine if CSS patches are current');
                }
            }
            
            callback (0, 0); // default return value
        }, 
        error: function(xhr, status, exception) {
            callback (0, 0);
            console.log ('[FtW error] Could not determine if CSS patches are current');
        }
    });
}

/**
 * Pulls JSON patches file from Wedata and stores it locally
 * @param {function} callback - callback function; update status is passed to the first argument
 */

function update (callback) {
    "use strict";
    
    cssPatchesAreCurrent(function(status, lastDbUpdate) {
        
        // make sure the list is out of date before updating it
        if ( status == 2 ) {
            $.ajax ({
                url: 'http://wedata.net/databases/Fix-the-Web/items.json', 
                dataType: 'json',
                success: function(obj) {
                    
                    // make sure an array was returned before treating it like one
                    if ( obj && obj instanceof Array ) {
                        
                        // condense returned data to exclusively the patches
                        var condensedList = [];
                        
                        for ( i in obj ) {
                            var thisObj = obj[i];
                            if (thisObj && "data" in thisObj) {
                                condensedList.push(thisObj.data)
                            }
                        }
                        
                        try {
                            var stringified = JSON.stringify(condensedList);
                            
                            // update the locally-stored patches if stringification was successful
                            if ( stringified ) {
                                widget.preferences.patches = stringified.replace(/(\r\n|\n|\r)/gm, '');
                                widget.preferences['last-patches-update'] = lastDbUpdate;
                                
                                callback (2); // CSS Patches updated!
                                return;
                            }                            
                        return;
                        } catch (e) {
                            console.log ('[FtW error] Could not update the CSS patches list');
                        }
                    }

                    callback (0); // default return value
                }, 
                error: function(xhr, status, exception) {
                    callback (0);
                    console.log ('[FtW error] Could not update the CSS patches list');
                }
            });
        } else callback (status);
    });
}

/**
 * Updates the report summary list and assigns the current timestamp to a session storage item for later use
 */

function updateSummaryList () {
    updateReportSummary (function(message) {

        // update the session storage item with the current timestamp
        if ( message === 'updated' || message === 'current' ) 
            sessionStorage.summaryList = (new Date()).valueOf();
    });
}

// update the badge summary each time the browser is opened or every 8 hours, whichever comes first
if ( typeof sessionStorage.summaryList == 'undefined' ) updateSummaryList();

// handle how often the CSS patches are updated
if ( widget.preferences.getItem('update-interval') ) {
    if (!widget.preferences.getItem('last-patches-update')) {
        widget.preferences.setItem('last-patches-update', '0');
    }

    var update_interval = widget.preferences.getItem('update-interval'),
          last_update = widget.preferences['last-patches-update'];

    // 'update-interval' in widget.preferences will determine how often the CSS patches are updated
    // update-interval is in minutes, but setTimeout accepts milliseconds, so convert update-interval to the seconds unit
    setInterval ( function() {
        "use strict";
        
        // SECTION: Reports summary list update
        var currentTime = (new Date()).valueOf();
        
        if ( typeof sessionStorage.summaryList !== 'undefined' && currentTime > sessionStorage.summaryList ) {
            
            // if 8 hours or more has elapsed since the last badge list update, then update the list
            if ( (currentTime - sessionStorage.summaryList) >= (1000 * 60 * 60 * 8) ) updateSummaryList();
        }
        
         // If the sessionStorage.summaryList is not a valid number, then update the report summary list.
        else updateSummaryList();
        
        // SECTION: CSS patches update
        var current_timestamp = Math.ceil(Date.now() / 1000),
                                  convert;

        if (update_interval > 0 && update_interval <= 720) {
            if (current_timestamp - last_update >= update_interval * 60) {
                update();
            }
        } 

        // if the value of update interval is "0", then only update the patches file once when the browser starts
        else if (update_interval === 0) {
            if (window.sessionStorage.getItem('updated') !== 1) {
                update();
            }
        } 

        else if (update_interval > 720 && update_interval < 960 && update_interval % 60 === 0) { 
        // If the value is between 720-960, then it needs special treatment. 
        // These values don't actually mean literal minutes like they did if they passed the first if() condition. 
        // 780 => every day, 840 => once every three days, 900 => once every week

        convert = {
            '780': 60 * 60 * 24, // number of seconds in a day
            '840': 60 * 60 * 24 * 3, // number of seconds in three days
            '900': 60 * 60 * 24 * 7 // seconds in a week
        };

            if (current_timestamp - last_update >= convert[update_interval]) {
                    update();
            }
        }
    }, 1000 * 60 * 2); // this test will run every 2 minutes to see if the patches file needs to check for an update
}