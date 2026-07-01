const socket = io("http://localhost:3000");

async function loadTables() {
    try {
        const response = await fetch("http://localhost:3000/tables");
        const tables = await response.json();
        const container = document.getElementById("tables-container");
        container.innerHTML = ""; // Clear existing tables

        tables.forEach(table => {
            const tableCard = document.createElement("div");
            tableCard.className = "table-card"; // Apply the new CSS class
            // Add status class based on table status (assuming 'occupied' or 'available')
            tableCard.classList.add(table.Status === 'occupied' ? 'occupied' : 'available');

            tableCard.innerHTML = `
                <h2>Table ${table.TableID}</h2>
                <p>Status: ${table.Status}</p>
            `;

            tableCard.addEventListener("click", () => {
                window.location.href = `order.html?table=${table.TableID}`;
            });

            container.appendChild(tableCard);
        });
    } catch (error) {
        console.error("Failed to load tables:", error);
        document.getElementById("tables-container").innerHTML = "<p style='text-align: center; color: #dc3545;'>Error loading tables. Please ensure the backend is running.</p>";
    }
}

loadTables(); // Initial load

socket.on("tablesUpdated", () => {
    console.log("🔄 Tables Updated");
    loadTables();
});