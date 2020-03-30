let products = null;
let monthly = false;

jQuery(document).ready(function () {
    let toggleBtn = jQuery(".svl-price-toggle");
    if (toggleBtn.length === 0) {
        return;
    }
    toggleBtn.click(togglePrices);
    jQuery.ajax({
        url: endpoint(),
        type: "GET",
        headers: {
            "Access-Control-Allow-Origin": "x-requested-with, x-requested-by"
        },
        dataType: "json",
        crossDomain: true
    }).done(function (data) {
        products = data.products;
        updatePrices();
    });
});

function endpoint() {
    return window.location.hostname === "localhost"
        ? "https://gibson-master-eu-west-1.swivle.io/services/public/price"
        : "https://gibson.swivle.com/services/public/price";
}

function togglePrices() {
    monthly = !monthly;
    updatePrices();
}

function updatePrices() {
    if (!products) return;
    if (monthly) {
        jQuery(".svlkick-price").text(formatPriceMonth(products.SVLTSMX));
        jQuery(".svlgrow-price").text(formatPriceMonth(products.SVLTMMX));
        jQuery(".svlscale-price").text(formatPriceMonth(products.SVLTLMX));
    } else {
        jQuery(".svlkick-price").text(formatPriceYear(products.SVLTSYX));
        jQuery(".svlgrow-price").text(formatPriceYear(products.SVLTMYX));
        jQuery(".svlscale-price").text(formatPriceYear(products.SVLTLYX));
    }
}

function formatPriceYear(product) {
    if (!product) return "..";
    var value = Math.round(parseFloat(product.value / 12));
    return formatPriceKeepingCurrencyInPlace(product, value);
}

function formatPriceMonth(product) {
    if (!product) return "..";
    var value = Math.round(parseFloat(product.value));
    return formatPriceKeepingCurrencyInPlace(product, value);
}

function formatPriceKeepingCurrencyInPlace(product, value) {
    return product.display.replace(/(.*?)\d.*\d(.*)/, "$1" + Math.round(value) + "$2");
}

export default togglePrices;
