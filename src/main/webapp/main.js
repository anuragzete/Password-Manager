import { signIn, signUp, logout } from "./auth.js";
import { fetchPasswords, syncPasswords } from "./sync.js";

let isSignIn = true; // Flag to track the current state

// Function to load user profile
const loadProfile = () => {
    const username = sessionStorage.getItem('username'); // Assuming username is stored after sign-in
    const userId = sessionStorage.getItem('_id'); // Check for user ID in session storage

    if (username && userId) {
        document.getElementById('profile-username').textContent = username;
        showMainContent(); // Show main content if user is signed in
    } else {
        showAuthModal(); // Show auth modal if not signed in
    }
};

// Function to show the main content and hide the auth modal
const showMainContent = () => {
    const authModal = document.querySelector('.auth-modal');
    const mainContent = document.querySelector('.main-content');

    if (!authModal || !mainContent) {
        console.error("Error: 'auth-modal' or 'main-content' element not found");
        return;
    }

    authModal.style.display = 'block';
    mainContent.style.display = 'none';

    authModal.style.display = 'none'; // Hide the auth modal
    mainContent.style.display = 'block'; // Show the main content (password manager)
};

// Function to show the auth modal
const showAuthModal = () => {
    const authModal = document.querySelector('.auth-modal');
    const mainContent = document.querySelector('.main-content');

    if (!authModal || !mainContent) {
        console.error("Error: 'auth-modal' or 'main-content' element not found");
        return;
    }

    authModal.style.display = 'block';
    mainContent.style.display = 'none';
};


// Function to load passwords
const loadPasswords = async () => {
    try {
        const passwords = await fetchPasswords();
        const passwordContainer = document.getElementById('passwordList');
        passwordContainer.innerHTML = '';

        if (passwords && passwords.length > 0) {
            passwords.forEach((pwd) => {
                const passwordCard = document.createElement('div');
                passwordCard.classList.add('password-card');

                const cardHeader = document.createElement('div');
                cardHeader.classList.add('card-header');
                cardHeader.innerHTML = `<span class="material-icons website-icon">language</span> <h3>${pwd.site_name}</h3>`;

                const cardContent = document.createElement('div');
                cardContent.classList.add('card-content');
                cardContent.innerHTML = `
                    <p class="username">${pwd.username}</p>
                    <div class="password-field">
                        <input type="password" value="••••••••" readonly>
                        <button class="toggle-visibility">
                            <span class="material-icons">visibility</span>
                        </button>
                    </div>
                `;

                const cardActions = document.createElement('div');
                cardActions.classList.add('card-actions');
                cardActions.innerHTML = `
                    <button class="edit-button">
                        <span class="material-icons">edit</span>
                    </button>
                    <button class="delete-button">
                        <span class="material-icons">delete</span>
                    </button>
                `;

                passwordCard.appendChild(cardHeader);
                passwordCard.appendChild(cardContent);
                passwordCard.appendChild(cardActions);

                passwordContainer.appendChild(passwordCard);

                // Add event listeners for edit and delete actions
                passwordCard.querySelector('.delete-button').addEventListener('click', () => deletePassword(pwd._id));
                passwordCard.querySelector('.toggle-visibility').addEventListener('click', togglePasswordVisibility);
            });
        } else {
            passwordContainer.innerHTML = '<li>No passwords found.</li>';
        }
    } catch (error) {
        console.error('Failed to load passwords:', error);
        alert('Failed to load passwords. Please try again.');
    }
};

// Function to toggle password visibility
const togglePasswordVisibility = (e) => {
    const input = e.target.closest('.password-field').querySelector('input');
    const visibilityButton = e.target;
    if (input.type === 'password') {
        input.type = 'text';
        visibilityButton.textContent = 'visibility';
    } else {
        input.type = 'password';
        visibilityButton.textContent = 'visibility_off';
    }
};

// Function to delete a password
const deletePassword = async (id) => {
    try {
        let passwords = await fetchPasswords();
        passwords = passwords.filter(pwd => pwd._id !== id);

        await syncPasswords(passwords);
        await loadPasswords();
    } catch (error) {
        console.error('Failed to delete password:', error);
        alert('Failed to delete password. Please try again.');
    }
};

// Event listener to handle logout
document.getElementById('logout-button').addEventListener('click', () => {
    logout();
    sessionStorage.removeItem('username'); // Remove username from session on logout
    sessionStorage.removeItem('_id'); // Remove user ID from session on logout
    loadProfile();
});

// Event listener for form submission
document.getElementById('submit-button').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('authUsername').value;
    const password = document.getElementById('authPassword').value;
    console.log(username+" "+password);

    try {
        let result;
        if (isSignIn) {
            result = await signIn(username, password);
        } else {
            result = await signUp(username, password);
        }

        if (result.status === 'success') {
            sessionStorage.setItem('username', username); // Save username in session
            sessionStorage.setItem('_id', result._id); // Save user _id in session
            loadProfile();
            await loadPasswords(); // Load passwords after successful sign-in/signup
            alert(`${isSignIn ? 'Sign-in' : 'Sign-up'} successful!`);
        } else {
            alert(`${isSignIn ? 'Sign-in' : 'Sign-up'} failed. Please check your credentials.`);
        }
    } catch (error) {
        console.error('Authentication error:', error);
        alert('An error occurred during authentication. Please try again.');
    }
});

// Event listener to handle switching between sign-in and sign-up forms
document.getElementById('switch-button').addEventListener('click', () => {
    isSignIn = !isSignIn; // Toggle flag

    const modalTitle = document.getElementById('modal-title');
    const submitButton = document.getElementById('submit-button');
    const switchButton = document.getElementById('switch-button');

    if (isSignIn) {
        modalTitle.textContent = 'Welcome Back';
        submitButton.textContent = 'Sign In';
        switchButton.textContent = 'Don\'t have an account? Sign up';
    } else {
        modalTitle.textContent = 'Create an Account';
        submitButton.textContent = 'Sign Up';
        switchButton.textContent = 'Already have an account? Sign in';
    }
});

// Load the profile and passwords on DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
    loadProfile(); // This checks sessionStorage for user data and shows the appropriate content
});
