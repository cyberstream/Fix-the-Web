// give the current page's URL and domain name to the popup when it's opened

opera.extension.onmessage = function(event){
    if(event.data == "send info") {
        var channel = new MessageChannel();
        event.ports[0].postMessage({'url' : document.URL, 'domain' : document.domain}, [channel.port2]); 
    }
    
    resizeFrame = function(e) {                    
                                if (window.innerHeight - e.pageY >= 10 && e.pageY > 10)
                                    document.getElementById('fix-the-web-comment-frame').style.height = 100 - Math.floor((e.pageY / window.innerHeight) * 100) + '%'
                            }
    
    if (event.data == "load comments frame") {
        if (!document.getElementById('fix-the-web-comment-frame')) {
            var frame_element = document.createElement('div');
                  frame_element.id = 'fix-the-web-comment-frame';
                  frame_element.className = 'fadeout_state';
            
            var resize_frame = document.createElement('div'),
                  close_frame = document.createElement('span'),
                  minimize_frame = document.createElement('span')
                  frame_content_container = document.createElement('div');
                  
            resize_frame.id = 'resize-frame';
            close_frame.id = 'close-frame';
            minimize_frame.id = 'minimize-frame';
            minimize_frame.className = 'is_maximized';
            frame_content_container.id = 'frame-content';
            frame_content_container.appendChild(document.createTextNode('There are no reported bugs on this website.'))
            
            close_frame.appendChild(document.createTextNode('x'));
            
            resize_frame.appendChild(close_frame);
            resize_frame.appendChild(minimize_frame);
            
            // close the frame when the "x" is clicked
            close_frame.addEventListener('click', function() { 
                document.getElementById('fix-the-web-comment-frame').className = 'fadeout_state' // trigger frame fade-out animation with CSS3 transitions by changing the className

                setTimeout(function() {
                    document.getElementById('fix-the-web-comment-frame').parentNode.removeChild(document.getElementById('fix-the-web-comment-frame'));
                }, 1000)
            }, false);
            
            minimize_frame.addEventListener('click', function() {
                var thisClassName = document.getElementById('minimize-frame').className;
                
                if (thisClassName == 'is_maximized') {
                    thisClassName = 'is_minimized';
                    frame_element.className = 'minimized_state'
                } else {
                    thisClassName = 'is_maximized';
                    frame_element.className = 'normal_state';
                }
            }, false);
            
            frame_element.appendChild(resize_frame); // append the resize/close frame bar to the main frame
            
            // trigger the drag function whenever the mouse button is pressed and the mouse is moved            
            resize_frame.addEventListener('mousedown', function () {
                window.addEventListener('mousemove', resizeFrame, false);
            }, false);
            
            // detach the drag function when the mouse button is released

            frame_element.addEventListener('mouseup', function() {
                window.removeEventListener('mousemove', resizeFrame, false);
                
                // deselect text that was selected while resizing the panel                
                var sel = window.getSelection();
                sel.collapseToStart();
                sel.collapseToEnd();
            }, false);
            
            // create a styles element for the frame's styles            
            var frame_style_element = document.createElement('style'),
                  frame_styles = '::selection {background: transparent !important;}'
                  frame_styles += '#fix-the-web-comment-frame {position: fixed; z-index:123456789 !important; box-shadow:0 0 90px #eee; background: -o-linear-gradient(bottom, rgba(255,255,255,1) 30%, rgba(255,255,255,.75)); left: 0; margin: 0; padding-bottom: 5px; -o-transition:bottom 0.5s ease-in-out, opacity 0.5s ease-in-out, width 500ms ease-in-out, height 500ms ease-in-out;}'
                  frame_styles += '.normal_state{height:40%; width:100%; opacity:1; bottom:0px} .fadeout_state {opacity:0; bottom:-20px;}' 
                  frame_styles += '#fix-the-web-comment-frame.minimized_state {bottom:0; height:15px; width:30px; padding:0;} .minimized_state #resize-frame:before {background:none}'
                  frame_styles += '#resize-frame {width: 100%; position: relative; float: left; left:0; top: 0; height: 15px; background-image:-o-linear-gradient(bottom, #777, #aaa); cursor:n-resize} #resize-frame:active {background-image:-o-linear-gradient(top, #333, #555)} #resize-frame:active:before {background:none}'
                  frame_styles += '#resize-frame:before { position:absolute; left: 45%; content:""; width:100px; height:100%; background:-o-radial-gradient(25% 50%, 3px 3px, #555 100%, transparent),-o-radial-gradient(36% 50%, 3px 3px, #555 100%, transparent), -o-radial-gradient(47% 50%, 3px 3px, #555 100%, transparent), -o-radial-gradient(25% 54%, 3px 3px, #bbb 100%, transparent),-o-radial-gradient(36% 54%, 3px 3px, #bbb 100%, transparent), -o-radial-gradient(47% 54%, 3px 3px, #bbb 100%, transparent); }'
                  frame_styles += '#close-frame, #minimize-frame {cursor:pointer; font:bold 16px sans-serif; color: #eee; float:right; top:-5px; margin: 2px 0px; padding: 0 4px; position:relative; border-left:1px solid transparent;}' 
                  frame_styles += '.is_maximized {content:"-"} .is_minimized {content:"+"} #minimize-frame {font-size:24px; line-height:18px;} #close-frame:hover, #minimize-frame:hover {background:rgba(255,255,255,.75); color:#444; border-left: 1px solid #fff}';
            
            frame_style_element.setAttribute('type', 'text/css');
            frame_style_element.appendChild(document.createTextNode(frame_styles));
            
            frame_element.appendChild(frame_content_container); // append the main container so the scrolling takes place in it 
            
            // insert the frame element and the style element into the HTML page            
            document.body.appendChild(frame_element);
            document.head.appendChild(frame_style_element);
            
            frame_element.className = 'fadeout_state' 
            setTimeout(function() {
                frame_element.className = 'normal_state' // trigger frame fade-in animation with CSS3 transitions by changing the className
            }, 100)
        }
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