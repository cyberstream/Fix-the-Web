/* Opera's "Fix the Web" JS patch file
* Broken web page fixes
* 
* Guidelines: 
* - Restrict your fix the the broken site or pages with an "if ()" block.
* - Do not leak any variables to the global scope.
* - If the site problem only needs CSS to be fixed, use the CSS patches file: http://github.com/cyberstream/Fix-the-Web-CSS-Patches
*/

(function() {    
    var hostname = window.location.hostname,
          href = window.location.href, 
          pathname = window.location.pathname,
          opera_version = window.opera.version(),
          opera_build = window.opera.buildNumber();
    		
    // PATCH-1 (11.61, patch added, forum.memurlar.net) Fixed undesireable cell align of the forum table
    if (hostname.indexOf('forum.memurlar.net') > -1 && pathname.indexOf('kategori') > -1) {

        var c=document.getElementsByTagName('table'); 
        var c_adet = c.length;

        var m=0,i=0;
        for (m = 0; m < c_adet; m++) {
            if (c[m].getAttribute('width') == '100%' && c[m].getAttribute('cellpadding') == '2' && c[m].getAttribute('cellspacing') == '1') {
                var k1=c[m].getElementsByTagName('thead');
                var k2=k1[0].getElementsByTagName('tr');
                var k3=k2[0].getElementsByTagName('th');
                k2[0].removeChild(k3[0]);
                break;
            }
        }

        var bb=document.getElementsByTagName('tr'); 
        var bb_adet = bb.length;
        for (i = 0; i < bb_adet; i++) {
            if (bb[i].getAttribute('class') == 'Even' || bb[i].getAttribute('class') =='Prior') {
                var td_ele=bb[i].getElementsByTagName('td');
                bb[i].removeChild(td_ele[0]);
            }
        }    
    }
    
    // PATCH-2 (11.62, patch added, goldas.com) fixed submenus on the page
    else if ( hostname.indexOf('goldas.com') > -1 ) {       
            window.opera = false;
    }
})()

/* * * * END JAVASCRIPT PATCHES SECTION * * * * 
 * * * * BEGIN importing CSS patches * * *
 */

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
        head.appendChild(style_tag)
    } else addEventListener ('DOMContentLoaded', addCSS(css), false);
}

// get the patches.js script from localStorage and create a script element on the page with its contents

window.addEventListener('DOMContentLoaded', function() {       
    var domain = window.location.hostname,
          url = window.location.href, 
          path = window.location.pathname;
    
    if (typeof widget.preferences['patches'] == 'undefined') widget.preferences['patches'] = '';
    
    var patches = JSON.parse(widget.preferences['patches']) || [];
    
    // loop through the patches if there are any in the array
    if ( typeof patches == 'object' && patches instanceof Array && patches.length ) {
        
        // loop through the object (the loop is labeled "main" so that we can send commands to it from a sub-loop)
        main: for ( i in patches ) {
            var patch = patches[i],
            
                  target = patch.patch_target,
                  version = patch.opera_version,
                  status = patch.status,
                  comment = patch.comment,
                  css = patch.css_patch;
            
            // ensure this is a valid patch before parsing it
            if (typeof target == 'undefined' || typeof version == 'undefined' || typeof status == 'undefined' || typeof comment == 'undefined' || typeof css == 'undefined') continue;
                              
            if (target) {
                
                // if the target is a regular expression and the hostname does not match it, then continue
                if ( typeof target == 'object' && target instanceof RegExp )
                    if ( domain.search(target) == -1 ) continue;
                
                // if the target is an object, then parse it and test the values
                else if ( typeof target == 'object' ) {
                    j = 0;
                    for ( k in target ) {                        
                        var string_to_search;
                        j++;
                        
                        if ( k == 'href' || k == 'url' ) string_to_search = url;
                        else if ( k == 'pathname' || k == 'path' ) string_to_search = path;
                        else if ( k == 'hostname' || k == 'host' || k == 'domain' ) string_to_search = domain;
                        else if ( typeof target[k] == 'object' && target[k] instanceof Array ) {
                            var regex, search_string;
                            
                            if ( target[k].length == 1 ) regex = new RegExp( target[k][0] );
                            else if ( target[k].length == 2 ) regex = new RegExp( target[k][0], target[k][1] );
                            
                            if ( k == 'href_regex' || k == 'url_regex' ) search_string = url;
                            else if ( k == 'pathname_regex' || k == 'path_regex' ) search_string = path;
                            else if ( k == 'hostname_regex' || k == 'host_regex' || k == 'domain_regex' ) search_string = domain; 
                            else continue;
                            
                            if ( !regex.test(search_string) ) continue main;
                        }
                        else continue; // ignore the rule if it isn't valid
                        
                        // convert strings to lowercase                                                
                        if (target[k] instanceof String) {
                            string_to_search == string_to_search.toLowerCase();
                            target[k] = target[k].toLowerCase()
                            
                            // if the specified string doesn't successfully get matched, then make the main loop continue to the next iteration
                            if ( string_to_search.search(target[k]) == -1 ) continue main;
                        }
                    }
                }
                
                // if this is a string and it does not match anything in the hostname, then continue to the next iteration in the loop
                else if ( hostname.toLowerCase().indexOf(target.toLowerCase()) == -1 ) continue;
                
                // If the loop *continued*, then it will not make it to this code in the current iteration.
                // Add the css in the patch to the current page.
                addCSS (css);
            }
        }
    }
}, false);
    
