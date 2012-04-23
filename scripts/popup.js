// check if the user is authenticated
if ( opera.extension.bgProcess.isLoggedIn() )
    $('body').attr('class', 'logged_in')
else 
    $('body').attr('class', 'login') 

window.addEventListener("DOMContentLoaded", function() {                
    document.getElementById('open-comment-panel').innerText = 'View problems reported on this ' 
            + (widget.preferences['display-reports-by'] && widget.preferences['display-reports-by'] == 'domain' ? 'site' : 'page')

    // get the current tab's URL       
    var tab = opera.extension.bgProcess.opera.extension.tabs.getFocused();

    if (tab) document.getElementById('page-address').value = tab.url;

    // when "Vew problems reported on this site" is clicked, open the comments panel
    document.getElementById('open-comment-panel').addEventListener("click", function() {
        opera.extension.bgProcess.opera.extension.tabs.getFocused().postMessage({
            load_comments_frame : true
        }); // trigger the comments frame's creation

        window.close(); // closes the popup window - doesn't work in developer mode

        return false; // keep link from following the default action
    }, false);

    // function show_message() shows an error or success message above the form            
    function show_message (text, message_mode) { // message_mode: 'error' or 'success'
        var message = document.querySelector('#error, #success'), 
                first_form_element = document.getElementById('form-begins');

        if (message) message.parentNode.removeChild(message); // remove old messages before displaying a new one

        var element = document.createElement('div');
        element.id = message_mode;
        element.innerHTML = text;

        first_form_element.parentNode.insertBefore(element, first_form_element);
    }

    // process the form when it is submitted            
    document.getElementById('report-site-form').onsubmit = function() {
        var error_message = document.getElementById('error');
        if (error_message) error_message.parentNode.removeChild(error_message);

        var error_form = document.getElementById('report-site-form'),
                domain_name = /:\/\/([^\/]+)\/?/.test(error_form.page_address.value) ? error_form.page_address.value.match(/:\/\/([^\/]+)\/?/)[1] : '', // get the second item in the result's array which is the matched text in the parentheses
                params = {
                    mode : 'submit error', // this is to select the correct form handler in ajax_request_handler.php
                    url : error_form.page_address.value.replace(/\/$/ig, ''),
                    domain : domain_name,
                    category : (document.querySelector('input.category:checked') ? document.querySelector('input.category:checked').value : false),
                    description : error_form.description.value,
                    system : error_form.OS.value,
                    version : error_form.opera_version.value,
                    build : error_form.opera_build_number.value,
                    misc : error_form.additional_information.value,
                    language : i18n.language_abbreviation.toUpperCase()
                };

        if (!params.url.length) show_message ( i18n.no_url_error, 'error' );
        else if (!(/^(1|2|3)$/).test(params.category)) show_message ( i18n.no_category_error, 'error' );
        else if (!params.description.length) show_message ( i18n.no_description_error, 'error' );
        else {                    
            // send report asynchronously to the server with the ajax_request_handler.php file on it 
            // see the "Fix the Web Server Side" repo on Github (http://github.com/cyberstream/Fix-the-Web-Server-Side) for that file
            // validate and process the form request in ajax_request_handler.php

            $('#report-site-form').fadeTo(600, 0.4);

            try {
                opera.extension.bgProcess.getUserName(function(data) {
                    var parsedResponse = data && data.text && data.text != '' && JSON.parse(data.text) ? JSON.parse(data.text) : {}

                    params.username = parsedResponse.screen_name;

                    if (!params.username || !params.username.length) show_message ( 'There was an error retrieving your username.', 'error' );
                    else {                            
                        opera.extension.bgProcess.sendRequest('GET', 'ajax_request_handler.php', function(message) {
                            $('#report-site-form').fadeTo(600, 1);

                            if (message == 'true') show_message (i18n.report_submitted_message, 'success');
                            else if (message.length > 0) show_message (message, 'error');
                            else show_message (i18n.report_submission_error, 'error');
                        }, params, true);
                    }
                });
            } catch (e) {
                show_message (i18n.report_connect_error, 'error');
            }
        }

        return false; // prevent the form from actually submitting
    }

    // Toggle additional information panel by clicking the text "Additional information"
    document.getElementById("additional-information-details-panel-opener").addEventListener("click",function(){          

        var state = document.getElementById("additional-information-details-panel").style.display;

        switch(state){                    

            // if #additional-information-panel is hidden, it will be indicated
            case "block":
                document.getElementById("additional-information-details-panel").style.display="none";
            break;
            // if #additional-information-panel is visible, it will disappear
            case "none":
            case "":
                document.getElementById("additional-information-details-panel").style.display="block";
            break;

        }

    },false);

    if ((window.opera) && (opera.buildNumber)){
            // learn and write version into hidden element (#opera-version)
            document.getElementById("opera-version").value		=	opera.version();

            // learn and write version of Opera into hidden element (#opera-build-number)
            document.getElementById("opera-build-number").value	=	opera.buildNumber();
    }

    // seperator will split additional information to different parts
    var separator = "\r\n===========\r\n";

    // cache (#additional-information) element
    var bug = document.getElementById('additional-information');

    // learn what plugins is installed and write them into hidden element (#additional-information)
    bug.value += i18n.plugins.toUpperCase() + ":" + separator;

    // navigator.plugins stores what plugins is installed and which are activated
    if (navigator.plugins) {
            for (var i = 0; i < navigator.plugins.length; i++) {
                    // for each plugin obtain its name, description and file name. Then write them into hidden element (#additional-information)
                    var plugin = navigator.plugins[i];
                    bug.value += "* " + plugin.name + " ("+plugin.description+") "+plugin.filename+"\r\n";
            }
    }

    // learn screen resolution write them into hidden element (#additional-information)
    bug.value += "\n\n" +i18n.screen.toUpperCase()+ ":" + separator;
    if ((typeof(screen.width) != "undefined") && (screen.width && screen.height))
            bug.value += i18n.resolution.toUpperCase() + ': ' + screen.width + 'x' + screen.height + "\n";

    // learn color depth and write them into hidden element (#additional-information)
    if ((typeof(screen.colorDepth) != "undefined") && (screen.colorDepth))
            bug.value += i18n.color_depth.toUpperCase() + ': ' + screen.colorDepth + "\r\n";

    // platform states whether the system is Win32, 64-bit build, mac or linux
    document.getElementById("OS").value = navigator.platform // default system form field value, but it is overwritten if this next thing works....

    opera.extension.onmessage = function(e) {
        if (e.data && e.data.system) document.getElementById("OS").value = e.data.system // ...if data arrives via messaging from the bgProcess, and it's the system info, then put it into the system field of the form.
    }

    var system = opera.extension.bgProcess.getOS(); // call the function
},false);