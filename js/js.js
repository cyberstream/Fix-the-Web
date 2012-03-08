
var HOST="http://localhost/"; // TODO edit this for your system

function reportTemplate(id,username,date_time,report,operaVersion,operaBuildNumber,OS,domain,page,isComment){
    var content='';
    content="<article><h6><a href='?mode=get_comment_list&include_report=true&user="+username+"'>"+username+"</a> said on "+date_time+":</h6><div class='tools'>";
    if(!isComment)
    content+="<button data-id="+id+" class='go-button'> &gt; </button>";
    content+="<button data-id="+id+" class='follow-button'> follow </button>";
    content+="<button data-id="+id+" class='like-button'> like </button></div><p>";

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
    var form="<form action='' id='comment-form'><textarea name='d' placeholder='Please enter your comment'></textarea><button type='submit'>Send</button></form>";
    document.getElementsByTagName("section")[0].innerHTML=resultArea+form;
    if(!hist)
        history.pushState(
            {
                data:   data,
                type:   "comment",
                id:     result.id,
                page:   result.page,
                //user:   result.user,
                domain: result.domain
            },
            'Comments ',
            HOST+"#!/Comments=1/page="+result.page+"/"+"id="+result.id+"/domain="+result.domain
        );
}

// If xmlHTTPRequest is succesfull, then write the result into a suitable area
function resultWriter(data,hist){
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
            {   data: data,
                type:"report",
                id:result.id,
                page:result.page,
                domain:result.domain,
                order:result.order
            }, 
            "Report List",
            HOST+"#!/Reports=1/page="+result.page+"/"+"id="+result.id+"/"+"domain="+result.domain+"/order="+result.order);

    var buttons = document.querySelectorAll(".go-button");

    for (c=0;c<buttons.length;c++){
        
        buttons[c].addEventListener("click",function(event){
            sendRequest("GET",HOST+"ajax_request_handler.php?mode=get_comment_list&include_report=true&id="+event.target.dataset.id,commentWriter,null);
            
        },false);
    }
}

window.addEventListener('popstate', function (event) {
  if(event.state==null) return false;
  switch(event.state.type){
      case "comment":
      commentWriter(event.state.data,1);
      break;
      case "report":
      resultWriter(event.state.data,1);
      break;
  }
  
},false);

function goHomePage(){
    sendRequest("GET",HOST+"ajax_request_handler.php?mode=get_report_list",resultWriter,null);
}

window.addEventListener("DOMContentLoaded",function(){
    // index page operations
    //if you have a hash you will be redirecting exact page that you requested
    if(location.hash.length>2)
        go2page(-2);
    else // otherwise you will see lastest reports on home screen
        goHomePage();

    document.getElementById("form").addEventListener("submit",function(){

        event.preventDefault();

        var query='&';
        if(document.getElementById("domain").value)
            query+="domain="+document.getElementById("domain").value+"&";
        query+="a=1";
        
        sendRequest("GET",HOST+"ajax_request_handler.php?mode=get_report_list&search=1"+query,resultWriter,null);
        
        return false;
        
    },false);

    document.querySelector("header h1").addEventListener("click",goHomePage,false);

    document.getElementById("most-popular-reports").addEventListener("click",function(event){
        event.preventDefault();
        sendRequest("GET",HOST+"ajax_request_handler.php?mode=get_report_list&order=popularity",resultWriter,null);
    },false);

    document.getElementById("most-followed-reports").addEventListener("click",function(event){
        event.preventDefault();
        sendRequest("GET",HOST+"ajax_request_handler.php?mode=get_report_list&order=most_followed",resultWriter,null);
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

function go2page(page){
    
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

    switch(type){
        case "comment":
            query+="&mode=get_comment_list";
            sendRequest("GET",query,commentWriter,null);
        break;
        case "report":
            query+="&mode=get_report_list";
            sendRequest("GET",query,resultWriter,null);
        break;
    }
    
    
}

function sendRequest (method, url, callback, params) {
    var xhr = new XMLHttpRequest();
   
    xhr.onreadystatechange = function() {
        if (this.status == 200 && this.readyState == 4) {
            if (typeof callback == 'function') callback(this.responseText);
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