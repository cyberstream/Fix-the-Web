#Server Side Files for "Fix the Web"

This repository contains the server-side files for the [Fix the Web](http://github.com/cyberstream/Fix-the-Web) Opera extension project.

*ajax_request_handler.php* handles for AJAX requests from the extension. All exported data is printed instead of returned because it is used by AJAX.
*index.php* is the home page of this extension.
*db.php* is the configuration file for the MySQL database.

##Configuration

In order to test the extension locally, there are a couple things that must be initialized or configured.

1. If you have a server and database installed such as WAMPServer, MAMP, LAMP, or something comparable, then put these files in/beneath the server web root directory.

2. Insert the appropriate details for your database in *db.php*. Visit the *install.php* page in your web browser to create the tables needed for the project. 

3. In [Fix the Web/scripts](https://github.com/cyberstream/Fix-the-Web/tree/master/scripts), in the *background.js* file, in the CONFIG section at the top of the file, specify the path to these server-side file on your local web server.

Now *Fix the Web* should run just fine!