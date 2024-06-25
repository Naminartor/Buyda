/**
 * Epsilon - The time delta threshold for grouping orders.
 */
const EPSILON = 100;

/**
 * Click handler for the "rebuy" button.
 * @param {Order[]} groupOrder - The group order to process.
 * @returns {Function} - The click handler function.
 */
function rebuyClickHandler(groupOrder) {
    return async () => {
        for (const order of groupOrder) {
            console.log(order);
            await api.addCart(order.item, order.amount);
        }
        window.location.href = "shopping-cart";
    };
}

/**
 * Groups orders based on a time delta.
 * @param {number} epsilon - The time delta threshold.
 * @param {Order[]} orders - The orders to group.
 * @returns {Order[][]} - The grouped orders.
 */
function groupByTimeDelta(epsilon, orders) {
    const groupsOrders = [[]];
    let lastDate = orders[0].timestamp;
    let i = 0;
    orders.forEach((order) => {
        if (order.timestamp - lastDate > epsilon) {
            lastDate = order.timestamp;
            groupsOrders.push([]);
            i++;
        }
        groupsOrders[i].push(order);
    });
    return groupsOrders;
}

/**
 * Creates an order element.
 * @param {Order} order - The order data.
 * @param {jQuery} $parent - The parent element to append the order to.
 */
function createOrder(order, $parent) {
    let $order = $("<p></p>").append($("#order-slot-template").html());
    //$order.find("img").attr("src", order.item.image)
    $order.find("p").text(`${order.name} / ${order.price.toFixed(2)}${CONSTANTS.CURRENCY}`);
    $order.find("img").attr("src", order.img);
    $parent.append($order.html());
}

/**
 * Creates a group order element.
 * @param {Array<Order>} groupOrder - The group order data.
 */
function createGroupOrder(groupOrder) {
    const $groupOrder = $("<p></p>").append($("#order-template").html());
    const date = new Date(parseFloat(groupOrder[0].timestamp));
    $groupOrder.find("h3 span").text(date.toLocaleDateString());

    groupOrder.forEach((o) => createOrder(o, $groupOrder.find(".orderslot")));
    
    $("#orders")
        .append($groupOrder.html())
        .children()
        .last()
        .find(".rebuy")
        .click(rebuyClickHandler(groupOrder));
}

$(document).ready(async () => {
    const orders = await api.getUserOrderHistory();
    const groupsOrders = groupByTimeDelta(EPSILON, orders);
    groupsOrders.forEach(createGroupOrder);
});
