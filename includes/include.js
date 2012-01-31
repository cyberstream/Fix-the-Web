// give the current page's URL and domain name to the popup when it's opened

opera.extension.onmessage = function(event){
    if(event.data == "send info") {
        var channel = new MessageChannel();
        event.ports[0].postMessage({'url' : document.URL, 'domain' : document.domain}, [channel.port2]); 
    }
}    
    

window.addEventListener('DOMContentLoaded', function() {    
    if (typeof widget.preferences.patches_js == 'undefined') widget.preferences.patches_js = '';
    
    var patches_js = widget.preferences.patches_js,    
          script_tag = document.createElement('script');
          
    script_tag.appendChild(document.createTextNode(patches_js))
    script_tag.setAttribute('type', 'text/javascript')
    
    document.body ? document.body.appendChild(script_tag) : document.getElementsByTagName('html')[0].appendChild(document.createElement('body'))
}, false);