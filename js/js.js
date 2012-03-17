
var HOST="http://localhost/Fix-the-Web-Server-Side/"; // TODO edit this for your system

function reportTemplate(id,username,date_time,report,operaVersion,operaBuildNumber,OS,domain,page,isComment){
    var content='';
    content="<article><h6><a href='?mode=get_comment_list&include_report=true&user="+username+"'>"+username+"</a> said on "+date_time+":</h6><div class='tools'>";
    if(!isComment)
    content+="<a href='' data-id="+id+" class='go-button'> &gt; </a>";
    content+="<a href='' data-id="+id+" class='follow-button'> follow </a>";
    content+="<a href='' data-id="+id+" class='like-button'> like </a></div><p>";

    content+=report+"</p><span class='small'><a href="+page+" title=\"" + page + "\">"+(page.length > 40 ? page.substr(0, 40) + '...' : page)+"</a> on "+domain+"</a><span class='additional-information'>"+operaVersion+"."+operaBuildNumber+" on "+OS+"</span></article>";
    return content;
}


function commentWriter(data,hist){
    if(!data) return false;
    var result=JSON.parse(data);
    var resultArea='';
    for (i in result.list)
    {
        a=result.list[i];
        resultArea+=reportTemplate(a.id,a.username,a.date_time,a.report,a.Opera,a.build,a.OS,a.domain,a.page,true);
    }
    var form="<form action='' id='comment-form'> \
                <input type='text' data-fid='system' id='OS' value=''> \
                <input type='text' data-fid='version' id='opera-version'> \
                <input type='text' data-fid='build' id='opera-build-number'> \
                <input type='hidden' data-fid='language' id='language'> \
                <textarea id='comment-text' data-fid='description' placeholder='Please enter your comment'></textarea> \
                <textarea style='display:none' id='additional-information' data-fid='misc'></textarea> \
                <button type='submit' data-fid='misc'>Send</button> \
            </form>";
            // TODO misc information will be editeable and its style will be added into css.css file.
    document.getElementsByTagName("section")[0].innerHTML       = resultArea+form;

    if ((window.opera) && (opera.buildNumber)){
            // learn and write version into hidden element (#opera-version)
            document.getElementById("opera-version").value      =   opera.version();

            // learn and write version of Opera into hidden element (#opera-build-number)
            document.getElementById("opera-build-number").value =   opera.buildNumber();
    }

    document.getElementById("language").value      =   navigator.userLanguage;

    // seperator will split additional information to different parts
    var separator = "\r\n===========\r\n";

    // cache (#additional-information) element
    var bug = '';

    // learn what plugins is installed and write them into hidden element (#additional-information)
    bug += "PLUGINS:" + separator;

    // navigator.plugins stores what plugins is installed and which are activated
    if (navigator.plugins) {
            for (var i = 0; i < navigator.plugins.length; i++) {
                    // for each plugin obtain its name, description and file name. Then write them into hidden element (#additional-information)
                    var plugin = navigator.plugins[i];
                    bug += "* " + plugin.name + " ("+plugin.description+") "+plugin.filename+"\r\n";
            }
    }

    // learn screen resolution write them into hidden element (#additional-information)
    bug += "\n\nSCREEN:" + separator;
    if ((typeof(screen.width) != "undefined") && (screen.width && screen.height))
            bug += "Resolution: " + screen.width + 'x' + screen.height + "\n";

    // learn color depth and write them into hidden element (#additional-information)
    if ((typeof(screen.colorDepth) != "undefined") && (screen.colorDepth))
            bug += "ColorDepth: " + screen.colorDepth + "\r\n";
    
    document.getElementById('additional-information').innerHTML = bug;

    sendRequest("GET",HOST+"ajax_request_handler.php?mode=get_OS",function(data){
       document.getElementById("OS").value=data; 
    },null);
    
    document.getElementById("comment-form").addEventListener("submit",function(event){
        event.preventDefault();
        var commentQuery='';
        for (i=0,formElements=document.getElementById("comment-form").children;i<6;i++){
            commentQuery+="&"+formElements[i].dataset["fid"]+"="+formElements[i].value;
        }
        sendRequest("GET",HOST+"ajax_request_handler.php?mode=write_a_comment&id="+result.id+commentQuery,function(data){
            if(data!="true")
                alert(data);
            else{
                alert("sent");
            }
        },null);


    },false);
    
    if(!hist)
        history.pushState(
            {
                data:   data,
                type:   result.type,
                query:  result.query,
                id:     (result.id      ==  undefined) ? ''  :  result.id,
                page:   (result.page    ==  undefined) ? '1' :  result.page,
                user:   (result.user    ==  undefined) ? ''  :  result.user,
                domain: (result.domain  ==  undefined) ? ''  :  result.domain,
                url:    (result.url     ==  undefined) ? ''  :  result.url,
            },
            'Comments',
            HOST+"?"+result.query
        );
}

