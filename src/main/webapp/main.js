// API endpoints (to be replaced with real endpoints)
const API = {
    auth: '/Password_Manager_war_exploded/auth',
    sync: '/Password_Manager_war_exploded/sync'
};

// State management
const state = {
    userId: sessionStorage.getItem('userId'),
    passwords: JSON.parse(sessionStorage.getItem('passwords')) || [],
    editingPassword: null,
    theme: localStorage.getItem('theme') || 'light'
};

// DOM Elements
const elements = {
    authModal: document.getElementById('authModal'),
    authForm: document.getElementById('authForm'),
    authTabs: document.querySelectorAll('.tab-btn'),
    dashboard: document.getElementById('dashboard'),
    addPasswordForm: document.getElementById('addPasswordForm'),
    passwordGrid: document.getElementById('passwordGrid'),
    profileBtn: document.getElementById('profileBtn'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    toast: document.getElementById('toast')
};

// Initialize the application
(()=>{
    if (state.userId) {
        showDashboard();
        // If passwords are already in sessionStorage, render them immediately
        if (state.passwords.length > 0) {
            renderPasswords();
        } else {
            fetchPasswords();
        }
    }

    setupEventListeners();
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeToggleButton();
})();

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', state.theme);
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeToggleButton();
}

function updateThemeToggleButton() {
    const icon = elements.themeToggleBtn.querySelector('.material-icons');
    const text = elements.themeToggleBtn.childNodes[1];

    if (state.theme === 'dark') {
        icon.textContent = 'light_mode';
        text.textContent = 'Light Mode';
    } else {
        icon.textContent = 'dark_mode';
        text.textContent = 'Dark Mode';
    }
}

// Event Listeners
function setupEventListeners() {
    // Auth tabs
    elements.authTabs.forEach(tab => {
        tab.addEventListener('click', () => switchAuthTab(tab.dataset.tab));
    });

    // Auth form
    elements.authForm.addEventListener('submit', handleAuth);

    // Add password form
    elements.addPasswordForm.addEventListener('submit', handleAddPassword);

    // Profile dropdown
    elements.profileBtn.addEventListener('click', toggleProfileDropdown);
    elements.themeToggleBtn.addEventListener('click', () => {
        toggleTheme();
        toggleProfileDropdown();
    });
    elements.logoutBtn.addEventListener('click', handleLogout);

    // Password visibility toggles
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', togglePasswordVisibility);
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.profile-dropdown')) {
            document.querySelector('.dropdown-content')?.classList.add('hidden');
        }
    });
}

