/* Fix the Web's CSS patches file
 * 
 * NOTE: Patches are not placed within this file. 
 *             Patches are stored remotely, downloaded, and stored in widget.preferences.patches.
 *             
 *  TO CREATE A NEW CSS PATCH: [check http://my.opera.com/fix-the-web/blog]
 *  
 *  If the broken website you want to fix requires more than a CSS patch, 
 *  then consider creating a Javascript patch and placing it in includes/patches.js.
 */

(function() {
    
    // add CSS to the web page
    function addCSS ( css ) {

        // detect if the page is loaded; if it isn't, then make it run when the page is loaded
        if ( document.addEventListener ) {

            // If the head element doesn't exist, create it and insert it into the DOM tree
            if ( !document.getElementsByTagName('head').length ) {
                var new_head = document.createElement('head'),
                    root = document.getElementsByTagName('html')[0],
                    children = root.childNodes,
                    firstChild = children.length ? children[0] : false;

                if (firstChild) firstChild.parentNode.insertBefore(new_head, firstChild);
                else root.appendChild(new_head);
            }

            // create the style tag and put the contents of the "css" parameter into the element        
            var head = document.getElementsByTagName('head')[0],
                style_tag = document.createElement('style');

            style_tag.setAttribute('type', 'text/css');
            style_tag.appendChild(document.createTextNode(css));

            // append the style element to the head element
            head.appendChild(style_tag);
        } else addEventListener ('DOMContentLoaded', addCSS(css), false);
    }
    
    // get the CSS patches from localStorage and add them to the page if they are needed on this page    
    var domain = window.location.hostname,
          url = window.location.href, 
          path = window.location.pathname;

        if (typeof widget.preferences['patches'] == 'undefined') widget.preferences['patches'] = '';

        try {
            var patches = JSON.parse(widget.preferences['patches']) || [];
        } catch(e) {
            alert('Patches failed!');
            console.log(e)
        }

        // loop through the patches if there are any in the array
        if ( typeof patches == 'object' && patches instanceof Array && patches.length ) {
            // loop through the object (the loop is labeled "main" so that we can send commands to it from a sub-loop)
            main: for ( i in patches ) {
                var patch = patches[i],

                      target = patch.target,
                      version = patch.operaVersion,
                      status = patch.status,
                      comment = patch.comment,
                      css = patch.patch;

                // ensure this is a valid patch before parsing it
                if (typeof target == 'undefined' || typeof version == 'undefined' || typeof status == 'undefined' || typeof comment == 'undefined' || typeof css == 'undefined') {
                    continue;
                }

                if ( target ) {
                    
                    // if the target is an object, then parse it and test the values
                    if ( typeof target == 'object' ) {
                        for ( k in target ) {
                            var regex, search_string;
                            
                            // convert strings to lowercase                                                
                            if ( k.search(/(href|url|path(name)?|host(name)?|domain)/i) > -1 ) {
                                if ( k == 'href' || k == 'url' ) string_to_search = url;
                                else if ( k == 'pathname' || k == 'path' ) string_to_search = path;
                                else if ( k == 'hostname' || k == 'host' || k == 'domain' ) string_to_search = domain;
                                else continue; // invalid identifier
                                
                                // if the specified string doesn't successfully get matched, then make the main loop continue to the next iteration
                                if ( string_to_search.toLowerCase().search(target[k].toLowerCase()) == -1 ) continue main;
                            }

                            else if ( k.search(/(href|url|path(name)?|host(name)?|domain)_regex/i) > -1 ) { 
                                if ( target[k].length == 1 ) regex = new RegExp( target[k][0] );
                                else if ( target[k].length == 2 ) regex = new RegExp( target[k][0], target[k][1] );
                                else continue;

                                if ( k == 'href_regex' || k == 'url_regex' ) search_string = url;
                                else if ( k == 'pathname_regex' || k == 'path_regex' ) search_string = path;
                                else if ( k == 'hostname_regex' || k == 'host_regex' || k == 'domain_regex' ) search_string = domain; 
                                else continue; // invalid identifier

                                if ( !regex.test(search_string) ) continue main;
                            }

                            else continue; // ignore the rule if it isn't valid
                        }
                    }

                    // if this is a string and it does not match anything in the hostname, then continue to the next iteration in the loop
                    else if ( domain.toLowerCase().indexOf(target.toLowerCase()) == -1 ) continue;

                    // If the loop had *continued*, then it would not have made it to this code during this current iteration
                    // Add the css in the patch to the current page
    //                console.log('Patching: ' + css)
                    addCSS (css);
                }
            }
        }
})();