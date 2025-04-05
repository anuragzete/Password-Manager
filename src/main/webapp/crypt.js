/*
import CryptoJS from 'crypto-js';

// ✅ Derive Key using Provided Salt and Password
function deriveKey(password, salt) {
    return CryptoJS.PBKDF2(password, CryptoJS.enc.Utf8.parse(salt), {
        keySize: 256 / 32,    // AES-256 key size
        iterations: 10000      // Iterations for added security
    });
}

// ✅ Encrypt Password with Provided Salt
export function encryptPassword(password, salt) {
    if (!password || !salt) {
        console.error("Encryption failed: Missing password or salt.");
        throw new Error("Encryption failed: Missing password or salt.");
    }

    const key = deriveKey(password, salt);  // Derive key from password and salt

    const encrypted = CryptoJS.AES.encrypt(password, key);  // Encrypt using AES

    return encrypted.toString();  // Return Base64-encoded encrypted string
}

// ✅ Decrypt Password with Provided Salt
export function decryptPassword(encryptedPassword, salt, password) {
    if (!encryptedPassword || !salt || !password) {
        console.error("Decryption failed: Missing encrypted password, salt, or password.");
        throw new Error("Decryption failed: Missing encrypted password, salt, or password.");
    }

    try {
        const key = deriveKey(password, salt);  // Derive key with provided salt and password

        const decryptedBytes = CryptoJS.AES.decrypt(encryptedPassword, key);  // Decrypt AES
        const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

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
*/
