export function addQueryParamsToUrl(href, queryParams) {
    if (href.indexOf("?") !== -1) {
        return href.replace("?", "?" + queryParams + "&");
    }
    if (href.indexOf("#") !== -1) {
        return href.replace("#", "?" + queryParams + "#");
    }
    return href + "?" + queryParams;
}
