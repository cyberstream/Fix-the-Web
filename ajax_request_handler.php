<?php 
require_once 'config.php';

if (isset($_GET) && count($_GET)) {
    // process HTTP GET requests
} elseif (isset($_POST) && count($_POST)) {
    // process HTTP POST requests
} else echo 'Page not found!';