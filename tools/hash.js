
async function generateTextHash(text, algorithm) {
    if (typeof text !== 'string') {
        throw new Error("Input payload must be standard text context string.");
    }

    const normalizedAlgo = algorithm.toUpperCase();

    // Handle Legacy (MD5, SHA-1) via CryptoJS
    if (normalizedAlgo === 'MD5' || normalizedAlgo === 'SHA-1') {
        if (typeof CryptoJS === 'undefined') {
            throw new Error("Missing dependency: CryptoJS resource required for legacy hashes.");
        }
        let legacyHash;
        if (normalizedAlgo === 'MD5') legacyHash = CryptoJS.MD5(text);
        if (normalizedAlgo === 'SHA-1') legacyHash = CryptoJS.SHA1(text);
        return legacyHash.toString(CryptoJS.enc.Hex);
    }

    // Native Browser Profiles (SHA-256, SHA-512)
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(text);
    
    const resultBuffer = await crypto.subtle.digest(normalizedAlgo, dataBuffer);
    
    const hashArray = Array.from(new Uint8Array(resultBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}