// run Prefixr if it is enabled in the options page (From Christoph142's CSS3 Prefixr extension (https://addons.opera.com/addons/extensions/details/css-prefixr), used with permission)

window.addEventListener('BeforeCSS', function(userJSEvent) { // external CSS files
    if (!prefixr_enabled()) return; // abort the function if prefixr is disabled entirely or just on this site
    
    if( window.opera.buildNumber() != widget.preferences.lastbuild ) {update_supported_properties();}

    if ( userJSEvent.cssText.search(/-(moz|ms|webkit|khtml|o)-/) != -1 ) {
        userJSEvent.cssText = userJSEvent.cssText.replace(/[^-](transition|transform|animation)/, "-o-$1");
        userJSEvent.cssText = userJSEvent.cssText.replace(new RegExp(widget.preferences.prefixfree, "gim"),'$2');
        userJSEvent.cssText = userJSEvent.cssText.replace(/-(moz|ms|webkit|khtml)-([^:])/gim, '-o-$2');
        userJSEvent.cssText = userJSEvent.cssText.replace(/(-o-[^;]+;\s*)\1+/gim, "$1");
    }
}, false);

window.addEventListener('DOMContentLoaded', function() { // internal CSS styles
    if (!prefixr_enabled()) return; // abort the function if prefixr is disabled entirely or just on this site
    
    if ( window.opera.buildNumber() != widget.preferences.lastbuild ) {update_supported_properties();}

    // Style tags in the document's head:
    for ( i = 0; i < document.getElementsByTagName("style").length; i++ ) {
        var style = document.getElementsByTagName("style")[i].innerHTML;

        if ( style.search(/-(moz|ms|webkit|khtml|o)-/) != -1 ) {
            style = style.replace(/[^-](transition|transform|animation)/gim,"-o-$1"); // -o--prefix CSS3 styles without prefix
            style = style.replace(new RegExp(widget.preferences.prefixfree,"gim"),'$2'); // create prefixfree versions for all known working properties
            style = style.replace(/-(moz|ms|webkit|khtml)-([^:])/gim,'-o-$2'); // change prefixes to -o- for all of the remaining ones
            style = style.replace(/(-o-[^;]+;\s*)\1+/gim,"$1"); // removes duplicates of -o-properties
            document.getElementsByTagName("style")[i].innerHTML = style;
        }
    }

    // Style properties in the document's body:
    if ( document.body.outerHTML.search(/-(moz|ms|webkit|khtml|o)-/) != -1 ) {
        var bodystyles = document.body.outerHTML,
            original, prefixed,
            regexp = /(<[^>]*style=[^<]*>)/gim;

        while ( regexp.test(bodystyles) ) {
            original = RegExp.$1;            
            prefixed = RegExp.$1.replace(/[^-](transition|transform|animation)/,"-o-$1");
            prefixed = prefixed.replace(new RegExp(widget.preferences.prefixfree,"gim"),'$2');
            prefixed = prefixed.replace(/-(moz|ms|webkit|khtml)-([^:])/gim,'-o-$2');
            prefixed = prefixed.replace(/(-o-[^;]+;\s*)\1+/gim,"$1");
            bodystyles = bodystyles.replace(original, prefixed);
        }

        document.body.outerHTML = bodystyles;
    }
}, false);

function prefixr_enabled() {
    if ( widget.preferences.prefixr == 'false' ) return false; // prefixr is disabled
    else {
        if (widget.preferences.getItem('prefixr-exclude')) {
            var excluded_array = JSON.parse(widget.preferences.getItem('prefixr-exclude')),
                domain = window.location.hostname, 
                url = window.location.href;

            if (url.indexOf('http') != 0) abort = true; // abort the prefixr function: this is not a valid web page
            else {
                for ( i = 0; i < excluded_array.length; i++ ) {
                    if ( domain.indexOf (excluded_array[i]) > -1 ) { // abort the prefixr funtion: this site was found in the excluded sites list
                        return false; // prefixr is disabled on this site
                    } 
                }
            }
        }
        
        return true;
    }
}

function update_supported_properties() {
    var possible_properties = ['BorderImage', 'boxShadow', 'Transform', 'Animation', 'Transition', 'borderRadius'],
        equivalents = ['border-image IS HANDLED SEPARATELY', 'box-shadow', 'transform', 'animation', 'transition', 'border-radius'],
        supported_ones = ""; // list of properties, which are supported without prefix

    for ( i = 0; i < possible_properties.length; i++ ) {        
        if ( typeof document.documentElement.style[possible_properties[i]] == "string" ) {

            //if the property value is a string (versus undefined) and thus is supported, don't add it
            if ( i == 0 ) supported_ones = "border";
            else supported_ones = supported_ones + "|" + equivalents[i];
        }             
        else {
            if ( i == 0 ) supported_ones = "border[^-image]";
        }
    }

    widget.preferences.prefixfree = "-(moz|ms|webkit|o)-(" + supported_ones + ")";
    widget.preferences.lastbuild = window.opera.buildNumber();
}