/**
 * Encrypts a raw file using simple AES-CBC and a password-derived key.
 */
async function encryptFile(file, password) {
    if (!file || !password) {
        throw new Error("Missing file or password parameters.");
    }

    const fileBytes = new Uint8Array(await file.arrayBuffer());
    
    // Generate secure random elements
    const salt = crypto.getRandomValues(new Uint8Array(16)); // For PBKDF2
    const iv = crypto.getRandomValues(new Uint8Array(16));   // AES-CBC requires a 16-byte IV

    // Import raw password string and stretch it into an AES key
    const encoder = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
        "raw", 
        encoder.encode(password), 
        "PBKDF2", 
        false, 
        ["deriveKey"]
    );

    const aesKey = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        baseKey,
        { name: "AES-CBC", length: 256 },
        false,
        ["encrypt"]
    );

    // Encrypt using simple AES-CBC
    const ciphertext = await crypto.subtle.encrypt(
        { name: "AES-CBC", iv: iv },
        aesKey,
        fileBytes
    );

    // Package structure: Salt (16B) + IV (16B) + Ciphertext Data
    const packedBuffer = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
    packedBuffer.set(salt, 0);
    packedBuffer.set(iv, 16);
    packedBuffer.set(new Uint8Array(ciphertext), 32);

    return new Blob([packedBuffer], { type: "application/octet-stream" });
}