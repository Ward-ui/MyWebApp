document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault(); // Предотвращаем перезагрузку страницы

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

    if (!username || !password) {
              showNotification("Пожалуйста, заполните все поля.");
              return;
            }

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });if (!username || !password) {
          showNotification("Пожалуйста, заполните все поля.");
          return;
        }

        const data = await response.json();
        if (response.ok) {
          showNotification(data.message); // Выводим сообщение об успешной регистрации
          window.location.href = "/login.html"; // Переход на страницу логина
        } else {
          showNotification("Ошибка: " + data.message);
        }
      } catch (error) {
        console.error("Ошибка:", error);
        showNotification("Ошибка сервера");
      }
    });
  }
});
