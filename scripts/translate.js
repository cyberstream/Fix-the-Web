docElements = document.querySelectorAll('[data-i18n], [data-i18n-attr]')

if ( typeof i18n != 'undefined' && typeof $ != 'undefined' ) {
    addEventListener('load', function() {
        var domText = document.getElementsByTagName('html')[0].innerHTML
              placeholders = domText.match(/{{(.*?)}}/igm).map(function(v) {
                                           return v.replace(/({|})/igm, '').toLowerCase();
                                       });
        
        for ( i = 0; i < placeholders.length; i++ ) {
            var thisPlaceholder = placeholders[i],
                  thisPhRegex = new RegExp('{{' + thisPlaceholder + '}}', 'igm');
            
            if (i18n[thisPlaceholder] != 'undefined') {
                for ( j = 0; j < docElements.length; j++ ) {
                    var thisElement = docElements[j],
                          translateAttr = thisElement.getAttribute('data-i18n-attr')
                    
                    thisElement.innerHTML = docElements[j].innerHTML.replace(thisPhRegex, i18n[thisPlaceholder])
                    
                    // translate the specified attribute node
                    if ( translateAttr && thisElement.getAttribute(translateAttr) ) {
                        thisElement.setAttribute(translateAttr, thisElement.getAttribute(translateAttr).replace(thisPhRegex, i18n[thisPlaceholder]))
                    }
                }
            }
        }
    });
}