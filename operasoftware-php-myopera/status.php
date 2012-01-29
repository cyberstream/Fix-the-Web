<?php
    session_start();
    require "MyOpera.php";

    # Simple session killer
    function kill() {
        session_unset(); 
        session_destroy();
        $_SESSION = array();
    }

    if(isset($_GET['kill'])) {
        kill(); 
    }

    # Get your own API keys at
    # https://auth.opera.com/service/oauth/applications/
    $consumer = array(
        'key' => '{YOUR-CONSUMER-KEY-HERE}',
        'secret' => '{YOUR-CONSUMER-SECRET-HERE}',
    );

    $myo = new MyOpera($consumer['key'], $consumer['secret']); 

    # Check to see whether or not we remember an access token.
    if(isset($_SESSION['access_token_key']) && isset($_SESSION['access_token_secret'])) {
        $myo->set_access_token($_SESSION['access_token_key'], $_SESSION['access_token_secret']);
    }

    # Generates the auth link string
    function generate_auth() {
        global $myo;
        $response = $myo->send_token_request(); 
        if($response[2]) {
            $auth = $myo->get_auth_url($response[1]);
            $result = sprintf('<p>Please authorize your request: <a href="%s" onclick="window.open(\'%s\', \'_blank\'); return false;">%s</a><br /><br />', $auth, $auth, $auth);
            $result .= sprintf('<a href="?oauth_token=%s&amp;oauth_token_secret=%s">Continue authorization is completed</a></p>', $response[1], $response[2]);
        } else {
            $result = $response[0];
        }
        return $result;
    }

    # Front-end function to show the authorization and to set the access tokens if available.
    function check_tokens() {
        # If there's no oauth_token passed, assume that we need to send a request token.
        if(!isset($_GET['oauth_token']) && !isset($_SESSION['access_token_key'])) {
            return generate_auth();
        }
        # If oauth_token is set, but the access_token_key is not, we need to use the request token response to get the access token.
        elseif(!isset($_SESSION['access_token_key'])) {
            global $myo;
            $response = $myo->get_access_token($_GET['oauth_token'], $_GET['oauth_token_secret']);
            if(sizeof($response) == 1) {
                return $response[0] . generate_auth();
            }
            $_SESSION['access_token_key'] = $response[1];
            $_SESSION['access_token_secret'] = $response[2];
            $myo->set_access_token($response[1], $response[2]);
        }
    }
    
    # Front-end function to format the status message.
    function get_formatted_status($username) {
        global $myo;
        $status = $myo->get_status($username);
        
        # Check to see if server returns any errors. 
        if($status['code'] != 200) {
            return $status['message'];
        }
            
        if($status['message']) {
            return $status['message'];
        }
        # Checks to see if the timestamp is nothingness and return an error.
        if(substr($status['last_modified'], 0, 4) == "0000") {
            return sprintf("<strong>%s</strong>: <em>No status set.</em>", $username);
        }
        
        # Returns the status message
        return sprintf("<strong>%s @ %s</strong>: %s", $username,  $status['last_modified'], htmlentities($status['status']));
    }
?>
<!DOCTYPE html>
<html> 
    <head>
        <title>My Opera OAuth Status Updater</title>
        <style type="text/css">
            fieldset {
                width:  400px;
            }
            
            #killer {
                clear:  both;
            }
            
            #killer input {
                margin:  10px 2px;
                padding:  10px 30px;
                width: 425px;
                font-size:  large;
            }
        </style>
        <meta http-equiv="Content-Type" content="text/html;charset=utf-8">
    </head>
    <body>
<?php
    print '     <div>';
    
    printf('
            <fieldset>
                <legend>Get status for user</legend>
                <form action="" method="post">
                    <b>Username:</b> <input type="text" name="username" /> <input type="submit" value="Update!" />
                </form>%s
            </fieldset>', isset($_POST['username']) ? get_formatted_status($_POST['username']) : "");


    $auth = check_tokens(); 
    # Print a simple update status field.
    print '
            <fieldset>
                <legend>Update status</legend>';
    if($myo->is_authorized()) {
        printf('
                <form action="" method="post">
                    <b>Status:</b> <input type="text" name="status" /> <input type="submit" value="Update!" />
                </form>%s', isset($_POST['status']) && $myo->update_status($_POST['status']) ? "Status successfully updated to <b>" . htmlentities(stripslashes($_POST[status])) . "</b>" : "");
        # If status is submitted, update it!
    }
    else {
        print $auth;
    }
    print '
            </fieldset>
        </div>';
    if($myo->is_authorized()) {
        print ' 
        <div id="killer"><input type="button" onclick="javascript:window.location = \'./?kill\'" value="Log out" /></div>';
    }
?>
    
    </body>
</html>
