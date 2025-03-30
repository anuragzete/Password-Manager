const API_BASE_URL = '/Password_Manager_Backend_war_exploded/sync';  // Base URL for SyncServlet

const fetchRequest = async (url, method, data = null) => {
    try {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
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
        console.error(`Fetch error: ${error.message}`);
        alert(`Request failed: ${error.message}`);
        throw error;
    }
};

const fetchPasswords = async () => {
    const userId = sessionStorage.getItem('userId');  // MongoDB _id

    if (!userId) {
        alert('User ID not found. Please sign in again.');
        return [];
    }

    try {
        const result = await fetchRequest(`${API_BASE_URL}?user_id=${userId}`, 'GET');

        if (result.status === 'success') {
            return result.passwords;
        } else {
            alert(`Failed to fetch passwords: ${result.error}`);
            return [];
        }
    } catch (error) {
        console.error('Error fetching passwords:', error);
        alert('Failed to fetch passwords. Please try again.');
        return [];
    }
};

const syncPasswords = async (localPasswords) => {
    const userId = sessionStorage.getItem('userId');  // MongoDB _id

    if (!userId) {
        alert('User ID not found. Please sign in again.');
        return;
    }

    try {
        const result = await fetchRequest(API_BASE_URL, 'POST', {
            user_id: userId,
            passwords: localPasswords
        });

        if (result.status === 'Sync successful') {
            alert('Passwords synced successfully!');
        } else {
            alert(`Sync failed: ${result.error}`);
        }

    } catch (error) {
        console.error('Error syncing passwords:', error);
        alert('Failed to sync passwords. Please try again.');
    }
};

export { fetchPasswords, syncPasswords };
