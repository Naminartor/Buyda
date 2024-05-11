





$(document).ready(async () => {
    const categories = await api.getMajorCategories();
    $filter = $("#filter-list");
    categories.forEach(async (mcat) => {
        subCategories = await api.getSubCategories(mcat);
        $entry = $("<p></p>").append($("#filter-entry").html())
        $entry.find("label").attr("for", `filter-${mcat}`);
        $entry.find("input").attr("id", `filter-${mcat}`);
        $entry.find("input").attr("name", `${mcat}`);
        $entry.find("span").text(mcat);
        subCategories.forEach((scat) => {
            $subentry = $("<p></p>").append($("#filter-subentry").html());
            $subentry.find("label").attr("for", `filter-${scat}`);
            $subentry.find("input").attr("id", `filter-${scat}`);
            $subentry.find("input").attr("name", `${scat}`);
            $subentry.find("span").text(scat);
            $entry.find("ul").append($subentry.html());
        });
        $filter.append($entry.html());
        let i = 0;
    });
    const items =  await api.getItems({limit:50, offset:0});
    items.forEach((item) => {
        $item = $("<p></p>").append($("#item").html());
        $item.find("img").attr("src", `${item.img}`);
        $item.find("img").attr("alt", item.name);
        $item.find("h5").text(item.name);
        $item.find("a").attr("href", `item.html#${item.name}`);
        $item.find("a").text(`${item.price.toFixed(2)} + ${CONSTANTS.CURRENCY}`);
        $("#shop-item-container").append($item.html());
    });
});