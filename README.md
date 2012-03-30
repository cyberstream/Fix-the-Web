#What is Fix the Web?
*Fix the Web* is an extension-in-progress for [Opera Web Browser](http://www.opera.com/browser). Many web pages use malformed HTML, poorly-written Javascript, or bad web development practices such as browser-sniffing. Consequently, these pages could produce visual flaws, functional glitches, or even worse, be completely nonfunctional in Opera, a standards-conforming web browser. 

##What is purpose of this extension?
The goal of *Fix the Web* is to provide a solution to these problems by allowing users to report site problems they encounter, reply to others' bug reports, and, most importantly, apply patches to broken web pages.

##Applying patches and road-map
Before you apply a patch to a web page, determine how it needs to be fixed. If it only needs a CSS patch, then add the patch to the **patches.json** file in the [CSS patches repository](http://github.com/cyberstream/Fix-the-Web-CSS-Patches). However, if the web needs a Javascript patch, then add the patch in the **patches.js** file in the *includes/* folder in this repository. Read more about site patching [here](http://my.opera.com/fix-the-web/blog/2012/03/01/how-to-patch-a-web-page).

##Contribution
**This project is open source, so your contributions will help it grow. Fork the project and contribute!**

##Links
[Install](https://addons.opera.com/addons/extensions/download/fix-the-web/) the lastest stable version in the [Opera addons catalog](https://addons.opera.com/en/addons/extensions/details/fix-the-web/)

[Offical blog](http://my.opera.com/fix-the-web/blog/) - [Official forums](http://my.opera.com/fix-the-web/forums/)

[CSS Patches repository](https://github.com/cyberstream/Fix-the-Web-CSS-Patches/)

[Server-side repository](https://github.com/cyberstream/Fix-the-Web-Server-Side/) - **[Web Interface](http://www.operaturkiye.net/fix-the-web/)** - [Beta Web Interface](http://www.operaturkiye.net/beta/ftw/)

[How to Patch a Web Page](http://my.opera.com/fix-the-web/blog/2012/03/01/how-to-patch-a-web-page) - [How to Create CSS Patches](http://my.opera.com/fix-the-web/blog/2012/03/16/how-to-add-a-css-patch)