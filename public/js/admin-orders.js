   document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("download-invoice-btn")) {
        const orderId = e.target.dataset.orderId;

        try {
            const response = await fetch(`/api/orders/${orderId}/invoice`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `invoice_order_${orderId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            
            showNotification("Ошибка при скачивании накладной");
        }
    }
});





    document.addEventListener("DOMContentLoaded", async () => {
        const orderList = document.getElementById("order-list");
        const token = localStorage.getItem("token");

        if (!token) {
            showNotification("Пожалуйста, авторизуйтесь");
            window.location.href = "/login.html";
            return;
        }

        try {
            // Получаем все заказы
            const response = await fetch("/api/admin/orders", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Не удалось получить заказы");
            }

            const orders = await response.json();
            if (orders.length === 0) {
                orderList.innerHTML = "<p>Нет заказов</p>";
            }

            orders.forEach(order => {
                const orderElement = document.createElement("div");
                orderElement.classList.add("order-item");

                const username = order.User ? order.User.username : "Неизвестный пользователь";
                const email = order.User ? order.User.email : "Неизвестный email";

                orderElement.innerHTML = `
                    <h3>Заказ №${order.id}</h3>
                    <p>Пользователь: ${username} (${email})</p>
                    <p>Дата: ${new Date(order.orderDate).toLocaleDateString()}</p>
                    <p>Статус: <strong>${order.status}</strong></p>
                    <button onclick="updateOrderStatus(${order.id}, 'Выполнен')">Отметить как выполненный</button>
                    <button onclick="updateOrderStatus(${order.id}, 'Отменен')">Отметить как отмененный</button>
                    <button class="download-invoice-btn" data-order-id="${order.id}">Скачать накладную</button>
                `;
                orderList.appendChild(orderElement);
            });

        } catch (error) {
            
            showNotification("Ошибка при загрузке заказов");
        }
    });

    // Функция для изменения статуса заказа
    async function updateOrderStatus(orderId, status) {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`/api/admin/orders/${orderId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                throw new Error("Не удалось обновить статус заказа");
            }

            showNotification("Статус заказа успешно обновлен");
            window.location.reload();
        } catch (error) {
            
            showNotification("Ошибка при изменении статуса заказа");
        }
    }
