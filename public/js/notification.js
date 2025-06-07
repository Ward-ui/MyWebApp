function showNotification(message) {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;
  
    // Добавляем уведомление в контейнер
    const container = document.getElementById('notification-container');
    container.appendChild(notification);
  
    // Через 3 секунды скрываем уведомление
    setTimeout(() => {
      notification.remove();
    }, 3000); // 3000 миллисекунд = 3 секунды
  }
  