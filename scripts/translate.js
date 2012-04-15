/*global i18n */
var docElements = document.querySelectorAll('[data-i18n], [data-i18n-attr]');

if ( typeof i18n !== 'undefined' && typeof $ !== 'undefined' ) {
	document.addEventListener('DOMContentLoaded', function() {
		"use strict";
		var 
			domText = document.querySelector('html').innerHTML,
			placeholders = domText.match(/\{\{(.*?)\}\}/igm).map(function(v) {
				return v.replace(/(\{|\})/igm, '').toLowerCase();
			}),
			i, j, imax, jmax,
			thisPlaceholder, thisPhRegex,
			thisElement, translateAttr
		;

		for ( i = 0, imax = placeholders.length; i < imax; i++ ) {
			thisPlaceholder = placeholders[i];
			thisPhRegex = new RegExp('{{' + thisPlaceholder + '}}', 'igm');

			if (i18n[thisPlaceholder] !== 'undefined') {
				for ( j = 0, jmax = docElements.length; j < jmax; j++ ) {
					thisElement = docElements[j];
					translateAttr = thisElement.getAttribute('data-i18n-attr');

					thisElement.innerHTML = docElements[j].innerHTML.replace(thisPhRegex, i18n[thisPlaceholder]);

					// translate the specified attribute node
					if ( translateAttr && thisElement.getAttribute(translateAttr) ) {
						thisElement.setAttribute(translateAttr, thisElement.getAttribute(translateAttr).replace(thisPhRegex, i18n[thisPlaceholder]));
					}
				}
			}
		}
	});
}