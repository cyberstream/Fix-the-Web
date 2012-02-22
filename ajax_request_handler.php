<?php 
header("Cache-Control: no-cache, must-revalidate");
require_once 'db.php'; // include the database configuration file
error_reporting(E_ALL);
if (isset($_GET) && count($_GET)) {
    if ($_GET['mode'] == 'get_OS') {
        // detects the OS by reading the HTTP_USER_AGENT string and extracting details about the OS from it. 

        $OSList = array (
                // Match user agent string with operating systems
                'Windows 3.11' => 'Win16',
                'Windows 95' => '(Windows 95)|(Win95)|(Windows_95)',
                'Windows 98' => '(Windows 98)|(Win98)',
                'Windows 2000' => '(Windows NT 5.0)|(Windows 2000)',
                'Windows XP' => '(Windows NT 5.1)|(Windows XP)',
                'Windows Server 2003' => '(Windows NT 5.2)',
                'Windows Vista' => '(Windows NT 6.0)',
                'Windows 7' => '(Windows NT 7.0)',
                'Windows NT 4.0' => '(Windows NT 4.0)|(WinNT4.0)|(WinNT)|(Windows NT)',
                'Windows ME' => 'Windows ME',
                'Open BSD' => 'OpenBSD',
                'Sun OS' => 'SunOS',
                'Linux' => '(Linux)|(X11)',
                'Mac OS' => '(Mac_PowerPC)|(Macintosh)',
                'QNX' => 'QNX',
                'BeOS' => 'BeOS',
                'OS/2' => 'OS/2',
                'Search Bot'=>'(nuhk)|(Googlebot)|(Yammybot)|(Openbot)|(Slurp)|(MSNBot)|(Ask Jeeves/Teoma)|(ia_archiver)'
        );

        $OS = '';
        
        // Loop through the array of user agents and matching operating systems
        foreach($OSList as $current_OS => $match) {
            // Find a match
            if (preg_match ('~' . $match . '~i', $_SERVER['HTTP_USER_AGENT'])) {
                // exit the loop because we found the correct match

                $OS = $current_OS;
                break;
            }
        }

        exit ($OS); // echo this for the AJAX request to get
    } elseif ($_GET['mode'] == 'submit error') { 
        // validate the form fields
        if (!isset($_GET['category']) || !preg_match('/^(1|2|3)$/', trim($_GET['category']))) 
            exit ('Please select a valid category for the error report.');
        elseif (!isset($_GET['description']) || strlen($_GET['description']) < 5) 
            exit ('Please fill out the description field with a description of the problem you encountered.');
        elseif (!isset($_GET['system']) || !isset($_GET['version']) || !isset($_GET['build']))
            exit ('Please make sure your operating system name and Opera version & build number are filled out in the "additional details" section.');
        elseif (!isset($_GET['url']) || !isset($_GET['domain']))
            exit ('Please enter a valid URL in the page address field.');
        else {
            $stmt = $db->stmt_init();
            
            if ($stmt->prepare("INSERT INTO reports 
                (username, language, category, report, page, domain, opera_version, opera_build, operating_system, additional_information, post_type) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)")) {
                $stmt->bind_param('ssisssssss', $_GET['username'], $_GET['language'], $_GET['category'], $_GET['description'], 
                        $_GET['url'], $_GET['domain'], $_GET['version'], $_GET['build'], $_GET['system'], $_GET['misc']);
                
                $q = $stmt->execute();
                if ($q && $stmt->affected_rows) {
                    exit ('true');
                } else exit ('An error occurred while submitting the error report. Please try submitting it again.');       
            }
        }
        
        // if the data is processed and inserted into the database successfully then echo "true":
        exit;
    } elseif ($_GET['mode'] == 'get_frame_content') {
        $stmt = $db->stmt_init();
        
        if ($_GET['method'] == 'domain' && isset($_GET['domain'])) {
            $query = "SELECT 
            username, language, category, report, page, opera_version, opera_build, operating_system, additional_information, DATE_FORMAT(time, '%M %e, %Y at %l:%i%p')
            FROM reports WHERE post_type = 0 AND domain = ?";
            $bind_variable = $_GET['domain'];
        } elseif ($_GET['method'] == 'page' && isset($_GET['page'])) {
            $query = "SELECT 
            username, language, category, report, page, opera_version, opera_build, operating_system, additional_information, DATE_FORMAT(time, '%M %e, %Y at %l:%i%p')
            FROM reports WHERE post_type = 0 AND page = ?";
            $bind_variable = $_GET['page'];
        } else exit ('There was an error fetching the bug reports for this website.');

        if ($stmt->prepare($query . ' ORDER BY id DESC')) {
            $stmt->bind_param('s', $bind_variable);
            $q = $stmt->execute();
            $stmt->store_result();
            
            if (!$stmt->errno && $stmt->num_rows) {
                $stmt->bind_result($username, $language, $category, $report, $page, $version, $build, $OS, $misc, $date_time);
                
                $JSON = array();
                
                while ($stmt->fetch()) {
                    $JSON[] = array("username" => $username,
                                        "language" => $language,
                                        "category" => $category,
                                        "report" => $report,                                            
                                        "date_time" => $date_time,
                                        "Opera" => $version,
                                        "build" => $build,
                                        "page" => $page,
                                        "misc" => $misc,
                                        "OS" => $OS                                            
                                    );
                }
                
                exit (json_encode($JSON));
            } else exit ('{}');
        }
    } elseif ($_GET['mode'] == 'get_reports_count' && isset($_GET['method']) && (isset($_GET['page']) || isset($_GET['domain']))) {
        if ($_GET['method'] == 'domain' || $_GET['method'] == 'page') {
            $stmt = $db->stmt_init();
            
            if ($_GET['method'] == 'domain' && isset($_GET['domain'])) {
                $query = "SELECT COUNT(DISTINCT id) FROM reports WHERE domain = ?";
                $bind_variable = $_GET['domain'];
            } elseif ($_GET['method'] == 'page' && isset($_GET['page'])) {
                $query = "SELECT COUNT(DISTINCT id) FROM reports WHERE page = ?";
                $bind_variable = $_GET['page'];
            } else exit ('0');

            if ($stmt->prepare($query)) {
                $stmt->bind_param('s', $bind_variable);                
                
                $stmt->execute();
                $stmt->bind_result($count);
                $stmt->fetch();
                
                $count = (strlen($count) == 1 ? " $count " : $count); // put some padding around the badge if there is only one number
                
                exit ($count);
            }
        }
        
        exit ('0');
    }elseif(($_GET['mode'] == 'get_report_list')){
        // TODO control $_GET variable health
        
        $stmt = $db->stmt_init();
        
        // TODO check DATE_FORMAT when multilangualizing
        $query = "SELECT 
        id, username, language, category, report, page, domain, opera_version, opera_build, operating_system, additional_information, DATE_FORMAT(time, '%M %e, %Y at %l:%i%p')
        FROM reports WHERE post_type = 0";

        if(isset($_GET['domain'])){
            $query.=" AND domain = ?";
            $bind_domain = $_GET['domain'];
        }

        if(isset($_GET['order'])){
            switch ($_GET['order']) {
                case 'most_followed':
                    $query="SELECT reports.id, reports.username, reports.language, reports.category, reports.report, reports.page, reports.domain, reports.opera_version, reports.opera_build, reports.operating_system, reports.additional_information, DATE_FORMAT(time, '%M %e, %Y at %l:%i%p') FROM reports LEFT JOIN ratings ON reports.id = ratings.id_foreign_key WHERE ratings.rating = 0 GROUP BY reports.id ORDER BY COUNT(ratings.rating) DESC ";
                break;
                case 'popularity':
                    $query="SELECT reports.id, reports.username, reports.language, reports.category, reports.report, reports.page, reports.domain, reports.opera_version, reports.opera_build, reports.operating_system, reports.additional_information, DATE_FORMAT(time, '%M %e, %Y at %l:%i%p') FROM reports LEFT JOIN ratings ON reports.id = ratings.id_foreign_key GROUP BY reports.id ORDER BY SUM(ratings.rating) DESC ";
                break;
                case 'time_asc':
                    $query.=" ORDER BY time ASC";
                    break;
                
                case 'time_desc':
                default:
                    $query.=" ORDER BY time DESC";
                    break;
            }
        }else{
            $query.=" ORDER BY time DESC";
        }
        $query.=" LIMIT ?,?";


        // What page that you want to look at
        if(isset($_GET['page']) && settype($_GET['page'],"int")){
            $bind_page_number = --$_GET['page'];
        }
        else{
            $bind_page_number = "0";
        }


        if(isset($_GET['count']) && settype($_GET['count'],"int")){
            $bind_count=$_GET['count'];
        }
        else {
            $bind_count="5"; // TODO: Default limit
        }

        if ($stmt->prepare($query)) {

            if(isset($bind_domain))
                $stmt->bind_param('sii', $bind_domain,$bind_page_number,$bind_count);
            else
            if(isset($bind_page_number) && isset($bind_count))
                $stmt->bind_param('ii', $bind_page_number,$bind_count);

            $q = $stmt->execute();
            $stmt->store_result();
        
            if ($q && $stmt->num_rows) {
                $stmt->bind_result($id,$username, $language, $category, $report, $page, $domain_db, $version, $build, $OS, $misc, $date_time);

                $JSON = array();
                while ($stmt->fetch()) {
                    $JSON[] = array("id" => $id,
                                            "username" => $username,
                                            "language" => $language,
                                            "category" => $category,
                                            "report" => $report,
                                            "page" => $page,
                                            "domain" => $domain_db,
                                            "date_time" => $date_time,
                                            "Opera" => $version,
                                            "build" => $build,
                                            "OS" => $OS,
                                            "misc" =>$misc
                                    );
                }
                
                exit (json_encode($JSON));
            }
        }
    } elseif (($_GET['mode'] == 'get_comment_list')) {
         // TODO control $_GET variable health
        
        $stmt = $db->stmt_init();
        
        // TODO check DATE_FORMAT when multilangualizing
        $query = "SELECT 
        id,username, language, category, report, page, domain, opera_version, opera_build, operating_system, additional_information, DATE_FORMAT(time, '%M %e, %Y at %l:%i%p')
        FROM reports WHERE 1=1 ";

        if(isset($_GET['domain'])) {
            $query.=" AND domain = ?";
            $bind_domain = $_GET['domain'];
        }
        if(isset($_GET['id']) && settype($_GET['id'], "int")) {

            $query.=" AND (id = ? OR report_id = ?)";
            $bind_report_id=$_GET["id"];
        }
         if(isset($_GET['user'])) {

            $query.=" AND username = ?";
            $bind_user=$_GET["user"];
        }
        
        if ($stmt->prepare($query)) {

            if(isset($bind_domain)){
                if(isset($bind_report_id))
                    if(isset($bind_user))
                        $stmt->bind_param('siis', $bind_domain,$bind_report_id,$bind_report_id,$bind_user);
                    else
                        $stmt->bind_param('sii', $bind_domain,$bind_report_id,$bind_report_id);
                else
                    if(isset($bind_user))
                        $stmt->bind_param('ss', $bind_domain,$bind_user);
                    else
                        $stmt->bind_param('s', $bind_domain);
            }
            else{
                if(isset($bind_report_id))
                    if(isset($bind_user))
                        $stmt->bind_param('iis',$bind_report_id,$bind_report_id,$bind_user);
                    else
                        $stmt->bind_param('ii',$bind_report_id,$bind_report_id);
                else
                    $stmt->bind_param('s',$bind_user);
            }
                

            $q = $stmt->execute();
            $stmt->store_result();
        
            if ($q && $stmt->num_rows) {
                $stmt->bind_result($id,$username, $language, $category, $report, $page, $domain_db, $version, $build, $OS, $misc, $date_time);

                $JSON = array();
                while ($stmt->fetch()) {
                    $JSON[]=array("id"=>$id,
                                    "username"=>$username,
                                    "language"=>$language,
                                    "category"=>$category,
                                    "report"=>$report,
                                    "page"=>$page,
                                    "domain"=>$domain_db,
                                    "date_time"=>$date_time,
                                    "Opera" => $version,
                                    "build" => $build,
                                    "OS" => $OS,
                                    "misc"=>$misc
                        );
                }
                
                exit(json_encode($JSON));
                    
            }
        }
    }
} else echo 'Page not found!';
