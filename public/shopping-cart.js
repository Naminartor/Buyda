$(document).ready(async function () {
    let sum = 0;
    let amount = 0;
    let shippingcost = 5;
    const items = await api.getCart();
    let $cart = $("#cart ul");
    items.forEach((cardItem) => {
        const template = $("#item-template").html();
        const $item = $(template);
        console.log(cardItem);
        $item.find("img").attr("src", cardItem.img);
        $item.find("div.name").text(cardItem.name);
        $item.find(".price").text(cardItem.price + CONSTANTS.CURRENCY);
        $item.find(".amount").text(cardItem.amount);
        $item.find(".delete").click(() => {
            (async () => {
                await api.deleteCart(cardItem.name);
                location.reload();
            })();
        });
        sum += cardItem.price * cardItem.amount;
        amount += cardItem.amount;
        $cart.append($item);
    });
    console.log(sum);
    $("#summary").text(sum + CONSTANTS.CURRENCY);
    $("#item-count").text(amount);
    $("#shipping-cost").text(`${shippingcost} ${CONSTANTS.CURRENCY}`);
    $("#total").text(sum + shippingcost + CONSTANTS.CURRENCY);

    $("#buy").click((e) => {
        e.preventDefault();
        e.stopPropagation();
        (async () => {
            const err = await api.checkout();
            if (!err) {
                window.location.href = "thank-you";
            } else {
                modalShow("Error", err?? "Something went wrong" , {single: true} );
            }
        })();
    });
});