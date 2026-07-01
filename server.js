const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Mock Database (In real life, use SQLite or PostgreSQL)
let tables = [
    { TableID: 1, Status: 'available' },
    { TableID: 2, Status: 'available' },
    { TableID: 3, Status: 'available' },
    { TableID: 4, Status: 'available' }
];

const menuItems = [
    { Name: 'Burger', Category: 'Main', Price: 12.50 },
    { Name: 'Pizza', Category: 'Main', Price: 15.00 },
    { Name: 'Fries', Category: 'Side', Price: 4.00 },
    { Name: 'Soda', Category: 'Drink', Price: 2.50 }
];

let orders = []; // { OrderID, TableID, Status, CreatedAt }
let orderItems = []; // { OrderID, Name, Quantity, Price, Category }

const getActiveOrder = (tableId) => orders.find(o => o.TableID == tableId && o.Status !== 'closed');

// Endpoints
app.get('/tables', (req, res) => res.json(tables));

app.get('/menu-items', (req, res) => res.json(menuItems));

app.get('/current-order/:tableId', (req, res) => {
    let order = getActiveOrder(req.params.tableId);
    if (!order) {
        order = {
            OrderID: orders.length + 1,
            TableID: parseInt(req.params.tableId),
            Status: 'new',
            CreatedAt: new Date()
        };
        orders.push(order);
        tables.find(t => t.TableID == req.params.tableId).Status = 'occupied';
        io.emit('tablesUpdated');
    }
    res.json(order);
});

app.get('/order-items/:orderId', (req, res) => {
    res.json(orderItems.filter(i => i.OrderID == req.params.orderId));
});

app.get('/orders', (req, res) => {
    // Optimized: Send orders ALONG WITH their items to save frontend fetches
    const ordersWithItems = orders.map(order => ({
        ...order,
        items: orderItems.filter(item => item.OrderID === order.OrderID)
    }));
    res.json(ordersWithItems);
});

app.post('/add-item', (req, res) => {
    const { orderId, name, category, qty } = req.body;
    const menuInfo = menuItems.find(m => m.Name === name);
    const price = menuInfo ? menuInfo.Price : 0;

    let item = orderItems.find(i => i.OrderID == orderId && i.Name === name);
    if (item) {
        item.Quantity += parseInt(qty);
    } else {
        orderItems.push({ OrderID: parseInt(orderId), Name: name, Category: category, Quantity: parseInt(qty), Price: price });
    }
    io.emit('ordersUpdated');
    res.sendStatus(200);
});

app.get('/update-qty/:orderId/:name/:action', (req, res) => {
    const { orderId, name, action } = req.params;
    let index = orderItems.findIndex(i => i.OrderID == orderId && i.Name === name);
    if (index !== -1) {
        if (action === 'increase') orderItems[index].Quantity++;
        else orderItems[index].Quantity--;

        if (orderItems[index].Quantity <= 0) orderItems.splice(index, 1);
        io.emit('ordersUpdated');
    }
    res.sendStatus(200);
});

app.get('/update-order-status/:orderId/:status', (req, res) => {
    const order = orders.find(o => o.OrderID == req.params.orderId);
    if (order) {
        order.Status = req.params.status;
        io.emit('ordersUpdated');
    }
    res.sendStatus(200);
});

app.get('/close-order/:tableId', (req, res) => {
    const order = getActiveOrder(req.params.tableId);
    if (order) {
        order.Status = 'closed';
        tables.find(t => t.TableID == req.params.tableId).Status = 'available';
        io.emit('tablesUpdated');
        io.emit('ordersUpdated');
    }
    res.sendStatus(200);
});

server.listen(3000, () => console.log('POS Backend running on port 3000'));