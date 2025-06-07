document.addEventListener("DOMContentLoaded", async () => {
  await loadCart();

  // Обработчик для кнопки очистки корзины
  document.getElementById("clear-cart").addEventListener("click", async () => {
      try {
          const response = await fetch("/api/cart", { method: "DELETE" });
          if (!response.ok) throw new Error("Ошибка при очистке корзины");

          showNotification("Корзина очищена");
          await loadCart(); // Обновляем корзину после очистки
      } catch (error) {
          
          showNotification("Не удалось очистить корзину");
      }
  });
});

async function loadCart() {
  try {
      const response = await fetch("/api/cart");
      if (!response.ok) throw new Error("Ошибка при загрузке корзины");

      const data = await response.json();
      const cartItemsContainer = document.getElementById("cart-items");
      cartItemsContainer.innerHTML = "";

      let total = 0;
      if (!data.cart || Object.keys(data.cart).length === 0) {
          cartItemsContainer.innerHTML = "<p>Ваша корзина пуста.</p>";
          document.getElementById("cart-total").textContent = "Итого: 0 ₽";
          return;
      }

      for (const productId in data.cart) {
          const item = data.cart[productId];

          // Запрос информации о товаре
          const productResponse = await fetch(`/api/products/${productId}`);
          if (!productResponse.ok) continue;
          const product = await productResponse.json();

          total += product.price * item.quantity;

          const cartItem = document.createElement("div");
          cartItem.classList.add("cart-item");
          cartItem.innerHTML = `
              <img src="${product.imageUrl || '/uploads/default-image.jpg'}" alt="${product.name}">
              <div>
                  <h4>${product.name}</h4>
                  <p>Цена: ${product.price} ₽</p>
                  <p>Количество: ${item.quantity}</p>
                  <p>Сумма: ${product.price * item.quantity} ₽</p>
                  <button class="remove-item" data-product-id="${product.id}">Удалить</button>
              </div>
          `;
          cartItemsContainer.appendChild(cartItem);
      }

      document.getElementById("cart-total").textContent = `Итого: ${total} ₽`;

      // Добавляем обработчики на кнопки удаления
      document.querySelectorAll(".remove-item").forEach(button => {
          button.addEventListener("click", async (event) => {
              const productId = event.target.getAttribute("data-product-id");

              try {
                  const response = await fetch(`/api/cart/${productId}`, { method: "DELETE" });
                  if (!response.ok) throw new Error("Ошибка при удалении товара");

                  showNotification("Товар удален из корзины");
                  await loadCart(); // Обновляем корзину
              } catch (error) {
                  
                  showNotification("Не удалось удалить товар");
              }
          });
      });

  } catch (error) {
      
      document.getElementById("cart-items").innerHTML = "<p>Ошибка при загрузке корзины.</p>";
  }
}