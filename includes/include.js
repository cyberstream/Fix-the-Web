opera.extension.onmessage = function(event) {    
    resizeFrame = function(e) {                    
                                if (e.clientY > 0 && window.innerHeight - e.clientY >= 10 && e.clientY > 30) {
                                    var ftw_frame = document.getElementById('fix-the-web-comment-frame'),
                                          ftw_resize_bar = document.getElementById('resize-frame'),
                                          ftw_resize_bar_height = parseInt(ftw_resize_bar.style.height) || 15
                                    
                                    // set the frame height to wherever the cursor is
                                    ftw_frame.style.height = 100 - Math.floor((e.clientY / window.innerHeight) * 100) + '%'
                                    
                                    var bar_height_percentage = ((ftw_resize_bar_height / window.innerHeight).toFixed(3)) * 100 // round to the nearest tenth place
                                    ftw_resize_bar.style.bottom = (parseInt(ftw_frame.style.height) + bar_height_percentage) + '%'; // place the resize bar right above the comment frame
                                }
                            }
                            
    resetFrameBar = function() { // repositions the resize bar when the window is resized
                                    var ftw_frame = document.getElementById('fix-the-web-comment-frame'),
                                          resize_frame = document.getElementById('resize-frame');
                                          
                                          if (ftw_frame && resize_frame) {
                                            ftw_resize_bar_height = parseInt(resize_frame.style.height) || 15
        
                                            var resize_frame_height = parseInt(resize_frame.style.height) || 15
                                            bar_height_percentage = ((resize_frame_height / window.innerHeight).toFixed(3)) * 100 // round to the nearest tenth place
                                            resize_frame.style.bottom = parseInt(ftw_frame.style.height) + bar_height_percentage + '%'; // place the resize bar right above the comment frame
                                        }
                                }
                                
    // @param "JSON" array of JSON objects, e.g. [ {/* report #1*/}, {/* report #2 */}, ... ]
    // @param "language" string, default is 'all'. The language filter for the reports.
    
    // TODO show reports in threaded view, and fetch comments for the report when "[view thread]" is clicked.
    // TODO add a select menu to filter reports by languages
    populateCommentFrame = function(json, language) {
        var commentFrameHTML = '',
              commentFrame = document.getElementById('fix-the-web-comment-frame'),
              language = language || 'all';
        
        if (typeof json == 'object' && json.length) {
            for (i = 0; i < json.length; i++) {
                var current = json[i];
                
                if (language == 'all' || language.toLowerCase() == current.language.toLowerCase()) {
                    var page_url = '<a href="' +current.page+ '" title="Page: ' +current.page+ '" target="_blank">' 
                        +(current.page.length > 35 ? current.page.substr(0, 35) + '...' : current.page) + '</a>';
                    
                    commentFrameHTML += '<div class="thread collapsed"><div class="title">Posted by <span class="username">' +current.username+ '</span> on ' +current.date_time+ ' from page ' +page_url+ ' <span class="change_state"></span></div><div class="toggle"><div class="report_body">"' +current.report+ '"</div> ' +current.Opera+ '.' +current.build+ ' on ' +current.OS+ ' <a href="data:text/plain;charset=utf-8,' +encodeURIComponent(current.misc)+ '" target="_blank">miscellaneous information</a></div></div>'
                }
            }
        }
        
        commentFrameHTML = commentFrameHTML || 
            (language != 'all' ? 'No reports were found. Try viewing reports in all languages.' : 'No reports were found.')
        
        commentFrame.innerHTML = commentFrameHTML; // insert the HTML into the comment frame
        
        var change_state_triggers = document.querySelectorAll('#fix-the-web-comment-frame .change_state');
        
        for (i = 0; i < change_state_triggers.length; i++) {
            change_state_triggers[i].addEventListener('click', function() {
                var thread = this.parentNode.parentNode,
                      currentClassName = thread.className.match(/(collapsed|expanded)/i)[1],    
                
                toggleStates = {
                    'collapsed' : 'expanded',
                    'expanded' : 'collapsed'
                }
                
                thread.className = thread.className.replace(/(collapsed|expanded)/i, toggleStates[currentClassName])
            }, false)
        }
    } // end populateCommentFrame() function
    
    // process incoming messages and trigger the specified command
    if (event.data == 'reply') {
        event.source.postMessage('initialize badge');
    } else if (event.data.frame_content) {
        window.ftw_content = JSON.parse(event.data.frame_content); // make the frame_content variable globally available
        
        populateCommentFrame(window.ftw_content) // fill the comment frame with the comment frame data

        window.addEventListener('resize', resetFrameBar, false); // readjust the positioning of the resize bar whenever the window is resized
    } else if (event.data.load_comments_frame) {
        if (!document.getElementById('fix-the-web-comment-frame')) {
            var frame_element = document.createElement('div');
                  frame_element.id = 'fix-the-web-comment-frame';
                  frame_element.className = 'fadeout_state';
            
            var resize_frame = document.createElement('div'),
                  close_frame = document.createElement('span');
                  
            resize_frame.id = 'resize-frame';
            close_frame.id = 'close-frame';
            
            close_frame.appendChild(document.createTextNode('x'));            
            resize_frame.appendChild(close_frame);
            
            // close the frame when the "x" is clicked
            close_frame.addEventListener('click', function() { 
                document.getElementById('fix-the-web-comment-frame').className = 'fadeout_state' // trigger frame fade-out animation with CSS3 transitions by changing the className
                document.getElementById('resize-frame').className = 'hidden'

                setTimeout(function() {
                    document.getElementById('fix-the-web-comment-frame').parentNode.removeChild(document.getElementById('fix-the-web-comment-frame'));
                    document.getElementById('resize-frame').parentNode.removeChild(document.getElementById('resize-frame'))
                    window.removeEventListener('resize', resetFrameBar, false);
                }, 1000)
            }, false);
            
            // trigger the drag function whenever the mouse button is pressed and the mouse is moved            
            resize_frame.addEventListener('mousedown', function () {
                window.addEventListener('mousemove', resizeFrame, false);
            }, false);
            
            // detach the drag function when the mouse button is released
            window.addEventListener('mouseup', function() {
                window.removeEventListener('mousemove', resizeFrame, false);
            }, false);
            
            // create a styles element for the frame's styles            
            var frame_style_element = document.createElement('style'),
                  frame_styles = ''; //::selection {background: transparent !important;}'; // make selection invisible

            frame_styles += '#fix-the-web-comment-frame {overflow:auto; position: fixed; z-index:123456788 !important; box-shadow:0 0 90px #eee; font-family: "myriad pro", "arial", "lucida grande", "lucida sans unicode", "bitstream vera sans", "dejavu sans", "trebuchet ms", sans-serif; font-size: 16px; padding: 10px 1.5% 5px 1.5%; font-weight:bold; color:#333; background: -o-linear-gradient(bottom, rgba(255,255,255,1) 30%, rgba(255,255,255,.85)); left: 0;  -o-transition:bottom 0.5s ease-in-out, opacity 0.5s ease-in-out, width 0.5s ease-in-out, height 0.1s ease-in-out;}'
            + '.normal_state{height:40%; width:97%; opacity:1; bottom:0px} .fadeout_state {opacity:0; bottom:-20px;}' 
            + '#resize-frame {-o-transition:opacity 0.5s ease-in-out; z-index:123456789 !important; width: 100%; position: fixed; left: 0; height: 15px; background-image:-o-linear-gradient(bottom, #777, #aaa); cursor:n-resize} #resize-frame:active {background-image:-o-linear-gradient(top, #333, #555); box-shadow:0 0 5px #888}'
            + '#resize-frame.hidden {opacity:0} #resize-frame.display {opacity:1} #resize-frame:before { position:absolute; left:46%; content:""; width:100px; height:100%; background:-o-radial-gradient(25% 50%, 3px 3px, #555 100%, transparent),-o-radial-gradient(36% 50%, 3px 3px, #555 100%, transparent), -o-radial-gradient(47% 50%, 3px 3px, #555 100%, transparent), -o-radial-gradient(25% 54%, 3px 3px, #bbb 100%, transparent),-o-radial-gradient(36% 54%, 3px 3px, #bbb 100%, transparent), -o-radial-gradient(47% 54%, 3px 3px, #bbb 100%, transparent); }'
            + '#close-frame {cursor:pointer; font:bold 16px sans-serif; color: #eee; float:right; top:-5px; margin: 2px 0px; padding: 0 4px; position:relative; border-left:1px solid transparent;} #close-frame:hover {background:rgba(255,255,255,.75); color:#444; border-left: 1px solid #fff}'
            + '#fix-the-web-comment-frame .report_body {font-size:18px; padding:5px; margin: 12px 0; background:#fff; border-radius:6px; border:1px solid #c1c1c1;}'
            + '#fix-the-web-comment-frame .title {color:#777} #fix-the-web-comment-frame .username {color:#000}'
            + '#fix-the-web-comment-frame .thread {margin: 0 0 5px 0; border-radius:6px; padding: 7px; background:#eaeaea;}'
            + '#fix-the-web-comment-frame a {color:#3399FF; text-decoration:none} #fix-the-web-comment-frame a:hover {text-decoration:underline}'
            + '#fix-the-web-comment-frame .collapsed .toggle {display:none} #fix-the-web-comment-frame .expanded .toggle {display:block}'
            + '#fix-the-web-comment-frame .collapsed .change_state {content:\'expand thread\';} #fix-the-web-comment-frame .expanded .change_state {content:\'collapse thread\';}'
            + '#fix-the-web-comment-frame .change_state {padding: 0 5px; color:#3399FF; font-weight:100} #fix-the-web-comment-frame .change_state:hover {cursor:pointer; text-decoration:underline}'
            
            frame_style_element.setAttribute('type', 'text/css');
            frame_style_element.appendChild(document.createTextNode(frame_styles));
            
            // place the resize bar where it should go                
            var resize_frame_height = parseInt(resize_frame.style.height) || 15
                  bar_height_percentage = ((resize_frame_height / window.innerHeight).toFixed(3)) * 100 // round to the nearest tenth place
                  resize_frame.style.bottom = (40 + bar_height_percentage) + '%'; // place the resize bar right above the comment frame
            
            // insert the resize bar, the frame element and the style element into the HTML page
            frame_element.innerText = 'Loading...';
            document.body.appendChild(frame_element);
            document.body.appendChild(resize_frame);
            document.head.appendChild(frame_style_element);
            
            frame_element.className = 'fadeout_state' 
            resize_frame.className = 'hidden'
            
            setTimeout(function() {
                frame_element.className = 'normal_state' // trigger frame fade-in animation with CSS3 transitions by changing the className
                resize_frame.className = 'display'
            }, 100)
            
            event.source.postMessage("get_frame_content");
        }
    }
}    

// get the patches.js script from localStorage and create a script element on the page with its contents

window.addEventListener('DOMContentLoaded', function() {    
    if (typeof widget.preferences['patches-js'] == 'undefined') widget.preferences['patches-js'] = '';
    
    var patches_js = widget.preferences['patches-js'],    
          script_tag = document.createElement('script');
    
    script_tag.appendChild(document.createTextNode(patches_js))
    script_tag.setAttribute('type', 'text/javascript')
    
    var body_tag = document.getElementsByTagName('body'),
          root_html_element = document.getElementsByTagName('html')[0];
    
    if (body_tag.length) {
        body_tag[0].appendChild(script_tag)
    } else {
        var new_body_element = document.createElement('body');
        
        new_body_element.appendChild(script_tag)
        root_html_element.appendChild(new_body_element)
    }
}, false);