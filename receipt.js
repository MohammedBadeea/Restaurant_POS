const params = new URLSearchParams(window.location.search);

const tableId = params.get("table");

let currentOrderId = null;


// LOAD RECEIPT
async function loadReceipt() {

    // GET CURRENT ORDER
    const orderResponse = await fetch(
        `http://localhost:3000/current-order/${tableId}`
    );

    const order = await orderResponse.json();

    currentOrderId = order.OrderID;

    document.getElementById("receipt-table").innerText =
        `Table ${tableId}`;

    // GET ORDER ITEMS
    const itemsResponse = await fetch(
        `http://localhost:3000/order-items/${currentOrderId}`
    );

    const items = await itemsResponse.json();

    const container =
        document.getElementById("receipt-items");

    let total = 0;

    items.forEach(item => {

        const div = document.createElement("div");

        div.className = "order-item";

        div.innerHTML =
            `${item.Name} x${item.Quantity} - $${item.Price}`;

        container.appendChild(div);

        total += item.Price * item.Quantity;
    });

    // TOTALS
    const tax = total * 0.1;

    const finalTotal = total + tax;

    document.getElementById("receipt-subtotal").innerText =
        `Subtotal: $${total.toFixed(2)}`;

    document.getElementById("receipt-tax").innerText =
        `Tax: $${tax.toFixed(2)}`;

    document.getElementById("receipt-total").innerText =
        `Total: $${finalTotal.toFixed(2)}`;
}


loadReceipt();