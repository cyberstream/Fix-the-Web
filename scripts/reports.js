$(function() {        
    function highlightCountOfItemsPerPage(data) {
        $('#change-count a.active').removeClass('active');
        $('#change-count a[data-count="' + data.count + '"]').addClass('active');

        $('#order-by a.active').removeClass('active');
        $('#order-by a[data-order=' + data.order + ']').addClass('active');
    }

    $('.change_state').click(function(e) {

        // prevent page from following the link
        e.preventDefault(); 

        // don't load new data if the button clicked is disabled
        if ( e.target.className.indexOf('disabled') != -1 ) return false; 

        // default values
        var queryString = parseQueryString(location.search) || '',
            page_num = queryString.page && parseInt(queryString.page) > 0 ? queryString.page : 1,
            reports_count = queryString.count && parseInt(queryString.count) > 0 ? parseInt(queryString.count) : 15,
            list_order = queryString.order && /^(most_followed|popularity|time_desc|time_asc)$/i.test(queryString.order) ? queryString.order : 'time_desc';

        var data = { 
                    page: $(this).data('page') || page_num,
                    count: $(this).data('count') || reports_count,
                    order: $(this).data('order') || list_order
                }

        highlightCountOfItemsPerPage(data)

        history.pushState(data, '', 'reports.html?page=' +data.page+ '&count=' +data.count+ '&order=' + data.order);

        $('#recent-reports').html('<li id="loading-img"><img src="../images/loading-circle.png" alt="' +i18n.loading+ '" title="' +i18n.loading+ '..." /></li>')
        outputReports (data.page, data.count, data.order); // update the reports

        changeButtonState();
    });

    // load reports from previous history state when the user clicks the back button            
    window.addEventListener ('popstate', function(data) {
        // display the loading animation icon
        $('#recent-reports').html('<li id="loading-img"><img src="../images/loading-circle.png" alt="' +i18n.loading+ '" title="' +i18n.loading+ '" /></li>');

        highlightCountOfItemsPerPage(data)

        // load reports into the page
        outputReports(data.state.page, data.state.count, data.state.order);
        changeButtonState()
    }, false);

    jQuery.support.cors = true; // enable cross-domain jQuery requests; if you don't do this, then you will get a "No Transport" error

    // parses a query string and returns 
    parseQueryString = function (a,b,c,d,e) {for(b=/[?&]?([^=]+)=([^&]*)/g,c={},e=decodeURIComponent;d=b.exec(a.replace(/\+/g,' '));c[e(d[1])]=e(d[2]));return c;}

    // modify the button state based on whether the next/previous pages exist
    changeButtonState = function () {
        var queryString = parseQueryString(location.search) || '',
                page_number = queryString.page && parseInt(queryString.page) > 0 ? parseInt(queryString.page) : 1,
                items_per_page = queryString.count && parseInt(queryString.count) > 0 ? parseInt(queryString.count) : 15;

        // disable the "back" button if this is page #1
        if (page_number <= 1) $('.pagination .previous').addClass('disabled')
        else $('.pagination .previous').removeClass('disabled')

        $('.pagination').addClass('hidden')                

        $.get(CONFIG.defaultHost + 'ajax_request_handler.php?mode=get_report_list&count=' + items_per_page + '&page=' + (page_number + 1), function(data) {
            if (!data) $('.pagination .next').addClass('disabled');
            else $('.pagination .next').removeClass('disabled');

            $('.pagination').removeClass('hidden')
        });

        $('.pagination .next').data('page', page_number + 1);
        $('.pagination .previous').data('page', page_number - 1);
        $('.pagination #page-number').html(page_number);
    }

    outputReports = function ( page_number, reports_per_page, order ) {

        // set default values for the reports query
        var order = order && /^(most_followed|popularity|time_desc|time_asc)$/i.test(order) ? order : 'time_desc',
                page_number = page_number && page_number > 0 ? page_number : 1,
                reports_per_page = reports_per_page && reports_per_page > 0 ? reports_per_page : 15;

        $.getJSON(CONFIG.defaultHost + 'ajax_request_handler.php?mode=get_report_list&order=' +order+ '&count=' + reports_per_page + '&page=' + page_number, function(data) {
            if (!data || data == '') $('#recent-reports').html('<li>' +i18n.no_reports+ ' <em><a href="#" class="change_state" onclick="history.go(-1); return false;">' +i18n.go_back+ '</a></em></li>')
            else {
                var output = '',
                        data = data.list;

                for ( i = 0; i < data.length; i++ ) {
                    var current = data[i],
                            page_url = '<a href="' +current.page+ '" title="Page: ' +current.page+ '" target="_blank">'
                            + (current.page.length > 40 ? current.page.substr(0, 40) + '...' : current.page) + '</a>',
                            severity = {
                                1 : i18n.minor_annoyance,
                                2 : i18n.major_problem,
                                3 : i18n.site_unusable
                            }

                    if (current.OS.length) {
                        var os_image;

                        if ( /windows/i.test(current.OS) ) os_image = '../images/windows.png'
                        else if ( /mac/i.test(current.OS) ) os_image = '../images/mac.png'
                        else if ( /linux/i.test(current.OS) ) os_image = '../images/linux.png'
                        else os_image = '../images/unidentified.png'
                    }

                    output += '<li title="' +i18n.click_to_expand_report+ '" data-id="' +current.id+ '" data-username="' +current.username+ '" data-category="' +current.category+ '" data-datetime="' +current.date_time+ '" data-url="' +current.page+ '" data-report="' +current.report+ '" data-version="' +current.Opera+ '" data-build="' +current.build+ '" data-platform="' +current.OS+ '" data-platform-icon="' +os_image+ '" data-plugins="' +encodeURIComponent(current.misc)+ '">'
                        + '<span class="severity_' +current.category+ '" title="' +(severity[current.category] || 'unknown')+ '"></span> <strong class="username">' +current.username+ '</strong> ' +i18n.reported_a_problem_on+ ' ' +page_url+ ' <span class="date_time">(' +current.date_time+ ')</span></li>';
                }

                $('#recent-reports').html(output)

                $('#recent-reports li').click(function() {
                    var url = $(this).data('url');
                    page_url = '<a href="' +url+ '" title="Page: ' +url+ '" target="_blank">'
                        + (url.length > 40 ? url.substr(0, 40) + '...' : url) + '</a>';

                    $.modal('<div id="report" data-id="' + $(this).data('id') + '"><span style="float: right;" class="severity_' +$(this).data('category')+ '" title="' +(severity[$(this).data('category')] || 'unknown')+ '"></span><strong>' +$(this).data('username')+ '</strong> ' + i18n.reported_a_problem_on + ' ' +page_url + ':' 
                        + '<p class="report">"' + $(this).data('report').replace(/\\/g, '') + '"</p>' + i18n.reported_on + ': <strong>' +$(this).data('datetime') + '</strong>'
                        + '<p><img class="os_icon" src="' +$(this).data('platform-icon') + '" title="' +$(this).data('platform')+ '" alt="' +$(this).data('platform')+ '" /> <em title="Opera ' +i18n.version+ ': ' + $(this).data('version') + ' ' +i18n.build_number+ ': ' + $(this).data('build') + '">' + $(this).data('version') + '.' + $(this).data('build') + '</em>'
                        + ' | <a title="' +i18n.click_to_see_plugins+ '" href="data:text/plain;charset=utf-8,' +$(this).data('plugins')+ '" target="_blank">' +i18n.plugins_and_screen+ '</a> | <a href="' + CONFIG.defaultHost + '?mode=get_comment_list&id=' + $(this).data('id') + '">' +i18n.comments+ '</a></p></div>', 
                    { onOpen: function (dialog) {
                            dialog.overlay.fadeIn('medium', function () {
                                    dialog.container.slideDown('medium', function () {
                                            dialog.data.fadeIn('medium', function() {

                                                // load comments thread after the dialog box is visible
                                                /*var report_id = $('#report', this).data('id');

                                                $.get(CONFIG.defaultHost + 'ajax_request_handler.php?mode=get_comment_list&id=' + report_id, function(data) {
                                                    data = JSON.parse(data || '[]')['list'] || '';

                                                    $('<div>' +(data.length ? data[0]['report'] : '')+ '</div>').appendTo('#simplemodal-data')
                                                });
                                                */
                                            });
                                    });
                            });
                        },
                        onClose: function (dialog) {
                            dialog.container.fadeOut('medium', function () {
                                dialog.overlay.fadeOut('medium', function () {
                                    $.modal.close(); // must call this!
                                });
                            });
                        },
                        maxWidth: window.innerWidth - 150,
                        maxHeight: window.innerHeight - 100
                    }); // end of the modal dialog functions
                }); // end function that handles displaying reports modal window
            } // end reports output
        });
    } // end outputReports() function

    var queryString = parseQueryString(location.search) || '',
            page_num = queryString.page && parseInt(queryString.page) > 0 ? queryString.page : 1,
            reports_count = queryString.count && parseInt(queryString.count) > 0 ? parseInt(queryString.count) : 15,
            list_order = queryString.order && /^(most_followed|popularity|time_desc|time_asc)$/i.test(queryString.order) ? queryString.order : 'time_desc';

    $('#change-count a.active').removeClass('active');
    $('#change-count a[data-count="' + reports_count + '"]').addClass('active');

    $('#order-by a.active').removeClass('active');
    $('#order-by a[data-order=' + list_order + ']').addClass('active');
    $('.pagination').addClass('hidden');

    outputReports(page_num, reports_count, list_order)
    changeButtonState()
    $('.pagination').removeClass('hidden')
});