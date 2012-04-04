docElements = document.querySelectorAll('*:not(html):not(script):not(body):not(head):not(meta):not(link):not(style), style.translate')

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
                    var thisElement = docElements[j];
//                    console.log([thisElement.innerHTML, docElements[j].innerHTML.replace(thisPhRegex, i18n[thisPlaceholder])])
                    
                    $(thisElement).html(docElements[j].innerHTML.replace(thisPhRegex, i18n[thisPlaceholder]))
                }
            }
        }
        
//        document.getElementsByTagName('html')[0].innerHTML = domText;
    });
}