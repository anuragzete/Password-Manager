
// ✅ Derive Key using Master Password and Username
function deriveKey(masterPassword, username) {
    return CryptoJS.PBKDF2(masterPassword, CryptoJS.enc.Utf8.parse(username), {
        keySize: 256 / 32,
        iterations: 10000
    });
}

// ✅ Encrypt Data using Username as Salt
function encryptPassword(data, username, masterPassword) {
    if (!data || !username || !masterPassword) {
        console.error("Encryption failed: Missing data, username, or master password.");
        throw new Error("Encryption failed: Missing data, username, or master password.");
    }

    const key = deriveKey(masterPassword, username);
    const iv = CryptoJS.lib.WordArray.random(128 / 8);

    const encrypted = CryptoJS.AES.encrypt(data, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    return `${iv.toString(CryptoJS.enc.Base64)}:${encrypted.toString()}`;
}

// ✅ Decrypt Data using Username as Salt
function decryptPassword(encryptedData, username, masterPassword) {
    if (!encryptedData || !username || !masterPassword) {
        console.error("Decryption failed: Missing encrypted data, username, or master password.");
        throw new Error("Decryption failed: Missing encrypted data, username, or master password.");
    }

    try {
        const [ivBase64, encryptedBase64] = encryptedData.split(':');
        const iv = CryptoJS.enc.Base64.parse(ivBase64);
        const key = deriveKey(masterPassword, username);

        const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key, {
            iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
        if (!decryptedText) {
            console.warn("Decryption returned empty result.");
            return null;
        }

        return decryptedText;
    } catch (error) {
        console.error("Decryption error:", error);
        return null;
    }
}

export {encryptPassword,decryptPassword};
