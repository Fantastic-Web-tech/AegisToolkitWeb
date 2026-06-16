// --- Helper to change Bootstrap status box colors easily ---
function updateStatus(elementId, message, statusType) {
    const box = document.getElementById(elementId);
    box.className = "output-box p-3 mt-3 rounded visible-box border-start";
    box.innerText = message;

    if (statusType === "error") box.classList.add("border-danger", "text-danger");
    if (statusType === "success") box.classList.add("border-success", "text-success");
    if (statusType === "loading") box.classList.add("text-light");
}

// --- Encryption UI Button Handler ---
async function handleEncryption() {
    const fileInput = document.getElementById('encryptFile').files[0];
    const password = document.getElementById('encryptPassword').value;

    if (!fileInput || !password) {
        updateStatus('encryptStatus', "Error: Select a file and type a password.", "error");
        return;
    }

    try {
        updateStatus('encryptStatus', "Encrypting file data...", "loading");
        const encryptedBlob = await encryptFile(fileInput, password);

        const url = URL.createObjectURL(encryptedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileInput.name + ".enc";
        a.click();
        URL.revokeObjectURL(url);

        updateStatus('encryptStatus', `Success! Saved as: ${fileInput.name}.enc`, "success");
    } catch (err) {
        updateStatus('encryptStatus', "Encryption Failed: " + err.message, "error");
    }
}

// --- Decryption UI Button Handler ---
async function handleDecryption() {
    const fileInput = document.getElementById('decryptFile').files[0];
    const password = document.getElementById('decryptPassword').value;

    if (!fileInput || !password) {
        updateStatus('decryptStatus', "Error: Select an encrypted file and enter the password.", "error");
        return;
    }

    try {
        updateStatus('decryptStatus', "Decrypting file data...", "loading");
        const decryptedBlob = await decryptFile(fileInput, password);

        let originalName = fileInput.name.endsWith('.enc') ? fileInput.name.slice(0, -4) : 'decrypted_file';

        const url = URL.createObjectURL(decryptedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = originalName;
        a.click();
        URL.revokeObjectURL(url);

        updateStatus('decryptStatus', `Success! Restored as: ${originalName}`, "success");
    } catch (err) {
        updateStatus('decryptStatus', "Decryption Failed: Check password or file. (" + err.message + ")", "error");
    }
}

// --- Hashing UI Button Handler ---
async function handleHashGeneration() {
    const textInput = document.getElementById('hashText').value;
    const algoSelection = document.getElementById('hashAlgo').value;

    if (!textInput.trim()) {
        updateStatus('hashStatus', "Error: Please type or paste some text to hash.", "error");
        return;
    }

    try {
        updateStatus('hashStatus', "Calculating hash signature...", "loading");
        const generatedHash = await generateTextHash(textInput, algoSelection);
        updateStatus('hashStatus', `${algoSelection} Hash:\n${generatedHash}`, "success");
    } catch (err) {
        updateStatus('hashStatus', "Hashing Failed: " + err.message, "error");
    }
}