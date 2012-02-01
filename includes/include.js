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
            
            var resize_frame = document.createElement('div'),
                  close_frame = document.createElement('span'),
                  frame_content_container = document.createElement('div');
                  
            resize_frame.id = 'resize-frame';
            close_frame.id = 'close-frame';
            frame_content_container.id = 'frame-content';
            
            close_frame.appendChild(document.createTextNode('x'));
            resize_frame.appendChild(close_frame);
            
            // close the frame when the "x" is clicked
            close_frame.addEventListener('click', function() {
                frame_element.parentNode.removeChild(frame_element)
            }, false);
            
            frame_element.appendChild(resize_frame); // append the resize/close frame bar to the main frame
            
            // trigger the drag function whenever the mouse button is pressed and the mouse is moved
            
            // FIXME: resizing the frame not working quite right...like it was before. :(
            
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
                  frame_styles = '::selection {background: transparent !important;} #fix-the-web-comment-frame {position: fixed; z-index:123456789 !important; box-shadow:0 0 90px #eee; background: -o-linear-gradient(bottom, rgba(255,255,255,1) 30%, rgba(255,255,255,.75)); width: 100%; height: 30%; bottom: 0; left: 0; margin: 0; padding-bottom: 5px;} #resize-frame {width: 100%; position: relative; float: left; left:0; top: 0; height: 15px; background-image: -o-linear-gradient(bottom, #777, #aaa); cursor:n-resize} #resize-frame:active {background-image:-o-linear-gradient(top, #333, #555)} #close-frame {cursor:pointer; font:bold 16px sans-serif; color: #eee; float:right; top:-5px; margin: 2px 0px; padding: 0 4px; position:relative;} #close-frame:hover {background:rgba(255,255,255,.75); color:#444; border-left: 1px solid #fff}';
            
            frame_style_element.setAttribute('type', 'text/css');
            frame_style_element.appendChild(document.createTextNode(frame_styles));
            
//            frame_element.appendChild(frame_content_container); // append the main container so the scrolling takes place in it 
            
            // insert the frame element and the style element into the HTML page            
            document.body.appendChild(frame_element);
            document.head.appendChild(frame_style_element);
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