<?php
// TODO fill in this file with the appropriate info for your database configuration

define ("DB_HOST", 'localhost');
define ("DB_USER", 'root');
define ("DB_PASS", 'son***');
define ("DB_NAME", 'fix-web');

$db = new mysqli (DB_HOST, DB_USER, DB_PASS, DB_NAME) or die('Could not connect to the database. If you are the server administrator, check your database configuration.');