// Authentication
async function handleAuth(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const isSignIn = document.querySelector('.tab-btn.active').dataset.tab === 'signin';

    try {
        const response = await fetch(API.auth, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, action: isSignIn ? 'signin' : 'signup' })
        });

        if (!response.ok) throw new Error('Authentication failed');

        const data = await response.json();
        state.userId = data.userId;
        sessionStorage.setItem('userId', data.userId);
        showDashboard();
        fetchPasswords();
        showToast('Authentication successful', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Password Management
async function handleAddPassword(e) {
    e.preventDefault();
    const site = document.getElementById('site').value;
    const username = document.getElementById('siteUsername').value;
    const password = document.getElementById('sitePassword').value;

    try {
        const response = await fetch(API.sync, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.userId}`
            },
            body: JSON.stringify({ site, username, password })
        });

        if (!response.ok) throw new Error('Failed to add password');

        await fetchPasswords();
        e.target.reset();
        showToast('Password added successfully', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function handleEditPassword(e) {
    e.preventDefault();
    const { id } = state.editingPassword;
    const username = document.getElementById('editUsername').value;
    const password = document.getElementById('editPassword').value;

    try {
        const response = await fetch(`${API.sync}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.userId}`
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) throw new Error('Failed to update password');

        closeEditModal();
        await fetchPasswords();
        showToast('Password updated successfully', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function fetchPasswords() {
    try {
        const response = await fetch(`${API.sync}?user_id=${encodeURIComponent(state.userId)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to fetch passwords');

        const data = await response.json();
        state.passwords = data.passwords;

        // Cache in sessionStorage
        sessionStorage.setItem('passwords', JSON.stringify(state.passwords));

        renderPasswords();
    } catch (error) {
        // Try loading from cache
        const cached = sessionStorage.getItem('passwords');
        if (cached) {
            state.passwords = JSON.parse(cached);

            renderPasswords();
            showToast('Loaded passwords from cache', 'warning');
        } else {
            showToast(error.message, 'error');
        }
    }
}

async function handleDeletePassword(id) {
    try {
        const response = await fetch(`${API.sync}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${state.userId}`
            }
        });

        if (!response.ok) throw new Error('Failed to delete password');

        await fetchPasswords();
        showToast('Password deleted successfully', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// UI Functions
function switchAuthTab(tab) {
    elements.authTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    document.getElementById('authButtonText').textContent = tab === 'signin' ? 'Sign In' : 'Sign Up';
}

function showDashboard() {
    elements.authModal.classList.add('hidden');
    elements.dashboard.classList.remove('hidden');
}

function toggleProfileDropdown() {
    const dropdown = document.querySelector('.dropdown-content');
    dropdown.classList.toggle('hidden');
}

function handleLogout() {
    sessionStorage.removeItem('userId');
    state.userId = null;
    state.passwords = [];
    elements.dashboard.classList.add('hidden');
    elements.authModal.classList.remove('hidden');
    showToast('Logged out successfully', 'success');
}

function togglePasswordVisibility(e) {
    const passwordInput = e.target.closest('.password-input-group').querySelector('input');
    const icon = e.target.closest('.toggle-password').querySelector('.material-icons');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.textContent = 'visibility_off';
    } else {
        passwordInput.type = 'password';
        icon.textContent = 'visibility';
    }
}

function showEditModal(password) {
    state.editingPassword = password;

    const editModal = document.createElement('div');
    editModal.className = 'edit-modal';
    editModal.innerHTML = `
        <div class="modal-content">
            <h2>Edit Password</h2>
            <form id="editPasswordForm">
                <input type="text" id="editUsername" value="${password.username}" placeholder="Username" required>
                <div class="password-input-group">
                    <input type="password" id="editPassword" value="${password.password}" placeholder="Password" required>
                    <button type="button" class="btn-icon toggle-password">
                        <span class="material-icons">visibility</span>
                    </button>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="closeEditModal()">Cancel</button>
                    <button type="submit" class="btn-primary">
                        <span class="material-icons">save</span>
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(editModal);

    // Setup event listeners
    editModal.querySelector('#editPasswordForm').addEventListener('submit', handleEditPassword);
    editModal.querySelector('.toggle-password').addEventListener('click', togglePasswordVisibility);
}

function closeEditModal() {
    const editModal = document.querySelector('.edit-modal');
    if (editModal) {
        editModal.remove();
        state.editingPassword = null;
    }
}

function renderPasswords() {
    elements.passwordGrid.innerHTML = state.passwords.map(pass => `
        <div class="password-card" 
             data-id="${pass.id}" 
             data-site="${encodeHTML(pass.site)}" 
             data-username="${encodeHTML(pass.username)}" 
             data-password="${encodeHTML(pass.password)}">
            <div class="password-card-header">
                <h3>${encodeHTML(pass.site || 'Unnamed Site')}</h3>
                <div class="password-card-actions">
                    <button class="btn-icon edit-btn" title="Edit">
                        <span class="material-icons">edit</span>
                    </button>
                    <button class="btn-icon" onclick="handleDeletePassword('${pass.id}')" title="Delete">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
            </div>
            <div class="password-card-field">
                <label>Username</label>
                <div class="value">${encodeHTML(pass.username)}</div>
            </div>
            <div class="password-card-field">
                <label>Password</label>
                <div class="password-input-group">
                    <input type="password" value="${encodeHTML(pass.password)}" readonly>
                    <button class="btn-icon toggle-password" title="Show Password">
                        <span class="material-icons">visibility</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Attach password visibility toggles
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', togglePasswordVisibility);
    });

    // Attach edit button listeners
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.password-card');
            const passwordObj = {
                id: card.dataset.id,
                site: card.dataset.site,
                username: card.dataset.username,
                password: card.dataset.password
            };
            showEditModal(passwordObj);
        });
    });
}

function encodeHTML(str = '') {
    return str.replace(/[&<>"']/g, tag => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[tag]
    ));
}

function showToast(message, type) {
    elements.toast.textContent = message;
    elements.toast.className = `toast ${type}`;
    elements.toast.classList.remove('hidden');

    setTimeout(() => {
        elements.toast.classList.add('hidden');
    }, 3000);
}
