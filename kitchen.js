const socket = io("http://localhost:3000");

async function loadKitchenOrders() {
    const response = await fetch(
        "http://localhost:3000/orders"
    );

    const orders = await response.json();

    const container =
        document.getElementById("kitchen-orders");

    container.innerHTML = "";

    for (const order of orders) {
        // SHOW ONLY ACTIVE ORDERS
        if (order.Status === "closed" || order.Status === "ready") {
            continue;
        }

        // CREATE ORDER CARD
        const card = document.createElement("div");

        // Add a class based on status for visual feedback
        card.className = `table-card ${order.Status}`;

        let html = `
            <h2>Table ${order.TableID} <small>(${order.Status})</small></h2>
        `;
        // Use the items attached to the order object returned by the server
        order.items.forEach(item => {
            html += `
                <p>
                    ${item.Name} x${item.Quantity}
                </p>
            `;
        });

        html += `
    <button class="btn-preparing" onclick="updateStatus(${order.OrderID}, 'preparing')">
        Preparing
    </button>
    <button class="btn-ready" onclick="updateStatus(${order.OrderID}, 'ready')">
        Ready
    </button>
`;

        card.innerHTML = html;

        container.appendChild(card);
    }
}

// UPDATE STATUS
async function updateStatus(orderId, status) {

    await fetch(
        `http://localhost:3000/update-order-status/${orderId}/${status}`
    );

    loadKitchenOrders();
}
// FIRST LOAD
loadKitchenOrders();

// REALTIME UPDATES
socket.on("ordersUpdated", () => {
    console.log("🔄 Kitchen Updated");
    loadKitchenOrders();
});