// If xmlHTTPRequest is succesfull, then write the result into a suitable area
function reportWriter(data,hist){
    if(!data) return false;
    var result=JSON.parse(data);
    var resultArea='';
    for (i in result.list)
    {
        a=result.list[i];
        resultArea+=reportTemplate(a.id,a.username,a.date_time,a.report,a.Opera,a.build,a.OS,a.domain,a.page,false);
    }
    resultArea+="<a href='' id='prev' onclick='go2page(-1)'>&lt;</a> <input type='number' onchange='go2page(this.value)' id='page' value='"+(result.page)+"'><a href='' id='forw' onclick='go2page(0)'>&gt;</a>";
    document.querySelector("section").innerHTML=resultArea;
    if(!hist)
        history.pushState(
            {
                data:   data,
                type:   result.type,
                query:  result.query,
                id:     (result.id      ==  undefined) ? ''  :  result.id,
                page:   (result.page    ==  undefined) ? '1' :  result.page,
                user:   (result.user    ==  undefined) ? ''  :  result.user,
                domain: (result.domain  ==  undefined) ? ''  :  result.domain,
                url:    (result.url     ==  undefined) ? ''  :  result.url,
            },
            'Reports',
            HOST+"?"+result.query
        );

    var buttons = document.querySelectorAll(".go-button");

    for (c=0;c<buttons.length;c++){
        
        buttons[c].addEventListener("click",function(event){
            event.preventDefault();
            sendRequest("GET",HOST+"ajax_request_handler.php?mode=get_comment_list&include_report=true&id="+event.target.dataset.id,commentWriter,null);
            return false;
        },false);
    }
}

window.addEventListener('popstate', function (event) {
  if(event.state==null) return false;
  switch(event.state.type){
      case "comments":
      commentWriter(event.state.data,1);
      break;
      case "reports":
      reportWriter(event.state.data,1);
      break;
  }
  
},false);

function goHomePage(){
    sendRequest("GET",HOST+"ajax_request_handler.php?mode=get_report_list",reportWriter,null);
}

window.addEventListener("DOMContentLoaded",function(){
    // index page operations
    //if you have a hash you will be redirecting exact page that you requested
    if(location.hash.length>1){
        // load comment list
        if(location.hash.search("get_report_list")>0){
            sendRequest("GET",HOST+"ajax_request_handler.php"+location.hash,reportWriter,null);
        // or load report list
        }else if(location.hash.search("get_comment_list")>0){
            sendRequest("GET",HOST+"ajax_request_handler.php"+location.hash,commentWriter,null);
        }
    }
    else // otherwise you will see lastest reports on home screen
        goHomePage();

    // Search form sent event
    document.getElementById("form").addEventListener("submit",function(){
        // prevent default sent action
        event.preventDefault();
        
        // join domain value into query
        if(document.getElementById("domain").value)
            query+="&domain="+document.getElementById("domain").value;
        
        // sent query server and write results
        sendRequest("GET",HOST+"ajax_request_handler.php?mode=get_report_list&search=1"+query,reportWriter,null);
        
        return false;
    },false);

    // Bind home page link into logo
    document.querySelector("header h1 a").addEventListener("click",function(){
        // prevent default action
        event.preventDefault();

        // load home page data
        goHomePage();

        return false;
    },false);

    document.getElementById("most-popular-reports").addEventListener("click",function(event){
        // prevent default click action
        event.preventDefault();
        sendRequest("GET",HOST+"ajax_request_handler.php?mode=get_report_list&order=popularity",reportWriter,null);
    },false);

    document.getElementById("most-followed-reports").addEventListener("click",function(event){
        // prevent default click action
        event.preventDefault();
        sendRequest("GET",HOST+"ajax_request_handler.php?mode=get_report_list&order=most_followed",reportWriter,null);
    },false);

    document.getElementById("more-detail-about-project").addEventListener("click",function(event){
            
            var explanation=document.getElementById("explanation-about-the-extension");
            switch(explanation.style.height)
            {
                case "":
                case "100px":
                    explanation.style.height="auto";
                    event.target.innerText="Less";
                break;
                case "auto":
                    explanation.style.height="100px";
                    event.target.innerText="More";
                break;
            }
        },false);
},false);

