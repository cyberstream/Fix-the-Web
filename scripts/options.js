$.support.cors = true;

// get recent blog posts from Fix the Web's blog
$(function() {
    $.get('http://my.opera.com/fix-the-web/xml/rss/blog', function(data) {
        var items = $('item', data);

        // populate the list with the the 7 most recent blog posts
        for (i in items) {
            if ( i > 7 ) break;
            if ( !items[i] || typeof items[i].getElementsByTagName != 'function' || i == 'context' ) continue;

            var link = items[i].getElementsByTagName('link')[0].firstChild.nodeValue,
                    title = items[i].getElementsByTagName('title')[0].firstChild.nodeValue,
                    time = items[i].getElementsByTagName('pubDate')[0].firstChild.nodeValue

            try {
                time = new Date(time);

                switch( Math.floor ((new Date() - time) / (1000 * 60 * 60 * 24)) ) { // this is the number of days since the article was posted
                    case 0 :
                        time = i18n.posted_today
                        break;
                    case 1 :
                        time = i18n.posted_yesterday
                        break;
                    case 2 : 
                        time = i18n.posted_two_days_ago
                        break;
                    case 3 :
                        time = i18n.posted_three_days_ago
                        break;
                    case 4 :
                        time = i18n.posted_four_days_ago
                        break;
                    case 5 :
                        time = i18n.posted_five_days_ago
                        break;
                    case 6 : 
                        time = i18n.posted_six_days_ago
                        break;
                    case 7 :
                        time = i18n.posted_a_week_ago
                        break;
                    default:
                        time = time.toLocaleDateString();
                }                         

            } catch (e) {
                time = '';
            }

            $('<li><a href="' +link+ '" title="' + i18n.click_to_read_more + '" target="_blank">' +title+ '</a> <strong class="light">' +time+ '</strong></li>').appendTo('#recent-posts');
        }

        if ($('#recent-posts').children().length) {
            $('<h3 id="blog-header">' + i18n.latest_posts + '</h3>').insertBefore('#recent-posts')

            var k = -1,
                    posts = $('#recent-posts').children();

            function loop () {
                var previous = k;

                if (k + 1 == posts.length) k = 0;
                else k++;

                $(posts[previous]).removeClass('current');
                $(posts[k]).addClass('current');

                setTimeout(loop, 4000);
            }

            loop();
        }
    });
});

var form = document.getElementById("prefs-form"),
        fields = form.querySelectorAll("input[type='range'], input[type='radio'], textarea");
var sliderOptions = {
    '780': i18n.every_day,
    '840': i18n.every_three_days,
    '900': i18n.every_week,
    '960': i18n.manually_only,
    '0': i18n.browser_start
}

// Set the preference values for each field
function savePrefs (event) {
    if (event.target.name == 'display-reports-by') {
        widget.preferences.setItem(event.target.name, event.target.id.replace('display-reports-by-', ''));
    } else if (event.target.name == 'update-interval') {
        widget.preferences.setItem('update-interval', event.target.value);
    } else widget.preferences.setItem(event.target.name, event.target.value);
}

// Get the preference values from the widget object
function loadPrefs() {
    for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        if (typeof widget.preferences[field.name] !== "undefined") {
            if (field.getAttribute('type') == 'radio') {
                if (widget.preferences.getItem(field.name) == field.value) field.checked = 'checked';
            } else field.value = widget.preferences.getItem(field.name)
        }

        field.addEventListener("change", savePrefs, false);
    }

    updateIntervalValue();
}

function readableInterval (minutes) {
    var minutes = parseInt(minutes),
            readable;

    if ( minutes == 60 ) readable = i18n.every_hour;
    else if ((minutes > 720 && minutes % 60 == 0) || minutes == 0) readable = sliderOptions[minutes];
    else if ( minutes == 30 ) readable = i18n.every_half_hour;
    else if ( minutes % 60 == 0 ) readable = (minutes / 60) + ' ' + i18n.hours;
    else if ( minutes % 60 == 30 ) readable = (minutes - 30) / 60 + '.5 ' + i18n.hours;
    else readable = minutes + ' ' + i18n.minutes;

    return readable;
}

// That function shows update-interval's value in a visible HTML element
function updateIntervalValue () {
    var interval = parseInt(document.getElementById("update-interval").value);

    document.getElementById("update-interval-value").innerText = readableInterval(interval);
}

// when the page is loaded, get extension preferences and assign them into correct input elements
window.addEventListener("load", function() {
    loadPrefs();

    if (location.hash == '' || !document.getElementById(location.hash.replace('#', ''))) location.hash = 'options'
    else document.getElementById(location.hash.replace('#', '')).className = 'active';

    var sections = document.querySelectorAll("section"),
            nav = document.getElementById('nav'),
            currentSection = document.getElementById(location.hash.replace('#', '')),
            versionLabel = document.querySelector('.version_number');

    versionLabel.innerText = widget.version;

    currentSection.className = 'active';

    for (i = 0; i < sections.length; i++) {
        var thisID = sections[i].id;
        activeClass = ('#' + thisID == location.hash ? ' class="active"' : '');

        nav.innerHTML += '<a href="#' +thisID + '" id="' +thisID + '-tab"' +activeClass+ '>' +i18n[thisID.toLowerCase()]+ '</a>';
    }
}, false);

