function rebuyClickHandler(groupOrder) {
    return async () => {
        for (const order of groupOrder) {
            console.log(order);
            await api.addCart(order.item, order.amount);
        };
        window.location.href = "shopping-cart";
    };
}

function groupByTimeDelta(epsilon, orders) {
    const groupsOrders = [];
    let last_date = -epsilon - 1;
    let i = -1;
    orders.forEach((order) => {
        if (order.timestamp - last_date > epsilon) {
            last_date = order.timestamp;
            groupsOrders.push([]);
            i++;
        }
        groupsOrders[i].push(order);
    }
    );
    return groupsOrders;
}
function createOrder(order, $parent) {

    let $order = $('<p></p>').append($('#order-slot-template').html());
    //$order.find("img").attr("src", order.item.image)
    $order.find("p").text(`${order.name} / ${order.price.toFixed(2)}${CONSTANTS.CURRENCY}`);
    $order.find('img').attr('src', order.img);

    $parent.append($order.html())
}
function createGroupOrder (groupOrder) {
        const $groupOrder = $('<p></p>').append($('#order-template').html());
        const date = new Date(parseFloat(groupOrder[0].timestamp));
        $groupOrder.find("h3 span").text(date.toLocaleDateString());
        groupOrder.forEach((o) => createOrder(o, $groupOrder.find(".orderslot")));
        $('#orders').append($groupOrder.html())
            .children()
            .last()
            .find(".rebuy")
            .click(rebuyClickHandler(groupOrder));
};


$(document).ready(async () => {
    
    const epsilon = 100;
    const orders = await api.getOrderHistory()
    const groupsOrders = groupByTimeDelta(epsilon, orders);
    groupsOrders.forEach(createGroupOrder)
  });








