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
    // TODO: store the file's checksum in localStorage and only update the file when the checksum is new
    
    var r = new XMLHttpRequest();
	
    r.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200 || this.responseText != '') { 
                // TODO if patches.js exceeds the storage quota of one widget.preferences variable, 
                // then split the file's contents up between multiple widget.preferences variables (like the ad block lists in Opera AdBlock)
                
                // store the patches script in localStorage. Will turn it into a script element in 'includes/include.js'
                widget.preferences.patches_js = this.responseText 
                console.log('Fix the Web\'s patches.js file was just updated.')
            }
        }	
    }

    r.open('GET', 'https://raw.github.com/cyberstream/Fix-the-Web-Patch-Script/master/patches.js', true)

    try {
        r.send()
    } catch(error) {
        console.log('Error: ' + error)
    }
}

setTimeout(update(), 1000 * 60 * 30); // TODO "update_interval" in widget.preferences will determine how often the patches.js file is updated

function loadCommentsFrame() {
    opera.extension.onconnect = function() {
        
    }
}

function sendReport(report_details) {
    // send report asynchronously to the server with ajax_request_handler.php on it 
    // see the "Fix the Web Server Side" repo on Github for that file
}