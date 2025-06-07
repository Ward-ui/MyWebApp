document.getElementById("adminForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
        showNotification("Пожалуйста, авторизуйтесь");
        window.location.href = "/login.html";
        return;
    }

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("/api/admin/create-admin", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, email, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Не удалось создать администратора");
        }

        showNotification("Администратор успешно создан");
        window.location.href = "/index.html";
    } catch (error) {
        console.error("Ошибка:", error);
        showNotification("Произошла ошибка при создании администратора");
    }
});
