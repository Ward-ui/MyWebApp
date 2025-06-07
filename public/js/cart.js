document.addEventListener("DOMContentLoaded", async () => {
  const cartItemsContainer = document.getElementById("cart-items");
  const totalAmountElement = document.getElementById("total-amount");
  const checkoutBtn = document.getElementById("checkout-btn");
  const clearCartBtn = document.getElementById("clear-cart-btn");

  try {
      const token = localStorage.getItem("token");
      
      
      if (!token) {
          showNotification("Пожалуйста, авторизуйтесь");
          window.location.href = "/login.html";
          return;
      }

      const response = await fetch("/api/cart", {
          method: "GET",
          headers: {
              "Authorization": `Bearer ${token}`
          }
      });

      if (!response.ok) {
          throw new Error("Ошибка при получении корзины");
      }

      const data = await response.json();
      const items = data.cart || [];
      let totalAmount = 0;

      if (items.length === 0) {
          cartItemsContainer.innerHTML = "<p>Ваша корзина пуста</p>";
          totalAmountElement.textContent = "Итого: 0 ₽";
          return;
      }

      cartItemsContainer.innerHTML = "";
      items.forEach(item => {
          const itemTotal = item.price * item.quantity;
          totalAmount += itemTotal;
          cartItemsContainer.innerHTML += `
              <div class="cart-item row align-items-center">
                  <div class="col-3">
                      <img src="${item.imageUrl || '/uploads/default-image.jpg'}" alt="${item.name}" class="product-image">
                  </div>
                  <div class="col-9">
                      <h5>${item.name || 'Без названия'}</h5>
                      <p>Цена: ${item.price || 0} ₽</p>
                      <p>Количество: ${item.quantity || 1}</p>
                      <p>Итого: ${itemTotal} ₽</p>
                  </div>
              </div>
          `;
      });

      totalAmountElement.textContent = `Итого: ${totalAmount} ₽`;

      // Обработка оформления заказа
      checkoutBtn.addEventListener("click", async () => {
        try {
            // Передаем товары корзины в заказ
            const orderItems = items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
            }));

            const orderResponse = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ items: orderItems })
            });
    
            if (!orderResponse.ok) {
                throw new Error("Ошибка оформления заказа");
            }
    
            const result = await orderResponse.json();
            showNotification("Заказ успешно оформлен!");
            window.location.href = "/profile.html";
        } catch (error) {
            
            showNotification("Произошла ошибка при оформлении заказа.");
        }
    });

      // Очистка корзины
      clearCartBtn.addEventListener("click", async () => {
          try {
              const clearResponse = await fetch("/api/cart/clear", {
                  method: "DELETE",
                  headers: {
                      "Authorization": `Bearer ${token}`
                  }
              });

              if (!clearResponse.ok) {
                  throw new Error("Ошибка при очистке корзины");
              }

              showNotification("Корзина успешно очищена");
              window.location.reload();
          } catch (error) {
              
              showNotification("Произошла ошибка при очистке корзины.");
          }
      });
  } catch (error) {
      
      cartItemsContainer.innerHTML = "<p>Произошла ошибка при загрузке корзины.</p>";
  }
});
