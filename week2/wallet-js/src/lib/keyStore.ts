// lib/keystore.ts
import * as crypto from 'crypto';

/**
 * Deriva uma chave de 16 bytes (AES-128) a partir de uma senha.
 * @param password A senha fornecida.
 * @returns Buffer com 16 bytes de chave.
 */
function deriveKey(password: string): Buffer {
  return crypto.createHash('sha256').update(password).digest().slice(0, 16);
}

/**
 * Criptografa uma string utilizando AES-128-CBC.
 * @param data A string a ser criptografada.
 * @param password A senha para derivar a chave.
 * @returns String criptografada no formato iv:encryptedData.
 */
export function encryptData(data: string, password: string): string {
  const key = deriveKey(password);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Descriptografa uma string que foi criptografada com encryptData.
 * @param data A string criptografada.
 * @param password A senha utilizada.
 * @returns A string original.
 */

// refazer a lógica dos dados de entrada
export function decryptData(data: string, password: string): string {
	console.log(`Received data for decryption: ${data}`);
	const parts = data.split(':');
	console.log(`Split data into parts: ${parts}`);
	
	if (parts.length !== 2) {
	  throw new Error('Formato de dados inválido. Esperado: iv:encryptedData');
	}
	
	const [ivHex, encryptedData] = parts;
	const key = deriveKey(password);
	const iv = Buffer.from(ivHex, 'hex');
  
	// Verifique se o IV possui 16 bytes
	if (iv.length !== 16) {
	  throw new Error('IV inválido. Certifique-se de que o valor criptografado contém o IV correto.');
	}
	
	const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
	let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
	decrypted += decipher.final('utf8');
	return decrypted;
  }
