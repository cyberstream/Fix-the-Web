(function() {
    if (opera.contexts) {
        // Set the properties of the button
        var buttonProperties = {
            disabled: false,
            title: widget.name,
            icon: 'icon-18.png',
            popup: {
                href: 'popup.html',
                width: 300,
                height:450
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

// the update() function pulls the patches script from Github and puts its contents in widget.preferences.patches_js

function update() {
    var r = new XMLHttpRequest(),
          xhr = new XMLHttpRequest();
    
    if (typeof widget.preferences.update_js_checksum == 'undefined') widget.preferences.update_js_checksum = '0'
    
    r.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200 || this.responseXML != '') {
            // Pull the last checksum from localStorage and compare it to the checksum of the most recent commit on Github.
            // If the file was updated, then update the local copy of it
            
            console.log(this.responseXML)
            window.xhr = this.responseXML
            
            if (this.responseXML) var checksum = this.responseXML.getElementsByTagName("entry")[0].getElementsByTagName('id')[0].firstChild.nodeValue.match(/\/([\d\w]*)/)[1]
           
            if (typeof checksum != 'undefined' && checksum != widget.preferences.update_js_checksum) {
                widget.preferences.update_js_checksum = checksum;

                xhr.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200 && this.responseText != '') {
                        // TODO if patches.js exceeds the storage quota of one widget.preferences variable, 
                        // then split the file's contents up between multiple widget.preferences variables (like the ad block lists in Opera AdBlock)

                        // store the patches script in localStorage. Will turn it into a script element in 'includes/include.js'
                        widget.preferences.patches_js = this.responseText 
                        console.log('Fix the Web\'s patches.js file was just updated.')
                    }	
                }

                xhr.open('GET', 'https://raw.github.com/cyberstream/Fix-the-Web-Patch-Script/master/patches.js', true)

                try {
                    xhr.send()
                } catch(error) {
                    console.log('Error: ' + error)
                }
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
    setTimeout(update(), widget.preferences.getItem("update-interval")); // TODO "update_interval" in widget.preferences will determine how often the patches.js file is updated

function loadCommentsFrame() {
    opera.extension.broadcastMessage('load comments frame') // fire this message for the injected script to catch and open the comments frame
}

function sendReport(report_details) {
    // send report asynchronously to the server with ajax_request_handler.php on it 
    // see the "Fix the Web Server Side" repo on Github for that file
}

