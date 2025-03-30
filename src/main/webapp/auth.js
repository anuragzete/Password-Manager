/*import { encryptPassword } from './crypt.js';*/
import {fetchPasswords} from "./sync.js";
import {decryptPassword, encryptPassword} from "./crypt";

const fetchRequest = async (url, method, data = null) => {
    try {
        const options = {
            method,
            headers: {'Content-Type': 'application/json'}
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || `Error: ${response.status}`);
        }

        return result;

    } catch (error) {
        alert(`Request failed: ${error.message}`);
        throw error;
    }
};

const signUp = async (username, password) => {
    if (!username || !password) {
        alert('Please fill in all fields!');
        return;
    }

    const encpassword = encryptPassword(password, username);
    console.log(username + " " + password + " " + encpassword);
    const decpassword = decryptPassword(encpassword, username);
    console.log(decpassword);
    try {
        const result = await fetchRequest('/Password_Manager_Backend_war_exploded/auth?action=signup', 'POST', {
            username,
            encryptedPassword: password
        });

        if (result.status === 'success') {
            alert('Sign Up successful! Please Sign In.');
            document.getElementById('switchToSignIn').click();
        } else {
            alert(`Error during Sign Up: ${result.error}`);
        }
    } catch (error) {
        console.error('Sign Up error:', error);
    }
};


const signIn = async (username, password) => {
    if (!username || !password) {
        alert('Please enter both username and password!');
        return;
    }

    //const encryptedMasterPassword = encryptPassword(password, username);
    console.log(username + " " + password);
    try {
        const result = await fetchRequest('/Password_Manager_Backend_war_exploded/auth?action=signin', 'POST', {
            username,
            encryptedPassword: password
        });

        if (result.status === 'success' && result.userId) {
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('userId', result.userId);
            sessionStorage.setItem('masterPassword', password);

            document.getElementById('authModal').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';

            await fetchPasswords();
        } else {
            alert(result.error || 'Invalid username or password');
        }

    } catch (error) {
        console.error('Sign In error:', error);
    }
};

// ✅ Logout Function
const logout = () => {
    sessionStorage.clear();
    window.location.reload();
};

export {signUp, signIn, logout};
