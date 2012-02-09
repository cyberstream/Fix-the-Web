(function() {
    if (opera.contexts) {
        // Set the properties of the button
        var buttonProperties = {
            disabled: false,
            title: widget.name,
            icon: 'images/icon-18.png',
            popup: {
                href: 'popup.html',
                width: 300,
                height: 450
            }
        }

        // Create the button and add it to the toolbar
        var button = opera.contexts.toolbar.createItem(buttonProperties);
        opera.contexts.toolbar.addItem(button);
    }
})()

// initialize a connection with the popup and send its reference to the injected script so they can both communicate on their own

opera.extension.onconnect = function (event) {
    if(event.origin.indexOf ("popup.html") > -1 && event.origin.indexOf ('widget://') > -1){
        var tab = opera.extension.tabs.getFocused();

        if (tab) tab.postMessage( "send info", [event.source]);
    } 
}

/* function sendRequest() makes sending AJAX requests easier and simpler
 * method: GET
 * url: the URL address to send the request to
 * callback (optional): a callback function to be run when the request completes
 * params (optional): the params in JSON e.g. {key: 'val', key2: 'val2', ...}
 */

function sendRequest (method, url, callback, params) {
    var xhr = new XMLHttpRequest();
   
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

// the update() function pulls the patches script from Github and puts its contents in widget.preferences.patches_js
function update() {
    var r = new XMLHttpRequest();    
    if (typeof widget.preferences["patches-js-checksum"] == 'undefined') 
        widget.preferences["patches-js-checksum"] = '0'
    
    r.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200 || this.responseXML != '') {
            // Pull the last checksum from localStorage and compare it to the checksum of the most recent commit on Github.
            // If the file was updated, then update the local copy of it
            
            if (this.responseXML) var checksum = this.responseXML.getElementsByTagName("entry")[0].getElementsByTagName('id')[0].firstChild.nodeValue.match(/\/([\d\w]*)/)[1]
                      
            if (typeof checksum != 'undefined' && checksum != widget.preferences["patches-js-checksum"]) {
                widget.preferences["patches-js-checksum"] = checksum;

                sendRequest('GET', 'https://raw.github.com/cyberstream/Fix-the-Web-Patch-Script/master/patches.js', 
                    function(data) {
                        // TODO if patches.js exceeds the storage quota of one widget.preferences variable, 
                        // then split the file's contents up between multiple widget.preferences variables (like the ad block lists in Opera AdBlock)
                        // store the patches script in localStorage. Will turn it into a script element in 'includes/include.js'
                        
                        widget.preferences['patches-js'] = data
                        console.log('Fix the Web\'s patches.js file was just updated.');
                    });
            }
        }	
    }
    
    r.open('GET', 'https://github.com/cyberstream/Fix-the-Web-Patch-Script/commits/master.atom', true)

    try {
        r.send()
    } catch(error) {
        console.log('Error: ' + error)
    }
}

if(widget.preferences.getItem("update-interval"))
    // "update-interval" in widget.preferences will determine how often the patches.js file is updated
    // update-interval is in minutes, but setTimeout accepts milliseconds, so convert update-interval to seconds unit
    setTimeout(update(), (widget.preferences.getItem("update-interval") * 1000 * 60)); 

function getOS () {
    sendRequest('GET', 'http://localhost/system_detection.php', function(data) {
        opera.extension.broadcastMessage({'system' : data})
    });
}

opera.extension.onmessage = function(event) {
    if (event.data != 'get_frame_content') return
    
    sendRequest ('GET', 'http://localhost/ajax_request_handler.php?mode=get_frame_content', function(data) {
        event.source.postMessage({frame_content : data})
    });
}