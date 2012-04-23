(function() {
    if ( widget.preferences.getItem('browser-id') && typeof window.navigator != 'undefined' ) {
        if ( widget.preferences.getItem('browser-id').search(/(ie|firefox|chrome)/i) > -1 ) {
            var navigator = window.navigator,
                  platform = navigator.userAgent.match(/\((.*?);/);
            
            if (platform.length > 1) platform = platform[1];
            else platform = 'Windows NT 6.1';

            switch (widget.preferences.getItem('browser-id')) {
                case 'ie' : // mask as IE
                    navigator.appName = 'Microsoft Internet Explorer'
                    navigator.appVersion = '5.0 (compatible; MSIE 9.0; ' +platform+ '; Trident/5.0;)'
                    navigator.userAgent = 'Mozilla/5.0 (compatible; MSIE 9.0; ' +platform+ '; Trident/5.0)'
                    break;
                case 'firefox' : // mask as Firefox
                    navigator.appName = 'Netscape'
                    navigator.appVersion = '5.0 (' +platform+ ')'
                    navigator.product = 'Gecko'
                    navigator.userAgent = 'Mozilla/5.0 (' +platform+ '; rv:10.0.2) Gecko/20100101 Firefox/10.0.2'
                    break;
                case 'chrome' : 
                    navigator.appName = 'Netscape'
                    navigator.appVersion = '5.0 (' +platform+ ') AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1068.1 Safari/536.3'
                    navigator.product = 'Gecko'
                    navigator.vendor = 'Google Inc.'
                    navigator.userAgent = 'Mozilla/5.0 (' +platform+ ') AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1068.1 Safari/536.3'
                    break;
            }
        }
    }
})();