document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addProductForm");

  if (!form) {
    
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token"); // Добавляем получение токена

    if (!token) {
      showNotification("Пожалуйста, войдите в аккаунт!");
      return;
    }

    const productName = document.getElementById("productName");
    const productDescription = document.getElementById("productDescription");
    const productPrice = document.getElementById("productPrice");
    const productStock = document.getElementById("productStock");
    const categoryId = document.getElementById("categoryId");
    const productImage = document.getElementById("productimage");

    if (!productName || !productPrice || !productStock || !categoryId) {
      
      showNotification("Пожалуйста, убедитесь, что все поля присутствуют.");
      return;
    }

    const name = productName.value;
    const description = productDescription.value;
    const price = parseFloat(productPrice.value);
    const stockQuantity = parseInt(productStock.value);
    const category = parseInt(categoryId.value);

    if (!name || !price || !stockQuantity || !category) {
      showNotification("Пожалуйста, заполните все обязательные поля.");
      return;
    }

    // Создание объекта FormData
    const formdata = new FormData();
    formdata.append("name", name);
    formdata.append("description", description);
    formdata.append("price", price);
    formdata.append("stockQuantity", stockQuantity);
    formdata.append("categoryId", category);

    // Добавление изображения, если оно выбрано
    if (productImage && productImage.files[0]) {
      formdata.append("image", productImage.files[0]); // добавляем файл изображения
    }

    try {
      const response = await fetch("/api/products/add", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formdata,
      });

      const contentType = response.headers.get("Content-Type");

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();

        if (response.ok) {
          showNotification(`Продукт "${data.name}" успешно добавлен!`);
          form.reset();  // Очистка формы после добавления
        } else {
          showNotification(`Ошибка: ${data.message}`);
        }
      } else {
        const errorText = await response.text();
        
        showNotification("Ошибка на сервере: неверный формат ответа.");
      }
    } catch (error) {
      
      showNotification("Произошла ошибка при добавлении продукта.");
    }
  });
});
