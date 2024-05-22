async function renderItem(items) {
    $("#shop-item-container").empty();
    items.forEach((item) => {
        const $item = $("<p></p>").append($("#item").html());
        $item.find("img").attr("src", `${item.img}`);
        $item.find("img").attr("alt", item.name);
        $item.find("h5").text(item.name);
        $item.find("a").attr("href", `item#${item.name}`);
        $item.find("a").text(`${item.price.toFixed(2)} ${CONSTANTS.CURRENCY}`);
        $("#shop-item-container").append($item.html());
    });
}
$(document).ready(async () => {
     const evalFilter =async (event)=>  {
        const urlParams = new URLSearchParams();
        const formData = new FormData(document.getElementById("filter-form"));
        console.log(formData.entries());
        for (const [key, value] of formData.entries()) {
            if (key.startsWith("m-")){
                urlParams.append("mcat", key.substring(2));
            }
            if (key.startsWith("s-")) {
                urlParams.append("scat", key.substring(2));
            }
        }

        //repalcement of the current url without reloading the page
        const newRelativePathQuery = window.location.pathname + "?" + urlParams.toString()
        history.pushState(null, "", newRelativePathQuery);
        const items = await api.getItems({ limit: 50, offset: 0, majorCategory: urlParams.getAll("mcat"), subCategory: urlParams.getAll("scat") });
        
        renderItem(items);
        
    }
    
    const urlParams = new URLSearchParams( window.location.search);
    const mcats = urlParams.getAll("mcat");
    const scats = urlParams.getAll("scat");
    const search = urlParams.get("search");
    
    console.log(mcats);
    const categories = await api.getMajorCategories();
    const $filter = $("#filter-list");
    
    for (const mcat of categories) {
        const subCategories = await api.getSubCategories(mcat);
        const $entry = $("<p></p>").append($("#filter-entry").html())
        $entry.find("label").attr("for", `filter-${mcat}`);
        $entry.find("input").attr("id", `filter-${mcat}`);
        if (mcats.includes(mcat)) {
            $entry.find("input").attr("checked", "checked");
        }
        $entry.find("input").attr("name", `m-${mcat}`);
        $entry.find("input:checkbox").change(evalFilter);
        $entry.find("span").text(mcat);
        subCategories.forEach((scat) => {
            const $subentry = $("<p></p>").append($("#filter-subentry").html());
            $subentry.find("label").attr("for", `filter-${scat}`);
            $subentry.find("input").attr("id", `filter-${scat}`);
            $subentry.find("input").attr("name", `s-${scat}`);
            if (scats.includes(scat)) {
                $subentry.find("input").attr("checked", "checked");
            }
            $subentry.find("span").text(scat);

            $entry.find("ul").append($subentry.html());
        });
        $filter.append($entry.html());
    }
    $filter.find("input").each((i, elem) => {
        elem.addEventListener("change", evalFilter);
    });
    if (search) {
        const items = await api.searchItems(search,{ limit: 50, offset: 0 });
        await renderItem(items);
    }else{
        const items = await api.getItems({ limit: 50, offset: 0, majorCategory: mcats, subCategory: scats });
        await renderItem(items);
    }
});


