const addFooter = () => {
    $("footer").load("footer.html")
};

const addTopBar = () => {
    $("#top-bar").load("top-bar.html")
};
function getCookie(name) {
    const dc = document.cookie;
    const cookies = dc.split("; ")
        .map((c)=> c.split("="))
        .find((c)=> c[0] === name)?.[1];
    if (cookies){
        return decodeURI(cookies)
    }
    return 
} 

const state={
    user: getCookie("sessionid")
}

const modalShow = (title, msg, opt) => {
    $(".modal-title").text(title);
    $(".modal-body").text(msg);
    $(".modal-footer button[name=cancel]").text(opt?.cancel || "Close");
    $(".modal-footer button[name=ok]").text(opt?.ok || "Ok");
    if (opt?.single){
        $(".modal-footer button[name=cancel]").hide();
    }else{
        $(".modal-footer button[name=cancel]").show();
    }
    $('#modal').modal('toggle');
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
