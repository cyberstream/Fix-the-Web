<?php 
header("Cache-Control: no-cache, must-revalidate");
require_once 'db.php'; // include the database configuration file

if (isset($_GET) && count($_GET)) {
    if ($_GET['mode'] == 'submit error') { 
        // validate the form fields
        if (!isset($_GET['category']) || !($_GET['category'] != 1 && $_GET['category'] != 2 && $_GET['category'] != 3)) 
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

        if ($stmt->prepare($query)) {
            $stmt->bind_param('s', $bind_variable);
            $q = $stmt->execute();
            $stmt->store_result();
            
            if ($q && $stmt->num_rows) {
                $stmt->bind_result($username, $language, $category, $report, $page, $version, $build, $OS, $misc, $date_time);
                $return = '';
                
                while ($stmt->fetch()) { // TODO display the comments nicer
                    $return .= <<<_HERE
                    <p>
                        <em>$username</em> said on $date_time:
                        "$report"
                            
                        <div>Page: <em>$page</em></div>
                        <div>Additional information &mdash; version: $version, build number: $build, operating system: $OS</div>
                    </p>
                    <hr />
_HERE;
                }
                
                exit ($return);
            } else exit ('There were no bugs reported on this website.');       
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
    }
} else echo 'Page not found!';