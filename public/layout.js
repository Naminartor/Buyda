const addFooter = () => {
    $("footer").load("footer.html")
};

const addTopBar = () => {
    $("#top-bar").load("top-bar.html")
};
function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    }
    else
    {
        begin += 2;
        var end = document.cookie.indexOf(";", begin);
        if (end == -1) {
        end = dc.length;
        }
    }
    // because unescape has been deprecated, replaced with decodeURI
    //return unescape(dc.substring(begin + prefix.length, end));
    return decodeURI(dc.substring(begin + prefix.length, end));
} 

const state={
    user: getCookie("sessionid")
}



$(document).ready(() => {
    $("#top-bar").parent().attr("class", "container-fluid p-0 d-flex flex-column")
    .attr("style", "min-height: 100%");
    addFooter();
    addTopBar();
    $("main").addClass("container-fluid  mb-auto");
});

const CONSTANTS = {
    CURRENCY: "€"
}
