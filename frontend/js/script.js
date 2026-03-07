const API_URL = 'https://user-manager-backend-6ry1.onrender.com';

// Показать уведомление
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Загрузить всех пользователей
async function loadUsers() {
    const container = document.getElementById('usersContainer');
    const spinner = document.getElementById('loadingSpinner');

    spinner.style.display = 'block';
    container.innerHTML = '';
    container.appendChild(spinner);

    try {
        const response = await fetch(`${API_URL}/users/`, {
            headers: {
                'X-User-Role': 'admin'  // временно для теста ролей
            }
        });
        const users = await response.json();

        spinner.style.display = 'none';
        container.innerHTML = '';

        if (users.length === 0) {
            container.innerHTML = '<p class="loading">Нет пользователей</p>';
            return;
        }

        container.innerHTML = users.map(user => `
            <div class="user-card ${user.is_active ? '' : 'inactive'}" data-id="${user.id}">
                <div class="user-info">
                    <div class="name">${user.username}</div>
                    <div class="email">📧 ${user.email}</div>
                    <div class="age">🎂 ${user.age} лет</div>
                    <div class="role">🎭 Роль: ${user.role}</div>
                    <div class="date">📅 ${new Date(user.created_at).toLocaleDateString()}</div>
                    <div class="status">${user.is_active ? '✅ Активен' : '❌ Неактивен'}</div>
                </div>
                <div class="user-actions">
                    <button class="btn btn-primary edit-btn" onclick="openEditModal(${user.id})">✏️ Edit</button>
                    <button class="btn btn-danger delete-btn" onclick="deleteUser(${user.id})">🗑️ Delete</button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        spinner.style.display = 'none';
        container.innerHTML = '<p class="loading">Ошибка загрузки</p>';
        console.error('Error loading users:', error);
    }
}

// Создать пользователя
document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        username: document.getElementById('name').value,
        email: document.getElementById('email').value,
        age: parseInt(document.getElementById('age').value),
        role: document.getElementById('role').value,
        is_active: true
    };

    try {
        const response = await fetch(`${API_URL}/users/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Role': 'admin'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Ошибка создания');
        }

        document.getElementById('userForm').reset();
        await loadUsers();
        showNotification('Пользователь успешно создан!', 'success');

    } catch (error) {
        // ✅ ИСПРАВЛЕНО: теперь показываем сообщение, а не объект
        showNotification(error.message, 'error');
        console.error('Error creating user:', error);
    }
});

// Удалить пользователя
async function deleteUser(id) {
    if (!confirm('Удалить пользователя?')) return;

    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: {
                'X-User-Role': 'admin'  // временно для теста ролей
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка удаления');
        }

        await loadUsers();
        showNotification('Пользователь удалён', 'success');

    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Открыть модальное окно редактирования
async function openEditModal(id) {
    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            headers: {
                'X-User-Role': 'admin'  // временно для теста ролей
            }
        });
        const user = await response.json();

        document.getElementById('editId').value = user.id;
        document.getElementById('editName').value = user.username;
        document.getElementById('editEmail').value = user.email;
        document.getElementById('editAge').value = user.age;
        document.getElementById('editRole').value = user.role;
        document.getElementById('editIsActive').checked = user.is_active;

        document.getElementById('editModal').style.display = 'block';

    } catch (error) {
        showNotification('Ошибка загрузки данных', 'error');
    }
}

// Обновить пользователя
document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('editId').value;
    const formData = {
        username: document.getElementById('editName').value,
        email: document.getElementById('editEmail').value,
        age: parseInt(document.getElementById('editAge').value),
        role: document.getElementById('editRole').value,
        is_active: document.getElementById('editIsActive').checked
    };

    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Role': 'admin'  // временно для теста ролей
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Ошибка обновления');
        }

        document.getElementById('editModal').style.display = 'none';
        await loadUsers();
        showNotification('Пользователь обновлён', 'success');

    } catch (error) {
        showNotification(error.message, 'error');
    }
});

// Закрыть модальное окно
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('editModal').style.display = 'none';
});

document.getElementById('cancelEdit').addEventListener('click', () => {
    document.getElementById('editModal').style.display = 'none';
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('editModal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Загрузить пользователей при старте
loadUsers();