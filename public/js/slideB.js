document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const menuItems = document.getElementById("menuItems");

  function getRoleFromToken() {
    return localStorage.getItem("role") || "guest";
  }

  function closeMenu() {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  }

  menuToggle.addEventListener("click", (e) => {
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
    e.stopPropagation();
  });

  overlay.addEventListener("click", closeMenu);

  document.addEventListener("click", (e) => {
    if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
      closeMenu();
    }
  });

  sidebar.addEventListener("click", (e) => e.stopPropagation());

  // Заполняем меню по роли
  const role = getRoleFromToken();
  if (role === "admin") {
    menuItems.innerHTML = `
      <li><a href="/create-admin.html">Создать новый профиль</a></li>
      <li><a href="/dashboard.html">Дашборд</a></li>
      <li><a href="/addProduct.html">Добавить продукт</a></li>
      <li><a href="/admin-orders.html">Все заказы</a></li>
      <li><a href="/login.html" id="logout role="button"">Выход</button></li>
    `;
  } else {
    menuItems.innerHTML = `
      <li><a href="/profile.html">Профиль</a></li>
      <li><a href="/cart.html">Корзина</a></li>
      <li><a href="/login.html" id="logout role="button"">Выход</button></li>
    `;
  }
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/login.html";
    });
  }
});
