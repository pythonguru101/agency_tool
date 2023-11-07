import CryptoES from 'crypto-es';

// Encryption function
export function encryptData(data, key) {
    const encryptedData = CryptoES.AES.encrypt(data, key).toString();
    return encryptedData;
}

// Decryption function
export function decryptData(encryptedData, key) {
    const decryptedData = CryptoES.AES.decrypt(encryptedData, key).toString(CryptoES.enc.Utf8);
    if (decryptedData === '') {
        return 'Error : Invalid key'
    }
    return decryptedData;
}