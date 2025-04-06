import {showEditModal,closeEditModal,renderPasswords} from "./dashbord.js";
import {state,switchAuthTab,showDashboard,showToast,updateThemeToggleButton,togglePasswordVisibility,API,elements,toggleTheme,toggleProfileDropdown,setupEventListeners} from "./main.js";
import {handleAuth,handleLogout} from "./auth.js";
import {encryptPassword} from "./crypt.js";

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

let syncTimeout;

function scheduleSync() {
    // Clear previous timer (if any)
    if (syncTimeout) clearTimeout(syncTimeout);

    // Schedule a new sync 2s from the last change
    syncTimeout = setTimeout(() => {
        syncPasswordsToServer();
    }, 2000); // 2 seconds delay
}

async function syncPasswordsToServer() {
    try {
        const response = await fetch(API.sync, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.userId}`
            },
            body: JSON.stringify({
                user_id: state.userId,
                passwords: state.passwords
            })
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.message || 'Sync failed');

        showToast(result.status || 'Sync successful!', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function handleAddPassword(e) {
    e.preventDefault();

    const site = document.getElementById('site').value;
    const siteUsername = document.getElementById('siteUsername').value;
    const password = document.getElementById('sitePassword').value;

    const username = sessionStorage.getItem('username');
    const masterPassword = sessionStorage.getItem('masterPassword');
    const encryptedPassword = encryptPassword(password,username,masterPassword);

    const newPassword = {
        id: `temp-${Date.now()}`,
        site,
        username:siteUsername,
        password:encryptedPassword
    };

    // 1. Local update
    state.passwords.push(newPassword);
    renderPasswords();
    e.target.reset();
    showToast('Password added locally. Syncing...', 'info');

    // 2. Background full sync
    scheduleSync();
}

function handleEditPassword(e) {
    e.preventDefault();

    const { id } = state.editingPassword;
    const username = document.getElementById('editUsername').value;
    const password = document.getElementById('editPassword').value;

    const item = state.passwords.find(p => p.id === id);
    if (item) {
        item.username = username;
        item.password = password;
    }

    renderPasswords();
    closeEditModal();
    showToast('Password updated locally. Syncing...', 'info');

    scheduleSync();
}

function handleDeletePassword(id) {
    state.passwords = state.passwords.filter(p => p.id !== id);
    renderPasswords();
    showToast('Password deleted locally. Syncing...', 'info');

    scheduleSync();
}

window.handleDeletePassword = handleDeletePassword;
window.handleEditPassword = handleEditPassword;
export {fetchPasswords,handleEditPassword,handleAddPassword,handleDeletePassword};