// run Prefixr if it is enabled in the options page (From Christoph142's CSS3 Prefixr extension (https://addons.opera.com/addons/extensions/details/css-prefixr), used with permission)
if ( widget.preferences.getItem('prefixr') != 'false' ) {
    window.addEventListener('DOMContentLoaded', function() { //intern CSS-code in head
        var excluded = widget.preferences.getItem('prefixr-exclude');

        if (excluded != '') {
            var excluded_array = JSON.parse(excluded),
                domain = window.location.hostname

            if (window.location.href.indexOf('http') != 0) return; // abort the prefixr function: this is not a valid web page

            for ( i = 0; i < excluded_array.length; i++ ) {
                if ( domain.indexOf (excluded_array[i]) > -1 ) return; // abort the prefixr funtion: this site was found in the excluded sites list
            }
        }

        var style_elements = document.getElementsByTagName("style");

        for (var i=0; i < style_elements.length; i++) {
            var style = style_elements[i].innerHTML;

            if (style.search(/-(moz|ms|webkit|o)-/gim) != -1 || style.search(/(?!-o-)(transition|transform|animation)/gim) != -1) {
                console.log('3 passed')
                style = style.replace(/[^-](transition|transform|animation)/gim,"-o-$1"); // -o--prefix CSS3 styles without prefix
                style = style.replace(/-(moz|ms|webkit|o)-(border-(image|radius)|box-shadow)/gim, '$2'); // create prefixfree versions for all known working properties
                style = style.replace(/-(moz|ms|webkit)-([^:])/gim,'-o-$2'); // change prefixes to -o- for all of the remaining ones
                style = style.replace(/(-o-[^;]+;\s*)\1+/gim,"$1"); // removes duplicates of -o-properties
                style_elements[i].innerHTML = style;
            }
        }
    }, false);

    window.opera.addEventListener('BeforeCSS', function(userJSEvent){ // external CSS-files
        if(userJSEvent.cssText.search(/(-(moz|ms|webkit|o)-)?(transition|transform|animation)/gim)!=-1){
            userJSEvent.cssText = userJSEvent.cssText.replace(/[^-](transition|transform|animation)/,"-o-$1");
            userJSEvent.cssText = userJSEvent.cssText.replace(/-(moz|ms|webkit|o)-(border-(radius|image)|box-shadow)/gim,'$2');
            userJSEvent.cssText = userJSEvent.cssText.replace(/-(moz|ms|webkit)-([^:])/gim,'-o-$2');
            userJSEvent.cssText = userJSEvent.cssText.replace(/(-o-[^;]+;\s*)\1+/gim,"$1");
        }
    }, false);
}