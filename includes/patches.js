/* Opera's "Fix the Web" JS patch file
* Broken web page fixes
* 
* Guidelines: 
* - Restrict your fix the the broken site or pages with an "if ()" block.
* - Do not leak any variables to the global scope.
* - If the site problem only needs CSS to be fixed, use the CSS patches file: http://github.com/cyberstream/Fix-the-Web-CSS-Patches
*/

(function() {
    var hostname = location.hostname,
                              href = location.href, 
                              pathname = location.pathname,
                              opera_version = opera.version(),
                              opera_build = opera.buildNumber();
    		
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
})()