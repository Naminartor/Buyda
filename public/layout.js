const addFooter = () => {
    $("footer").load("footer.html")
};

const addTopBar = () => {
    $("#top-bar").load("top-bar.html")
};

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
