/* Fix the Web's Javascript patches file
* 
* Guidelines: 
* - Restrict your fix to the broken site or pages with an "if ()" block.
* - Do not leak any variables to the global scope.
* - If the site problem only needs CSS to be fixed, then use the CSS patches file: includes/cssPatches.js.
*/

(function() {    
    var host_name = window.location.hostname, // e.g. opera.com
          href = window.location.href, // e.g. http://opera.com/download/
          path_name = window.location.pathname, // e.g. /download/
          opera_version = window.opera.version(), // e.g. 12.10
          opera_build = window.opera.buildNumber(); // e.g. 1640
              		
    // PATCH-1 (11.61, patch added, forum.memurlar.net) Fixed undesireable cell align of the forum table
    if (host_name.indexOf('forum.memurlar.net') > -1 && path_name.indexOf('kategori') > -1) {

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
    else if ( host_name.indexOf('goldas.com') > -1 ) {       
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
})();