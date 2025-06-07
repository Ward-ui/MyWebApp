document.addEventListener("DOMContentLoaded", () => {
    const salesForm = document.getElementById("salesForm");
  
    if (salesForm) {
      salesForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Предотвращаем перезагрузку страницы
  
        const productId = document.getElementById("productId").value;
        const startDate = document.getElementById("startDate").value;
        const endDate = document.getElementById("endDate").value;
  
        try {
          const response = await fetch(`/api/sales?sales=true&productId=${productId}&startDate=${startDate}&endDate=${endDate}`);
          const data = await response.json();
          if (response.ok) {
          } else {
            showNotification("Ошибка: " + data.message);
          }
        } catch (error) {
          
        }
      });
    }
  });
  