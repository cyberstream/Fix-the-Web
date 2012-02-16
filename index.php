<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
        <title>Fix the Web Front Panel</title> <!-- // TODO: Change title with suitable one-->

    <style type="text/css">
        body {
            font-family:arial, "lucida grande", "lucida sans unicode", "bitstream vera sans", "dejavu sans", "trebuchet ms", sans-serif;
            font-size:1em;
            margin:0;
            padding:0
        }

        header {
            border-bottom:1px solid #dfdfdf;
            box-sizing:border-box;
            padding:.33em 1em;
            position:relative;
            width:100%
        }

        header h1 {
            color:#9ACD32;
            float:left;
            min-width:100px;
            text-align:center;
            text-shadow:0 0 2px #000;
            width:20%
        }

        header div {
            border-left:1px solid #dfdfdf;
            box-sizing:border-box;
            float:right;
            padding:.33em 1em;
            position:relative;
            width:80%
        }

        section {
            box-sizing:border-box;
            float:left;
            padding:.33em 1em;
            width:75%
        }

        article {
            margin:.33em;
            padding:.33em;
            position:relative
        }

        h6 {
            border-bottom:1px solid #999;
            font-size:1em;
            margin:0;
            padding:0;
            position:relative;
            width:100%
        }

        .go-button {
            background-color:#9ACD32;
            border:1px solid #555;
            border-radius:5px;
            box-shadow:0 0 2px #000;
            color:#fff;
            font-weight:700;
            padding:.33em 1em;
            position:absolute;
            right:1em;
            top:3em
        }

        .additional-information {
            bottom:0;
            font-size:.8em;
            padding:.11em;
            position:absolute;
            right:0
        }

        aside {
            box-sizing:border-box;
            float:left;
            padding:.33em 1em;
            width:25%
        }

        form label {
            clear:both;
            float:right;
            position:relative
        }

        input[type=number] {
            width:50px
        }
    </style>
</head>
<body>
    <header>
        <h1>Fix the Web</h1>
        <div>
            <h2>
                What is Fix the Web?
            </h2>
            <p>
                Fix the web is bla bla bla.
            </p>
        </div>
        <p style="clear:both;"></p>
    </header>
    <section>

    </section>
        <aside>
            
            <h2>Listing Options</h2>
        
            <form action="" id="form">

                <label for="domain">Domain
                    <input type="text" name="domain" id="domain" placeholder="Enter a domain name" <?php if(isset($_GET['domain'])) echo "value=".$_GET['domain'];?>>
                </label>
                <label for="page">Page
                    <input type="number" name="page" id="page" <?php if(isset($_GET["page"])) echo "value=".$_GET["page"];?>>
                </label>
                <label for="count">Report count
                    <input type="number" name="count" id="count" <?php if(isset($_GET["count"])) echo "value=".$_GET["count"];?>>
                </label>
                <button type="submit">Submit</button>
            
            </form>
            <div>

            </div>
        </aside>
        <script type="text/javascript">
var HOST="http://localhost/Fix-the-Web-Server-Side/"; // TODO edit this for your system

function reportTemplate(id,username,date_time,report,operaVersion,operaBuildNumber,OS,domain,page,isComment){
    var content='';
    content="<article><h6><em><a href='?Username="+username+"'>"+username+"</a></em> said on "+date_time+":</h6>";
    if(!isComment)
    content+="<button data-id="+id+" class='go-button'> &gt; </button><p>";
    content+=report+"</p><em>"+page+" on "+domain+"</em><span class='additional-information'>"+operaVersion+"."+operaBuildNumber+" on "+OS+"</span></article>";
    return content;
}


function commentWriter(data){
    if(!data) return false;
    var result=JSON.parse(data);
    var resultArea='';
    for (i in result)
    {
        a=result[i];
        resultArea+=reportTemplate(a.id,a.username,a.date_time,a.report,a.Opera,a.build,a.OS,a.domain,a.page,true);
    }
    document.getElementsByTagName("section")[0].innerHTML=resultArea;
}

// If xmlHTTPRequest is succesfull, then write the result into a suitable area
function resultWriter(data){
    if(!data) return false;
    var result=JSON.parse(data);
    var resultArea='';
    for (i in result)
    {
        a=result[i];
        resultArea+=reportTemplate(a.id,a.username,a.date_time,a.report,a.Opera,a.build,a.OS,a.domain,a.page,false);
    }
    document.getElementsByTagName("section")[0].innerHTML=resultArea;
    
    history.pushState({data: data}, "Report List", HOST+"?Report-List=1");

    var buttons = document.querySelectorAll(".go-button");

    for (c=0;c<buttons.length;c++){
        
        buttons[c].addEventListener("click",function(event){
            sendRequest("GET",HOST+"ajax_request_handler.php?mode=get_comment_list&id="+event.target.dataset.id,commentWriter,null);
            history.pushState({data: data}, 'Comments', HOST+"?Comment-List&id="+event.target.dataset.id);
        },false);
    }
}
window.addEventListener('popstate', function (event) {
  
  resultWriter(event.state.data || { url: "unknown", name: "undefined", location: "undefined" });
},false);

function goHomePage(){
    sendRequest("GET",HOST+"ajax_request_handler.php?mode=get_report_list",resultWriter,null);    
}

window.addEventListener("DOMContentLoaded",function(){
    // index page operations
    goHomePage();

    document.getElementById("form").addEventListener("submit",function(){

        event.preventDefault();
        event.stopPropagation();

        var query='&';
        if(document.getElementById("domain").value)
            query+="domain="+document.getElementById("domain").value+"&";
        if(document.getElementById("page").value)
            query+="page="+document.getElementById("page").value+"&";
        if(document.getElementById("count").value)
            query+="count="+document.getElementById("count").value+"&";
        query+="a=1";
        
        sendRequest("GET",HOST+"ajax_request_handler.php?mode=get_report_list"+query,resultWriter,null);
        history.pushState({data: data}, 'Search Results', HOST+"?report_list&"+query);
        return false;
    },false);

    

},false);

            
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
        </script>
    </body>
</html>
