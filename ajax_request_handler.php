<?php 
require_once 'config.php'; // include the database configuration file

if (isset($_GET) && count($_GET)) {
    if ($_GET['mode'] == 'submit error') {
        // process the error submission form
        // if the data is processed and inserted into the database successfully then echo "true":
        exit ('true');
    } 
} else echo 'Page not found!';