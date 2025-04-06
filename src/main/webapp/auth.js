
import {fetchPasswords,handleEditPassword,handleAddPassword,handleDeletePassword} from "./sync.js";
import {state,switchAuthTab,showDashboard,showToast,updateThemeToggleButton,togglePasswordVisibility,API,elements,toggleTheme,toggleProfileDropdown,setupEventListeners} from "./main.js";
import {showEditModal,closeEditModal,renderPasswords} from "./dashbord.js";
import {encryptPassword} from "./crypt.js";
// Authentication
async function handleAuth(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const isSignIn = document.querySelector('.tab-btn.active').dataset.tab === 'signin';

    const submitBtn = elements.authForm.querySelector('button[type="submit"]');
    const iconSpan = submitBtn.querySelector('.material-icons');
    const textSpan = submitBtn.querySelector('#authButtonText');

    // Save original values
    const originalIcon = iconSpan.textContent;
    const originalText = textSpan.textContent;

    // Disable and update UI
    submitBtn.disabled = true;
    iconSpan.textContent = 'hourglass_empty';
    textSpan.textContent = 'Please wait...';

    try {
        const masterPassword = encryptPassword(password,username,password);
        const response = await fetch(API.auth, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                password:masterPassword,
                action: isSignIn ? 'signin' : 'signup'
            })
        });

        if (!response.ok) throw new Error('Authentication failed');

        const data = await response.json();
        state.userId = data.userId;
        sessionStorage.setItem('userId', data.userId);
        sessionStorage.setItem('username',username);
        sessionStorage.setItem('masterPassword',masterPassword);

        showDashboard();
        await fetchPasswords();
        showToast('Authentication successful', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        // Re-enable button after a short delay
        setTimeout(() => {
            iconSpan.textContent = originalIcon;
            textSpan.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }
}


function handleLogout() {
    sessionStorage.removeItem('userId');
    state.userId = null;
    state.username = null;
    state.passwords = [];
    elements.dashboard.classList.add('hidden');
    elements.authModal.classList.remove('hidden');
    showToast('Logged out successfully', 'success');
}

export {handleAuth,handleLogout};
