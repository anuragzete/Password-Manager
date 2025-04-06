import {state,switchAuthTab,showDashboard,showToast,updateThemeToggleButton,togglePasswordVisibility,API,elements,toggleTheme,toggleProfileDropdown,setupEventListeners} from "./main.js";
import {handleAuth,handleLogout} from "./auth.js";
import {fetchPasswords,handleEditPassword,handleAddPassword,handleDeletePassword} from "./sync.js";

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

export {showEditModal,closeEditModal,renderPasswords};
