const params = new URLSearchParams(window.location.search);

const tableId = params.get("table");

let currentOrderId = null;
let allMenuItems = [];
let activeCategory = 'All';


// LOAD CURRENT ORDER
async function loadOrder() {
    try {
        const response = await fetch(
            `http://localhost:3000/current-order/${tableId}`
        );
        const order = await response.json();
        currentOrderId = order.OrderID;

        document.getElementById("table-title").innerText = `Table ${tableId} - Order #${currentOrderId}`;

        loadItems();
        loadMenu();
    } catch (error) {
        console.error("Failed to load order:", error);
    }
}

document.getElementById("receipt-btn").onclick = () => {
    window.location.href = `receipt.html?table=${tableId}`;
};


// LOAD MENU
async function loadMenu() {

    const response = await fetch(
        "http://localhost:3000/menu-items"
    );

    const items = await response.json();

    console.log(items);

    const container =
        document.getElementById("menu-buttons");

    container.innerHTML = "";

    items.forEach(item => {

        const button =
            document.createElement("button");

        button.innerHTML = `
            <span class="item-name">${item.Name}</span>
            <span class="price-tag">$${item.Price.toFixed(2)}</span>
        `;

        button.onclick = () => {

            addItem(
                item.Name,
                item.Category,
                1,
                item.Price
            );
        };

        container.appendChild(button);
    });
}


// LOAD ORDER ITEMS
async function loadItems() {

    const response = await fetch(
        `http://localhost:3000/order-items/${currentOrderId}`
    );

    const items = await response.json();

    const container =
        document.getElementById("items-container");

    container.innerHTML = "";

    let total = 0;

    items.forEach(item => {

        const div = document.createElement("div");

        div.className = "order-item";

        div.innerHTML = `
            <button onclick="updateQty('${item.Name}', 'decrease')">➖</button>

            ${item.Name} x${item.Quantity} - $${item.Price}

            <button onclick="updateQty('${item.Name}', 'increase')">➕</button>
        `;

        container.appendChild(div);

        total += item.Price * item.Quantity;
    });

    // TAX + TOTAL
    const tax = total * 0.1;

    const finalTotal = total + tax;

    document.getElementById("subtotal").innerText =
        `Subtotal: $${total.toFixed(2)}`;

    document.getElementById("tax").innerText =
        `Tax: $${tax.toFixed(2)}`;

    document.getElementById("total-price").innerText =
        `Total: $${finalTotal.toFixed(2)}`;
}


// ADD ITEM
async function addItem(name, category, qty) {
    try {
        await fetch(`http://localhost:3000/add-item`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderId: currentOrderId,
                name: name,
                category: category,
                qty: qty
            })
        });
        loadItems();
    } catch (error) {
        alert("Could not add item. Check connection.");
    }
}


// UPDATE QUANTITY
async function updateQty(name, action) {
    try {
        await fetch(
            `http://localhost:3000/update-qty/${currentOrderId}/${name}/${action}`
        );
        loadItems();
    } catch (error) {
        console.error("Update failed:", error);
    }
}


// CLOSE ORDER
async function closeOrder() {

    await fetch(
        `http://localhost:3000/close-order/${tableId}`
    );

    alert("Order Closed");

    window.location.href = "index.html";
}


loadOrder();