// when update interval is changed, update the value in the visible area
document.getElementById("update-interval").addEventListener("change", updateIntervalValue, false);

$('#update').click(function() {
    if ( !$('#update + .loading_spinner').length )
        $('<img src="../images/loading.png" class="loading_spinner" />').insertAfter('#update');

    var updated = update(function(u) {
        $('#update + .loading_spinner').remove();
        
        // Display the appropriate message since the update was completed
        if (u == 2) $.modal(i18n.css_patches_was_updated, { overlayClose: true });
        else if (u == 1) $.modal(i18n.css_patches_file_unchanged, { overlayClose: true });
        else $.modal(i18n.css_patches_update_error + (u != 0 ? ': \n\n' + u : '.'), { overlayClose: true });
    });
});

function freezeClick(e) {
    e.preventDefault();
}

window.addEventListener('hashchange', function() {
    var lastTab = document.querySelector('a.active'),
            lastSection = document.querySelector('section.active'),
            currentHash = location.hash.replace('#', '') || '',
            currentTab = document.getElementById(currentHash + '-tab'),
            currentSection = document.getElementById(currentHash);

    if (currentHash == '' || !currentSection) { // don't allow the URL to change to an empty hash
        location.hash = 'options';
        return;
    }

    lastTab.className = '';
    lastSection.className = 'inactive';
    currentTab.className = 'active';

    // cancel any click events temporarily to fix the problem of tabs not working after you click a non-active tab during animation
    window.addEventListener('click', freezeClick, false);

    /*setTimeout*/(function() {
        lastSection.className = '';
        currentSection.className = 'active';

        // remove the "click freeze"
        window.removeEventListener('click', freezeClick, false);
    })()
}, false);

// OAuth authentication

if ( isLoggedIn() ) {
    $('#connected').removeClass('hide');
    $('#loading').attr('class', 'hide');
} else {
    $('#auth').removeClass('hide');
    $('#loading').attr('class', 'hide');
}

// disconnect from your Twitter account
$(function() {
    $('#disconnect').click(function(e) {
        alert('hi')
        e.preventDefault();

        $('#connected').fadeOut(500, function() {
            widget.preferences.access_token = ''; // remove the access token from local storage

            $('#auth').removeClass('hide');
            $('#auth').css('opacity', 0).animate({
                opacity: 1
            }, 650);
        });
    });
});

$('#auth').bind('submit', function() {
    $.modal (i18n.sign_in_error, { overlayClose: true });

    return false;
});

$('#twitter-login').click(function() { // Twitter OAuth
    oauth = new OAuth(CONFIG.twitter);
    oauth.fetchRequestToken(function(url) {
        window.open(url, 'authorise', 'width=700,height=400,resizable=no');
    }, failureHandler);

    $.modal (i18n.sign_in_info, {maxWidth: Math.abs(window.innerWidth - 150), overlayClose: true})

    $('#auth').unbind('submit'); // detach the previously attached event handler

    $('#auth').bind('submit', function() { // add new event handler
        var pin = $('#pin-number', this).val();

        if (!pin || !pin.length) $.modal(i18n.no_pin_error, { overlayClose: true })
        else {
            $('#auth').fadeTo(500, 0.4);

            oauth.setVerifier (pin);

            oauth.fetchAccessToken(function(data) {
                var query_string = parseQueryString(data.text),
                        oauth_access_token = query_string.oauth_token || '',
                        oauth_access_secret = query_string.oauth_token_secret || '';

                widget.preferences.access_token = oauth_access_token + '|' + oauth_access_secret;

                // hide authorization form and show the "logged in" paragraph
                $('#auth').addClass('hide');
                $('#connected').removeClass('hide');

                $.modal(i18n.signed_in, { overlayClose: true });
            }, failureHandler);
        }

        return false;
    });

    return false;
});

function failureHandler (data) { data ? console.log(data) : console.log(i18n.request_failed) }

// parses a query string and returns
function parseQueryString (a,b,c,d,e) {for(b=/[?&]?([^=]+)=([^&]*)/g,c={},e=decodeURIComponent;d=b.exec(a.replace(/\+/g,' '));c[e(d[1])]=e(d[2]));return c;}

// Update the error reports summary list when the button is clicked
$('#update-list').click(function() {
    if ( !$('#update-list + .loading_spinner').length )
        $('<img src="../images/loading.png" class="loading_spinner" />').insertAfter('#update-list');
    
    updateReportSummary (function(message) {
        $('#update-list + .loading_spinner').remove();
        
        // Display the appropriate message since the update was completed
        if ( message === 'updated' ) 
            $.modal(i18n.badge_list_was_updated, { overlayClose: true });
        else if ( message === 'current' ) 
            $.modal(i18n.badge_list_file_unchanged, { overlayClose: true });
        else if ( message === 'connect-error' )
            $.modal(i18n.badge_list_connect_error, { overlayClose: true });
        else
            $.modal(i18n.badge_list_error, { overlayClose: true });
    });
});