document.addEventListener("DOMContentLoaded", async () => {
  const productListContainer = document.getElementById("product-list");
  const categoryFilter = document.getElementById("category-filter");

  try {
    // Загрузка категорий
    const categoriesResponse = await fetch("/api/products/categories");
    if (!categoriesResponse.ok) throw new Error("Ошибка при загрузке категорий");
    const categories = await categoriesResponse.json();

    // Заполняем селектор категорий
    categoryFilter.innerHTML = `
      <option value="">Все категории</option>
      ${categories.map(category => `<option value="${category.id}">${category.name}</option>`).join("")}
    `;

    // Функция для загрузки продуктов
    const loadProducts = async (categoryId = "") => {
      const url = categoryId 
        ? `/api/products?categoryId=${categoryId}`
        : "/api/products";
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Ошибка при загрузке продуктов");
      const products = await response.json();

      if (products.length === 0) {
        productListContainer.innerHTML = "<p>Нет продуктов для отображения.</p>";
        return;
      }

      const isAdmin = localStorage.getItem("role") === "admin";

      // Отображаем продукты
      productListContainer.innerHTML = products.map(product => `
         <div class="col-md-4 mb-4">
    <div class="card" data-product-id="${product.id}">
      <img src="${product.imageUrl || "/uploads/default-image.jpg"}" class="card-img-top" alt="${product.name}">
      <div class="card-body">
        <h5 class="card-title">${product.name}</h5>
        <p class="card-text">${product.description}</p>
        <p class="card-text">Цена: ${product.price} ₽</p>
        <p class="card-text stock-quantity">В наличии: ${product.stockQuantity > 0 ? product.stockQuantity : "Нет в наличии"}</p>
        <button class="add-to-cart btn btn-primary" data-product-id="${product.id}" ${product.stockQuantity <= 0 ? "disabled" : ""}>
          ${product.stockQuantity > 0 ? "Купить" : "Товар закончился"}
        </button>
        ${isAdmin ? `
          <div class="mt-2 d-flex">
            <input type="number" min="1" class="form-control me-2 stock-input" placeholder="Кол-во" style="max-width: 100px;">
            <button class="btn btn-success replenish-btn" data-product-id="${product.id}">Пополнить</button>
          </div>
        ` : ""}
      </div>
    </div>
  </div>
      `).join("");

      // Добавляем обработчики кнопок "Купить"
      document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", handleAddToCart);
      });

      // Обработчик пополнения запаса для админа
document.querySelectorAll(".replenish-btn").forEach(button => {
  button.addEventListener("click", async (e) => {
    const card = e.target.closest(".card");
    const productId = e.target.getAttribute("data-product-id");
    const input = card.querySelector(".stock-input");
    const amount = parseInt(input.value);

    if (!amount || amount <= 0) {
      showNotification("Введите корректное количество для пополнения");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`/api/products/${productId}/replenish`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ amount })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      showNotification("Запас успешно пополнен");

      // Обновляем отображаемое количество
      const stockText = card.querySelector(".stock-quantity");
      const currentStock = parseInt(stockText.textContent.replace(/\D/g, "")) || 0;
      const newStock = currentStock + amount;
      stockText.textContent = `В наличии: ${newStock}`;

      // Разблокировка кнопки "Купить" если была недоступна
      const buyBtn = card.querySelector(".add-to-cart");
      if (buyBtn.disabled) {
        buyBtn.disabled = false;
        buyBtn.textContent = "Купить";
      }

      input.value = ""; // очистить поле
    } catch (err) {
      showNotification(`Ошибка пополнения: ${err.message}`);
    }
  });
});
    };

    



    // Обработчик добавления в корзину
    const handleAddToCart = async (event) => {
      const productId = event.target.getAttribute("data-product-id");
      const quantity = 1;
      const token = localStorage.getItem("token");

      if (!token) {
        showNotification("Пожалуйста, авторизуйтесь для добавления товаров в корзину!");
        return;
      }

      try {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ productId, quantity }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message);

        // Обновляем количество товара на странице
        const card = event.target.closest(".card");
        const stockQuantityElement = card.querySelector(".stock-quantity");
        const currentStock = parseInt(stockQuantityElement.textContent.replace(/\D/g, "")) || 0;
        const newStock = currentStock - quantity;

        if (newStock <= 0) {
          stockQuantityElement.textContent = "Нет в наличии";
          event.target.disabled = true;
          event.target.textContent = "Товар закончился";
        } else {
          stockQuantityElement.textContent = `В наличии: ${newStock}`;
        }

        showNotification("Товар добавлен в корзину!");
      } catch (error) {
        console.error("Ошибка при добавлении товара:", error);
        showNotification(`Ошибка при добавлении товара: ${error.message}`);
      }
    };

    // Инициализация продуктов и категорий
    loadProducts();

    // Обработчик фильтрации по категориям
    categoryFilter.addEventListener("change", (e) => {
      loadProducts(e.target.value);
    });

  } catch (error) {
    console.error("Ошибка при загрузке продуктов или категорий:", error);
    productListContainer.innerHTML = "<p>Произошла ошибка при загрузке данных.</p>";
  }
});
