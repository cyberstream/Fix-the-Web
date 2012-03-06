<?php
/**
 * Twitter class for Fix the Web
 */

require_once 'tmhOAuth.php';

class FixTheWeb {
    public $tmhOAuth;  
    public $userdata;
    protected $state;
    
    public function __construct(tmhOAuth $tmhOAuth)  {
        // save the tmhOAuth object  
        $this->tmhOAuth = $tmhOAuth;  

        // start a session if one does not exist  
        if(!session_id()) {  
            session_start();  
        }  

        // determine the authentication status  
        // default to 0  
        $this->state = 0;  
        
        // 2 (authenticated) if the cookies are set  
        if(isset($_COOKIE["access_token"], $_COOKIE["access_token_secret"])) {  
            $this->state = 2;  
        } elseif (isset($_SESSION["authstate"])) {  // otherwise use value stored in session  
        $this->state = (int)$_SESSION["authstate"];  
        }  

        // if we are in the process of authentication we continue  
        if ($this->state == 1) {  
            $this->auth();  
        } elseif ($this->state == 2 && !$this->auth()) {  // verify authentication, clearing cookies if it fails  
            $this->endSession();  
        }  
    }
    
    private function getRequestToken() {  
        // send request for a request token  
        $this->tmhOAuth->request("POST", $this->tmhOAuth->url("oauth/request_token", ""), array(  
            'oauth_callback' => $this->tmhOAuth->php_self()
        ));  

        if($this->tmhOAuth->response["code"] == 200) {  
            // get and store the request token  
            $response = $this->tmhOAuth->extract_params($this->tmhOAuth->response["response"]);  
            $_SESSION["authtoken"] = $response["oauth_token"];  
            $_SESSION["authsecret"] = $response["oauth_token_secret"];  

            // state is now 1  
            $_SESSION["authstate"] = 1;  

            // redirect the user to Twitter to authorize  
            $url = $this->tmhOAuth->url("oauth/authenticate", "") . '?oauth_token=' . $response["oauth_token"];  
            header("Location: " . $url);  
            exit;  
        } 
        
        return false;  
    }  
    
    /** 
     * Obtain an access token from Twitter 
     * 
     * @return bool False if request failed 
     */  
    private function getAccessToken() {  
        // set the request token and secret we have stored  
        $this->tmhOAuth->config["user_token"] = $_SESSION["authtoken"];  
        $this->tmhOAuth->config["user_secret"] = $_SESSION["authsecret"];  

        // send request for an access token  
        $this->tmhOAuth->request("POST", $this->tmhOAuth->url("oauth/access_token", ""), array(  
            // pass the oauth_verifier received from Twitter  
            'oauth_verifier'    => $_GET["oauth_verifier"]  
        ));  

        if($this->tmhOAuth->response["code"] == 200) {  
            // get the access token and store it in a cookie  
            $response = $this->tmhOAuth->extract_params($this->tmhOAuth->response["response"]);  
            setcookie("access_token", $response["oauth_token"], time()+3600*24*30);  
            setcookie("access_token_secret", $response["oauth_token_secret"], time()+3600*24*30);  

            // state is now 2  
            $_SESSION["authstate"] = 2;  

            // redirect user to clear leftover GET variables  
            header("Location: " . $this->tmhOAuth->php_self());  
            exit;  
        }
        return false;  
    }
    
    /** 
     * Verify the validity of our access token 
     * 
     * @return bool Access token verified 
     */  
    private function verifyAccessToken() {  
        $this->tmhOAuth->config["user_token"] = $_COOKIE["access_token"];  
        $this->tmhOAuth->config["user_secret"] = $_COOKIE["access_token_secret"];  

        // send verification request to test access key  
        $this->tmhOAuth->request("GET", $this->tmhOAuth->url("1/account/verify_credentials"));  

        // store the user data returned from the API  
        $this->userdata = json_decode($this->tmhOAuth->response["response"]);  

        // HTTP 200 means we were successful  
        return($this->tmhOAuth->response["code"] == 200);  
    } 
    
    /** 
     * Authenticate user with Twitter 
     * 
     * @return bool Authentication successful 
     */  
    public function auth() {  
        // state 1 requires a GET variable to exist  
        if($this->state == 1 && !isset($_GET["oauth_verifier"])) {  
            $this->state = 0;  
        }

        // Step 1: Get a request token  
        if($this->state == 0) {  
            return $this->getRequestToken();  
        }
        // Step 2: Get an access token  
        elseif($this->state == 1) {  
            return $this->getAccessToken();  
        }  

        // Step 3: Verify the access token  
        return $this->verifyAccessToken();  
    }  
    
    /** 
     * Remove user's access token cookies 
     */  
    public function endSession() {  
        $this->state = 0;  
        $_SESSION["authstate"] = 0;  
        setcookie("access_token", "", 0);  
        setcookie("access_token_secret", "", 0);  
    }  
    
    public function isAuthed() {  
        return $this->state == 2;  
    }  
}