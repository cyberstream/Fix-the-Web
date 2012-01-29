<?php
    require "OAuth.php"; 
    
    class MyOpera {
        # Keeps track of the different URIs.
        private $base_uri = 'https://auth.opera.com/service/oauth/'; 
        private $uri = array(
            'api' => 'http://my.opera.com/community/api/users/status.pl', 
            'request_token' => 'request_token',
            'authorize' => 'authorize', 
            'access_token' => 'access_token',
        );

        # Keeping the settings for now
        private $settings = array(
            'consumer_key' => '',
            'consumer_secret' => '',
            'signature_method' => '',
        );
        
        # Declare the access token
        private $access_token = NULL; 
        
        # Constructor
        function MyOpera($key, $secret) {
            $this->settings['consumer_key'] = $key; 
            $this->settings['consumer_secret'] = $secret;
            $this->settings['signature_method'] = new OAuthSignatureMethod_HMAC_SHA1();
            $this->consumer = new OAuthConsumer($key, $secret);
        }
    
        ### Internal functions ###
    
        # Returns the correct token uri. Valid arguments are request_token, authorize and access_token
        private function token_uri($token) {
            return $this->base_uri . $this->uri[$token];
        }
    
        # Gets the response token and token secret from OAuth
        private function get_response($url) {
            $f = @fopen($url, "r"); 
            if(!$f) {
                // Couldn't get response
                return array("An error occured while contacting the OAuth server. Did you authenticate?"); 
            }
            $response = fgets($f);
            fclose($f);
            preg_match('/oauth_token=(\w+)&oauth_token_secret=(\w+)/', $response, $args); 
            return $args;
        }
        
        # Initializes a request token and signs it
        private function initialize_and_sign($token = NULL, $url, $params = NULL) {
            $request = OAuthRequest::from_consumer_and_token($this->consumer, $token, "GET", $url, $params);
            $request->sign_request($this->settings['signature_method'], $this->consumer, $token);
            return $request; 
        }
    
        ### Publicly available functions ###
    
        # Returns the URL to authorize with OAuth
        function get_auth_url($token) {
            return sprintf("%s?oauth_token=%s", $this->token_uri('authorize'), $token);
        }
    
        # Sends a request for a token and returns the tokens in an array. 
        function send_token_request() {
            $request = $this->initialize_and_sign(NULL, $this->token_uri('request_token'));
            # Gets the response from the request token
            $response = $this->get_response($request->to_url());
            # Shows the links to where the token has to be authorized
            return $response;
        }

        # Gets the access token from the OAuth server. 
        function get_access_token($token, $token_secret) {
            $request_token = new OAuthConsumer($token, $token_secret); 
            
            $access = $this->initialize_and_sign($request_token, $this->token_uri('access_token')); 
            # Gets the response from the access token. 
            $response = $this->get_response($access->to_url());
            
            # Initializes a new token based on the responses acquired from the access token
            $access_token = new OAuthConsumer($response[1], $response[2]);
            
            return $response;
        }
        
        # Sets the access token if it already exists
        function set_access_token($token, $token_secret) {
            $this->access_token = new OAuthConsumer($token, $token_secret);
        }
        
        # Checks to see whether we are authorized with OAuth or not. 
        function is_authorized() {
            return ($this->access_token != NULL);
        }
    
        # Updates the My Opera status to $status. 
        function update_status($status) {
            $update = $this->initialize_and_sign($this->access_token, $this->uri['api'], array("new_status" => stripslashes($status)));
            $f = @fopen($update->to_url(), "r");
            if(!$f) {
                return 0; 
            }
            fclose($f);
            return 1; 
        }

        # Gets the My Opera status for user $username. Returns an array with status, last updated and http code. 
        function get_status($username) {
            if(!$username) {
                return "Error. No username :("; 
            }
            
            $f = @fopen(sprintf("%s?username=%s", $this->uri['api'], urlencode($username)), "r");
            
            if(!$f) {
                // Something's fishy :(
                return "Couldn't access the API"; 
            }
            
            $json = "";
            while(!feof($f)) {
                $json .= fgets($f);
            }
            fclose($f);
            
            return json_decode($json, true);
        }
    }
?>
