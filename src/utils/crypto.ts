import CryptoJS from 'crypto-js';
import forge from 'node-forge';

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export function generateRSAKeyPair(): KeyPair {
  const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
  return {
    publicKey: forge.pki.publicKeyToPem(keypair.publicKey),
    privateKey: forge.pki.privateKeyToPem(keypair.privateKey)
  };
}

export function calculateMD5(hexString: string): string {
  // Remove any whitespace and validate hex string
  const cleanHex = hexString.replace(/\s+/g, '');
  if (!/^[0-9a-fA-F]+$/.test(cleanHex)) {
    throw new Error('Invalid hex string');
  }
  
  // Convert hex string to bytes
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i/2] = parseInt(cleanHex.substr(i, 2), 16);
  }
  
  // Convert bytes to WordArray and calculate MD5
  const wordArray = CryptoJS.lib.WordArray.create(bytes);
  return CryptoJS.MD5(wordArray).toString();
}

export function rsaEncrypt(message: string, publicKey: string): string {
  const key = forge.pki.publicKeyFromPem(publicKey);
  return forge.util.encode64(key.encrypt(message));
}

export function rsaDecrypt(encrypted: string, privateKey: string): string {
  const key = forge.pki.privateKeyFromPem(privateKey);
  return key.decrypt(forge.util.decode64(encrypted));
}