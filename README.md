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

##Links
Install the lastest stable version in the [Opera addons catalog](https://addons.opera.com/en/addons/extensions/details/fix-the-web/)

[Offical blog](http://my.opera.com/fix-the-web/blog/) - [Official forums](http://my.opera.com/fix-the-web/forums/)

[CSS Patches repository](https://github.com/cyberstream/Fix-the-Web-CSS-Patches/)

[Server-side repository](https://github.com/cyberstream/Fix-the-Web-Server-Side/) - **[Web Interface](http://www.operaturkiye.net/fix-the-web/)** - [Beta Web Interface](http://www.operaturkiye.net/beta/ftw/)

[How to Patch a Web Page](http://my.opera.com/fix-the-web/blog/2012/03/01/how-to-patch-a-web-page) - [How to Create CSS Patches](http://my.opera.com/fix-the-web/blog/2012/03/16/how-to-add-a-css-patch)