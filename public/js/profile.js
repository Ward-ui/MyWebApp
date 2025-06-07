

// Функция валидации телефона формата +7 (XXX) XXX-XX-XX, +7XXX XXX XX XX, +7XXXXXXXXXX и т.п.
function validatePhone(phone) {
  // Убираем все нецифровые символы, кроме + в начале
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Проверяем начинается ли с +7 и далее ровно 10 цифр
  const regex = /^\+7\d{10}$/;

  return regex.test(cleaned);
}

document.addEventListener("DOMContentLoaded", async () => {
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const orderList = document.getElementById("order-list");
  const filterSelect = document.getElementById("filter-select");
  const editForm = document.getElementById("editForm");
  const fullNameInput = document.getElementById("fullName");
  const addressInput = document.getElementById("address");

  const token = localStorage.getItem("token");
  if (!token) {
    showNotification("Пожалуйста, авторизуйтесь");
    window.location.href = "/login.html";
    return;
  }

  try {
    const userResponse = await fetch("/api/profile", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!userResponse.ok) throw new Error("Не удалось получить данные пользователя");
    const userData = await userResponse.json();
    if (nameInput) nameInput.value = userData.name || "";
    if (emailInput) emailInput.value = userData.email || "";
    if (phoneInput) phoneInput.value = userData.phone || "";
    if (fullNameInput) fullNameInput.value = userData.fullName || "";
    if (addressInput) addressInput.value = userData.address || "";
  } catch (error) {
    console.error("Ошибка при получении данных пользователя:", error);
    showNotification("Произошла ошибка при загрузке данных пользователя.");
    return;
  }

  async function fetchOrders(filter = "") {
    try {
      const ordersResponse = await fetch("/api/profile/orders", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!ordersResponse.ok) throw new Error("Не удалось загрузить заказы");
      const orders = await ordersResponse.json();
      orderList.innerHTML = "";
      const filteredOrders = filter ? orders.filter(order => order.status === filter) : orders;

      if (filteredOrders.length === 0) {
        orderList.innerHTML = "<p>У вас нет заказов.</p>";
      } else {
        filteredOrders.forEach(order => {
          const orderElement = document.createElement("div");
          orderElement.classList.add("col-md-6", "col-lg-4");
         const productListId = `products-${order.id}`;

  orderElement.innerHTML = `
    <div class="card h-100 shadow-sm">
      <div class="card-header bg-primary text-white">
        <div class="d-flex justify-content-between">
          <span>Заказ №${order.id}</span>
          <span>${new Date(order.orderDate).toLocaleDateString()}</span>
        </div>
      </div>
      <div class="card-body">
        <p><strong>Статус:</strong> ${order.status}</p>
        <p><strong>Итого:</strong> ${order.totalAmount} ₽</p>
        <button class="btn btn-outline-secondary show-products-btn mb-2" data-order-id="${order.id}">Показать товары</button>
        <div class="product-list" id="${productListId}" style="display:none;"></div>
        ${order.status === "ожидает оплаты" ? `<button class="pay-btn btn btn-success" data-order-id="${order.id}">Оплатить</button>` : ""}
      </div>
    </div>
  `;
  orderList.appendChild(orderElement);
        });
      }
    } catch (error) {
      console.error("Ошибка при получении заказов:", error);
      showNotification("Произошла ошибка при загрузке заказов.");
    }
  }


  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("pay-btn")) {
        const orderId = e.target.dataset.orderId;
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`/api/orders/${orderId}/pay`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Ошибка при оплате заказа");
            }

            showNotification("Оплата успешно выполнена");
            window.location.reload(); // Перезагружаем страницу после успешной оплаты
        } catch (error) {
            console.error("Ошибка при оплате заказа:", error);
            showNotification("Произошла ошибка при оплате заказа");
        }
    }
});

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("show-products-btn")) {
    const orderId = e.target.dataset.orderId;
    const productList = document.getElementById(`products-${orderId}`);
    const token = localStorage.getItem("token");

    // Если товары уже показаны, просто скрыть
    if (productList.style.display === "block") {
      productList.style.display = "none";
      e.target.textContent = "Показать товары";
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}/items`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Ошибка при получении товаров заказа");

      const Order  = await response.json();
      const items = Order.items || [];
      console.log("товары:", items);
      if (items.length === 0) {
        productList.innerHTML = "<p>Нет товаров в заказе.</p>";
      } else {
        const list = document.createElement("ul");
        list.classList.add("list-group");

        items.forEach(item => {
          const li = document.createElement("li");
          li.classList.add("list-group-item");
          li.innerHTML = `<strong>${item.product.name}</strong> — ${item.quantity} x ${item.price} ₽`;
          list.appendChild(li);
        });

        productList.innerHTML = "";
        productList.appendChild(list);
      }

      productList.style.display = "block";
      e.target.textContent = "Скрыть товары";
    } catch (error) {
      console.error("Ошибка загрузки товаров:", error);
      showNotification("Не удалось загрузить товары заказа.");
    }
  }
});



  if (filterSelect) {
    filterSelect.addEventListener("change", (e) => fetchOrders(e.target.value));
  }

  await fetchOrders();

  if (editForm) {
    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const updatedName = nameInput.value.trim();
      const updatedEmail = emailInput.value.trim();
      const updatedPhone = phoneInput.value.trim();
      const updatedfullName = fullNameInput.value.trim();
      const updatetAddress = addressInput.value.trim();

      if (!validatePhone(updatedPhone)) {
        showNotification("Введите корректный номер телефона в формате +7XXXXXXXXXX или +7 (XXX) XXX-XX-XX");
        phoneInput.focus();
        return;
      }

      try {
        const response = await fetch("/api/profile", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ name: updatedName, email: updatedEmail, phone: updatedPhone, fullName: updatedfullName, address: updatetAddress })
        });

        if (!response.ok) throw new Error("Не удалось обновить данные пользователя");
        showNotification("Данные успешно обновлены");
      } catch (error) {
        console.error("Ошибка при обновлении данных профиля:", error);
        showNotification("Произошла ошибка при обновлении данных.");
      }
    });
  }
});
