import { signIn, signUp, logout } from "./auth.js";
import { fetchPasswords, syncPasswords } from "./sync.js";

const loadPasswords = async () => {
    try {
        const passwords = await fetchPasswords();
        const passwordContainer = document.getElementById('passwordList');
        passwordContainer.innerHTML = '';

        if (passwords && passwords.length > 0) {
            passwords.forEach((pwd) => {
                const listItem = document.createElement('li');
                listItem.textContent = `Website: ${pwd.site_name}, Username: ${pwd.username}, Password: ${pwd.password}`;
                passwordContainer.appendChild(listItem);
            });
        } else {
            passwordContainer.innerHTML = '<li>No passwords found.</li>';
        }
    } catch (error) {
        console.error('Failed to load passwords:', error);
        alert('Failed to load passwords. Please try again.');
    }
};

document.getElementById('switchToSignUp').addEventListener('click', () => switchForm('signUp'));
document.getElementById('switchToSignIn').addEventListener('click', () => switchForm('signIn'));

const switchForm = (form) => {
    document.getElementById('signInForm').style.display = form === 'signIn' ? 'block' : 'none';
    document.getElementById('signUpForm').style.display = form === 'signUp' ? 'block' : 'none';
};

document.getElementById('signUpBtn').addEventListener('click', async () => {
    const username = document.getElementById('signUpUsername').value.trim();
    const password = document.getElementById('signUpPassword').value.trim();

    if (!username || !password) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        console.log(username+" "+password);
        await signUp(username, password);
        alert('Sign-up successful! Please sign in.');
        switchForm('signIn');
    } catch (error) {
        console.log(username+" "+password);
        console.error('Sign-up failed:', error);
        alert('Sign-up failed. Please try again.');
    }
});

document.getElementById('signInBtn').addEventListener('click', async () => {
    const username = document.getElementById('signInUsername').value.trim();
    const password = document.getElementById('signInPassword').value.trim();

    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }

    try {
        console.log(username+" "+password);
        await signIn(username, password);
        alert('Sign-in successful!');

        await loadPasswords();
    } catch (error) {
        console.log(username+" "+password);
        console.error('Sign-in failed:', error);
        alert('Sign-in failed. Please check your credentials.');
    }
});

document.getElementById('addPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const website = document.getElementById('websiteInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();

    if (!website || !password) {
        alert("Please fill in both fields.");
        return;
    }

    try {
        const newPassword = {
            site_name: website,
            username: sessionStorage.getItem('username'),   // Use logged-in username
            password: password
        };

        const existingPasswords = await fetchPasswords();
        const updatedPasswords = existingPasswords ? [...existingPasswords, newPassword] : [newPassword];

        await syncPasswords(updatedPasswords);

        await loadPasswords();

        document.getElementById('websiteInput').value = '';
        document.getElementById('passwordInput').value = '';

    } catch (error) {
        console.error('Failed to add password:', error);
        alert('Failed to add password. Please try again.');
    }
});

document.getElementById('logout-button').addEventListener('click', () => {
    logout();
});

document.addEventListener('DOMContentLoaded', async () => {
    const userId = sessionStorage.getItem('userId');
    if (userId) {
        await loadPasswords();
    }
});

