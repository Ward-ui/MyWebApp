document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("addProductForm");
  
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
  
      const token = localStorage.getItem("token");
      if (!token) {
        showNotification("Пожалуйста, войдите в аккаунт!");
        return;
      }
  
      const productName = document.getElementById("productName").value;
      const productPrice = document.getElementById("productPrice").value;
      const productDescription = document.getElementById("productDescription").value;
  
      if (!productName || !productPrice || !productDescription) {
        showNotification("Пожалуйста, заполните все поля.");
        return;
      }
  
      try {
        const response = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // Передаем токен в заголовке
          },
          body: JSON.stringify({
            name: productName,
            price: productPrice,
            description: productDescription,
          }),
        });
  
        if (response.ok) {
          const newProduct = await response.json();
          showNotification(`Продукт "${newProduct.name}" успешно добавлен!`);
          form.reset(); // Очищаем форму
        } else {
          const errorData = await response.json();
          showNotification(`Ошибка: ${errorData.message}`);
        }
      } catch (error) {
        
        showNotification("Произошла ошибка при добавлении продукта.");
      }
    });
  });
  