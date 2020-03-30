import { addQueryParamsToUrl } from './url-util.js'

jQuery(document).ready(function () {

    function collectUtmParamsFromLocalStorage() {
        return JSON.parse(localStorage.getItem("swivle-tracking")) || {};
    }

    function containsUtmParams(queryString) {
        return queryString.indexOf("utm_") !== -1;
    }

    function isExternalReferrer(referrer) {
        return referrer && !referrer.indexOf("www.swivle");
    }

    function overwriteWithUtmParamsFromUrl(utmParams) {
        // maybe use new URLSearchParams(window.location.search)
        if (containsUtmParams(document.location.search)) {
            document.location.search.substr(1).split("&").forEach(function (keyValue) {
                const keyValueMap = keyValue.split("=");

                // Only when the variable is a UTM variable we will store it in the localstorage
                if (/^utm_\w+/i.test(keyValueMap[0])) {
                    utmParams[keyValueMap[0]] = keyValueMap[1];
                }
            });
        }
    }

    function collectUtmParams() {
        var utmParams = collectUtmParamsFromLocalStorage();

        overwriteWithUtmParamsFromUrl(utmParams);

        if (isExternalReferrer(document.referrer)) {
            utmParams["utm_referrer"] = document.referrer;
        }

        // Always add the website_source so we know where the swivle app link was clicked
        utmParams["website_source"] = window.location.href;

        return utmParams;
    }

    function insertUtmParamsOnLinksToSwivleApp(utmParams) {
        var utmQueryParams = jQuery.param(utmParams)
        jQuery('a[href*="app.swivle.com"]').attr("href", function (index, href) {
            return addQueryParamsToUrl(href, utmQueryParams)
        });
    }

    var utmParams = collectUtmParams();
    localStorage.setItem("swivle-tracking", JSON.stringify(utmParams));
    insertUtmParamsOnLinksToSwivleApp(utmParams);
});
