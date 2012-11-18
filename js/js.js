
var HOST=""+location.protocol+"//"+location.hostname+location.pathname;//localhost/Fix-the-Web-Server-Side/"; // TODO edit this for your system

function reportTemplate(id,username,date_time,report,operaVersion,operaBuildNumber,OS,domain,page,isComment){
    var content='';
    content="<article><h6><a href='?mode=get_comment_list&include_report=true&user="+username+"'>"+username+"</a> said on "+date_time+":</h6><div class='tools'>";
    if(!isComment)
    content+="<a href='?mode=get_comment&id="+id+"' data-id="+id+" class='go-button'> &gt; </a>";
    content+="<a href='?mode=follow&id="+id+"' data-id="+id+" class='follow-button'> follow </a>";
    content+="<a href='?mode=like&id="+id+"' data-id="+id+" class='like-button'> like </a></div><p>";

    content+=report+"</p><span class='small'><a href="+page+" target='_blank' title=\"" + page + "\">"+(page.length > 40 ? page.substr(0, 40) + '...' : page)+"</a> on "+domain+"</a><span class='additional-information'>"+operaVersion+"."+operaBuildNumber+" on "+OS+"</span></article>";
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

    
    if(window.localStorage==null || (window.localStorage!=null && localStorage.getItem("clientOS")==null)){
        sendRequest("GET",HOST+"ajax_request_handler.php?mode=get_OS",function(data){
           document.getElementById("OS").value=data; 
           localStorage.setItem("clientOS",data);
        },null);

    }
    else
        document.getElementById("OS").value=localStorage.getItem("clientOS");
    
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
                if(window.history){
                    sendRequest("GET",HOST+"ajax_request_handler.php?+"+history.state.query,commentWriter,null);
                }else{
                    sendRequest("GET",HOST+"ajax_request_handler.php"+document.location.search,commentWriter,null);
                }

                alert("Your comment is sent");
            }
        },null);


    },false);
    
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
    if(result.page==1) {
        prevLink=result.query;
        nextLink=result.query+'&page=2';
    }else{
        prevLink=result.query.replace('page='+result.page,'page='+(result.page-1));
        nextLink=result.query.replace('page='+result.page,'page='+(result.page+1));
    }
    resultArea+="<a href='?"+prevLink+"' id='prev'>&lt;</a> <input type='number' onchange='go2page(this.value)' id='page' value='"+(result.page)+"'><a href='?"+nextLink+"' id='forw'>&gt;</a>";
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
            sendRequest("GET",HOST+"ajax_request_handler.php?mode=get_comment_list&id="+event.target.dataset.id,commentWriter,null);
            return false;
        },false);
    }
    document.getElementById("prev").addEventListener("click",reportPaging,false);
    document.getElementById("forw").addEventListener("click",reportPaging,false);
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

// TODO: Test it whether this scope cause breaking of loading page
// index page operations
//if you have a hash you will be redirecting exact page that you requested
if(location.search.length>1){
    // load comment list
    if(location.search.search("get_report_list")>0){
        sendRequest("GET",HOST+"ajax_request_handler.php"+location.search,reportWriter,null);
    // or load report list
    }else if(location.search.search("get_comment_list")>0){
        sendRequest("GET",HOST+"ajax_request_handler.php"+location.search,commentWriter,null);
    }
}
else // otherwise you will see lastest reports on home screen
    goHomePage();

window.addEventListener("DOMContentLoaded",function(){
    // OLD Location of index page operations

    // Search form sent event
    document.getElementById("form").addEventListener("submit",function(){
        // prevent default sent action
        event.preventDefault();
        
        // join domain value into query
        var query='';
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
                    explanation.className="";
                break;
                case "auto":
                    explanation.style.height="100px";
                    event.target.innerText="More";
                    explanation.className="closed";
                break;
            }
        },false);

    
},false);

function reportPaging(event){
    event.preventDefault();
    sendRequest("GET",HOST+"ajax_request_handler.php"+event.target.href.match(/\?.*/)[0],reportWriter,null);
}

function sendRequest (method, url, callback, params) {
    var xhr = new XMLHttpRequest();

    // for loading indicator
    document.getElementById("loading").style.display="block";

    xhr.onreadystatechange = function() {
        if (this.status == 200 && this.readyState == 4) {
            if (typeof callback == 'function') callback(this.responseText);

            // if loading done, loading indicator will vanish
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