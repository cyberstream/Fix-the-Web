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
        window.addEventListener('DOMContentLoaded', function() {            
            var new_function = function P7AniMagic(el,x,y,a,b,c,s) { //v2.9 PVII-Project Seven Development
                    var xx,yy,i,g,elo=el,f="",m=false,d="",pa='px';
                    x=parseInt(x);y=parseInt(y);var t='g.p7Magic=setTimeout("P7AniMagic(\''+elo+'\','; 
                    if((g=MM_findObj(el))!=null){d=(document.layers)?g:g.style;}else{return;}
                    if(parseInt(s)>0){eval(t+x+','+y+','+a+','+b+','+c+',0)",' + s+')');return;}
                    xx=parseInt(d.left);if(isNaN(xx)){if(g.currentStyle){xx=parseInt(g.currentStyle.left);
                    }else if(document.defaultView&&document.defaultView.getComputedStyle){
                    xx=parseInt(document.defaultView.getComputedStyle(g,"").getPropertyValue("left"));}
                    if(isNaN(xx)){xx=0;}}yy=parseInt(d.top);if(isNaN(yy)){if(g.currentStyle){yy=parseInt(g.currentStyle.top);
                    }else if(document.defaultView&&document.defaultView.getComputedStyle){
                    yy=parseInt(document.defaultView.getComputedStyle(g,"").getPropertyValue("top"));}
                    if(isNaN(yy)){yy=0;}}if(c==1){x+=xx;y+=yy;m=true;c=0;}else if(c==2){m=false;
                    if(g.p7Magic){clearTimeout(g.p7Magic);}}else{i=parseInt(a);if(g.p7Magic){clearTimeout(g.p7Magic);}
                    if(xx<x){xx+=i;m=true;if(xx>x){xx=x;}}if(xx>x){xx-=i;m=true;if(xx<x){xx=x;}}
                    if(yy<y){yy+=i;m=true;if(yy>y){yy=y;}}if(yy>y){yy-=i;m=true;if(yy<y){yy=y;}}}
                    if(m){d.left=xx+pa;d.top=yy+pa;eval(t+x+','+y+','+a+','+b+','+c+',0)",'+b+')');} 
                }, 
                tag = document.createElement('script');
                
            tag.appendChild(document.createTextNode(new_function.toString()));
            document.body.appendChild(tag);
        }, false);
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

window.addEventListener('load', function() {
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
            if (typeof target == 'undefined' || typeof version == 'undefined' || typeof status == 'undefined' || typeof comment == 'undefined' || typeof css == 'undefined') {
                continue;
            }
                              
            if (target) {
                
                // if the target is an object, then parse it and test the values
                if ( typeof target == 'object' ) {
                    for ( k in target ) {
                        var regex, search_string;
                        
                        // convert strings to lowercase                                                
                        if ( k.search(/(href|url|path(name)?|host(name)?|domain)/i) ) {
                            if ( k == 'href' || k == 'url' ) string_to_search = url;
                            else if ( k == 'pathname' || k == 'path' ) string_to_search = path;
                            else if ( k == 'hostname' || k == 'host' || k == 'domain' ) string_to_search = domain;
                            else continue; // invalid identifier
                            
                            // if the specified string doesn't successfully get matched, then make the main loop continue to the next iteration
                            if ( string_to_search.toLowerCase().search(target[k].toLowerCase()) == -1 ) continue main;
                        }
                        
                        else if ( k.search(/(href|url|path(name)?|host(name)?|domain)_regex/i) ) { 
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
}, false);