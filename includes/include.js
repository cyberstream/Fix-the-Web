window.addEventListener('DOMContentLoaded', function() {


    if (typeof widget.preferences.patches_js == 'undefined') widget.preferences.patches_js = '';
    
    var patches_js = widget.preferences.patches_js,    
          script_tag = document.createElement('script');
          
    script_tag.appendChild(document.createTextNode(patches_js))
    script_tag.setAttribute('type', 'text/javascript')
    
    document.body ? document.body.appendChild(script_tag) : document.getElementsByTagName('html')[0].appendChild(document.createElement('body'))
}, false);