/*function go2page(page){
    
    var variables = document.location.hash.slice(3).split("/");
    var c=Array();
    for(var b=0;b<variables.length;b++){
        c[variables[b].split("=")[0]]=variables[b].split("=")[1];
    }
    // if you have a windows.history object you are surfing on this web site
    if(window.history.state!=null && window.history.state.page!=undefined){
        var currentPage = window.history.state.page;
        var type        = window.history.state.type;
        var domain      = window.history.state.domain;
        var id          = window.history.state.id;
        //var user        = window.history.state.user;
        var order       = window.history.state.order   
    }else{ 
        var id          = (c["id"]      ==  undefined ? ""      : c["id"]);
        var currentPage = (c["page"]    ==  undefined ? "1"     : c["page"]);
        var type        = (c["Comments"]==  undefined ? "report": "comment");
        var domain      = (c["domain"]  ==  undefined ? ""      : c["domain"]);
        //var user        = (c["user"]    ==  undefined ? ""      : c["user"]);
        var order       = (c["order"]   ==  undefined ? ""      : c["order"]);
    }
    // base query URL
    var query = HOST+"ajax_request_handler.php?";

    // if you send -2 as page parameter you are first time to visit the web site and trying to open a spesific url from your referer, so page parameter in your address will be pushed the query
    if(page==-2){
        query+="page="+currentPage;
    }else if(page==-1) // you are trying to open previous page
        query+="page="+(--currentPage);
    else if(page==0){ // you are trying to open next page
        query+="page="+(++currentPage);
    }else if(page>0){ // you are trying to open a page that you specify. 
        query+="page="+(page);
    }
    switch(order){
        case "most_followed":
            query+="&order=most_followed";
        break;
        case "popularity":
            query+="&order=popularity";
        break;
        case "time_asc":
            query+="&order=time_asc";
        break;
        case "time_desc":
        default:
            query+="&order=time_desc";
        break;
    }
    if(id>0){
        query+="&id="+id;
    }
    if(domain.length>2){
        query+="&domain="+domain;
    }
    /*if(user.length>1){
        query+="&user="+user;   
    }*/

    /*switch(type){
        case "comment":
            query+="&mode=get_comment_list";
            sendRequest("GET",query,commentWriter,null);
        break;
        case "report":
            query+="&mode=get_report_list";
            sendRequest("GET",query,reportWriter,null);
        break;
    }
    
    
}
*/

function sendRequest (method, url, callback, params) {
    var xhr = new XMLHttpRequest();
    document.getElementById("loading").style.display="block";
    xhr.onreadystatechange = function() {
        if (this.status == 200 && this.readyState == 4) {
            if (typeof callback == 'function') callback(this.responseText);
            document.getElementById("loading").style.display="none";
        }
    }
         
    // serialize the parameters passed into this function, if there are any. 
    // For example, change {key: 'val', key2: 'val2'} to 'key=val&key2=val2'
    if (typeof params == 'object' && params) {
        var serialized_data = '';
        
        for (i in params) {
            if (typeof first_iteration == 'undefined') {
                serialized_data += i + '=' + encodeURIComponent(params[i]);
                var first_iteration = true;
            } else // we need to add an ampersand (&) at the beginning if there are already parameters in the query string
                serialized_data += '&' + i + '=' + encodeURIComponent(params[i]); 
        }
    } else serialized_data = false;    
    try {
        if (method.toLowerCase() != 'get') throw 'Invalid method "' + method + '" was specified. AJAX request could not be completed.' ;
        else {
            xhr.open(method, url + (serialized_data && serialized_data.length ? '?' + serialized_data : ''), true)
            xhr.send(null);
        }
    } catch(error) { 
        console.log('Error: ' + error);
        return false;
    }
} // end sendRequest() function