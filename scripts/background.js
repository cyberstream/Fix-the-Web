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
                height:128
            }
        }

        // Create the button and add it to the toolbar
        var button = opera.contexts.toolbar.createItem(buttonProperties);
        opera.contexts.toolbar.addItem(button);
    }
})()

// function pulls the latest updated patches script from Github and puts its contents in widget.preferences.patches_js

function update() {
    var r = new XMLHttpRequest();
	
    r.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200 || this.responseText != '') {
                widget.preferences.patches_js = this.responseText
            }
        }	
    }

    r.open('GET', 'http://localhost/patches.js', true)

    try {
        r.send()
    } catch(error) {
        console.log('Error: ' + error)
    }
}

