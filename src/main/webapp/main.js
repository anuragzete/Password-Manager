
import {showEditModal,closeEditModal,renderPasswords} from "./dashbord.js";
import {fetchPasswords,handleEditPassword,handleAddPassword,handleDeletePassword} from "./sync.js";
import {handleAuth,handleLogout} from "./auth.js";
import {decryptPassword} from "./crypt.js";

// API endpoints (to be replaced with real endpoints)
const API = {
    auth: '/Password_Manager_war_exploded/auth',
    sync: '/Password_Manager_war_exploded/sync'
};

// State management
const state = {
    userId: sessionStorage.getItem('userId'),
    username: sessionStorage.getItem('username'),
    masterPassword: sessionStorage.getItem('masterPassword'),
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

// UI Functions
function switchAuthTab(tab) {
    elements.authTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    document.getElementById('authButtonText').textContent = tab === 'signin' ? 'Sign In' : 'Sign Up';
}

function showDashboard() {
    elements.authModal.classList.add('hidden');
    elements.dashboard.classList.remove('hidden');

    const usernameSpan = document.getElementById('profileUsername');
    if (usernameSpan) {
        usernameSpan.innerText = state.username;
    }
}

function toggleProfileDropdown() {
    const dropdown = document.querySelector('.dropdown-content');
    dropdown.classList.toggle('hidden');
}

function togglePasswordVisibility(e) {
    const passwordInputGroup = e.target.closest('.password-input-group');
    const passwordInput = passwordInputGroup.querySelector('input');
    const icon = passwordInputGroup.querySelector('.material-icons');

    const encryptedPassword = passwordInput.getAttribute('data-encrypted');
    const username = sessionStorage.getItem('username');
    const masterPassword = sessionStorage.getItem('masterPassword');

    if (passwordInput.type === 'password') {
        if (encryptedPassword && username && masterPassword) {
            const decrypted = decryptPassword(encryptedPassword, username, masterPassword);
            if (decrypted) {
                passwordInput.value = decrypted;
                passwordInput.type = 'text';
                icon.textContent = 'visibility_off';
            } else {
                showToast('Decryption failed for password.','Error');
            }
        } else {
            showToast('Missing encrypted data or session credentials.','Error');
        }
    } else {
        passwordInput.type = 'password';
        icon.textContent = 'visibility';
    }
}

function showToast(message, type) {
    elements.toast.textContent = message;
    elements.toast.className = `toast ${type}`;
    elements.toast.classList.remove('hidden');

    setTimeout(() => {
        elements.toast.classList.add('hidden');
    }, 3000);
}

export {state,switchAuthTab,showDashboard,showToast,updateThemeToggleButton,togglePasswordVisibility,API,elements,toggleTheme,toggleProfileDropdown,setupEventListeners};