// app.js
document.addEventListener("DOMContentLoaded", async function () {
    // Получаем ID заказа из URL
    const orderId = new URLSearchParams(window.location.search).get("orderId");

    if (!orderId) {
        showNotification("Невозможно загрузить заказ без ID.");
        return;
    }

    try {
        const response = await fetch(`/api/order/${orderId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("authToken")}` // Подставляем токен из localStorage
            }
        });
        
        

        if (!response.ok) {
            throw new Error("Не удалось загрузить заказ");
        }

        const orderData = await response.json();
        displayOrderDetails(orderData);
    } catch (error) {
        
        showNotification("Ошибка при загрузке данных заказа");
    }
});

function displayOrderDetails(order) {
    // Отображаем основные данные заказа
    document.getElementById("orderId").innerText = order.id;
    document.getElementById("orderDate").innerText = new Date(order.orderDate).toLocaleDateString();
    document.getElementById("orderStatus").innerText = order.status;
    document.getElementById("totalAmount").innerText = order.totalAmount;

    // Отображаем товары в заказе
    const orderItemsTable = document.getElementById("orderItems").getElementsByTagName("tbody")[0];
    order.items.forEach(item => {
        const row = document.createElement("tr");

        const productCell = document.createElement("td");
        productCell.innerText = item.product.name;
        row.appendChild(productCell);

        const quantityCell = document.createElement("td");
        quantityCell.innerText = item.quantity;
        row.appendChild(quantityCell);

        const priceCell = document.createElement("td");
        priceCell.innerText = item.price;
        row.appendChild(priceCell);

        const totalAmountCell = document.createElement("td");
        totalAmountCell.innerText = item.totalAmount;
        row.appendChild(totalAmountCell);

        orderItemsTable.appendChild(row);
    });
}
