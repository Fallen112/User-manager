const API_URL = 'https://user-manager-backend-6ry1.onrender.com';

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

async function loadUsers() {
    const container = document.getElementById('usersContainer');
    container.innerHTML = '<p class="loading">Загрузка...</p>';

    try {
        const response = await fetch(`${API_URL}/users/`, {
            headers: {
                'X-User-Role': 'admin'
            }
        });
        const users = await response.json();

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
        container.innerHTML = '<p class="loading">Ошибка загрузки</p>';
        console.error('Error loading users:', error);
    }
}

document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
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
            throw new Error(JSON.stringify(error));
        }

        document.getElementById('userForm').reset();
        document.getElementById('is_active').checked = true;
        await loadUsers();
        showNotification('Пользователь успешно создан!', 'success');

    } catch (error) {
        console.error('Полная ошибка:', error);
        console.error('Сообщение ошибки:', error.message);

        let errorMessage = 'Ошибка создания';

        try {
            const errorData = JSON.parse(error.message);
            console.error('Распарсенные данные:', errorData);

            if (errorData.detail) {
                if (typeof errorData.detail === 'string') {
                    errorMessage = errorData.detail;
                } else if (Array.isArray(errorData.detail)) {
                    errorMessage = errorData.detail.map(err =>
                        `${err.loc.join('.')}: ${err.msg}`
                    ).join(', ');
                }
            } else {
                errorMessage = JSON.stringify(errorData);
            }
        } catch {
            errorMessage = error.message || 'Неизвестная ошибка';
        }

        showNotification(errorMessage, 'error');
    }
});

async function deleteUser(id) {
    if (!confirm('Удалить пользователя?')) return;

    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: {
                'X-User-Role': 'admin'
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

async function openEditModal(id) {
    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            headers: {
                'X-User-Role': 'admin'
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
                'X-User-Role': 'admin'
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

loadUsers();