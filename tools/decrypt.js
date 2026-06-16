
async function decryptFile(encryptedFile, password) {
    if (!encryptedFile || !password) {
        throw new Error("Missing file or password parameters.");
    }

    const fileBytes = new Uint8Array(await encryptedFile.arrayBuffer());
    
    // Safety verification check for file structures (Salt 16B + IV 16B = 32B minimum)
    if (fileBytes.length < 32) {
        throw new Error("File formatting context error: Data footprint is too small.");
    }

    // Extract structural cryptographic headers
    const salt = fileBytes.slice(0, 16);
    const iv = fileBytes.slice(16, 32);
    const ciphertext = fileBytes.slice(32);

    // Reconstruct the key from password using the extracted salt
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
        ["decrypt"]
    );

    // Attempt Decryption
    // Note: If the password is wrong or data is heavily corrupted, padding errors occur here.
    const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-CBC", iv: iv },
        aesKey,
        ciphertext
    );

    return new Blob([decryptedBuffer], { type: "application/octet-stream" });
}