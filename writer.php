<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
        <title>Fix the Web</title> <!-- // TODO: Change title with suitable one-->
    <link rel="stylesheet" type="text/css" href="css/css.css">
</head>
<body>
<?php 
$questionMarkPosition    =   strpos($_SERVER["REQUEST_URI"],"?"); // TODO fix the bug about no request (home page request)
//$fp = fopen("ajax_request_handler.php".substr( $_SERVER["REQUEST_URI"],$questionMarkPosition), "r");

// create a new cURL resource
$ch = curl_init();

// set URL and other appropriate options
curl_setopt($ch, CURLOPT_URL, "http://localhost/Fix-the-Web-Server-Side/ajax_request_handler.php".substr( $_SERVER["REQUEST_URI"],$questionMarkPosition));

curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
// grab URL and pass it to the browser
$data = curl_exec($ch);
$data = json_decode($data);
foreach($data->list as $row){
    $row->page = strlen($row->page) > 50 ? substr($row->page, 0, 50) . '...' : $row->page; 
    
    echo "<article><h6><a href='?mode=get_comment_list&include_report=true&user=".$row->username."'>".$row->username."</a> said on ".$row->date_time.":</h6><div class='tools'>";
    //if(!isComment)
    echo "<button data-id=".$row->id." class='go-button'> &gt; </button>";
    echo "<button data-id=".$row->id." class='follow-button'> follow </button>";
    echo "<button data-id=".$row->id." class='like-button'> like </button></div><p>";
    echo $row->report;
    echo "</p><span class='small'><a href=".$row->page." title='".$row->page."'>".$row->page."</a> on ".$row->domain."</a><span class='additional-information'>".$row->Opera.".".$row->build." on ".$row->OS."</span></article>";
}

// close cURL resource, and free up system resources
curl_close($ch);

//echo $_SERVER["REQUEST_URI"];
?>
</body>
</html>