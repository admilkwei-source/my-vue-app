import CryptoJS from "crypto-js";

class PasswordEncryptor {
    private encryptionKey: string;
    private iv: CryptoJS.lib.WordArray;

    constructor(encryptionKey: string, iv: string) {
        // 加密密钥（需要与后端保持一致）
        this.encryptionKey = encryptionKey ?? '';
        // 固定的 IV（与后端保持一致）
        this.iv = CryptoJS.enc.Utf8.parse(iv);
    }

    // 加密密码
    encryptPassword(password: string) {
        try {
            if(!this.encryptionKey){
                throw new Error('加密密钥不能为空');
            }
            if(!this.iv){
                throw new Error('IV不能为空');
            }
            const key = CryptoJS.enc.Utf8.parse(this.encryptionKey);
            const encrypted = CryptoJS.AES.encrypt(password, key, {
                iv: this.iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            return encrypted.toString();
        } catch (error) {
            console.error('加密失败:', error);
            throw new Error('密码加密失败');
        }
    }
}

export default PasswordEncryptor;