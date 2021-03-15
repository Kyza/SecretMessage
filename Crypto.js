import * as nodecrypto from "discord/crypto";

const ChannelStore = BdApi.findModuleByProps("getChannel", "getDMFromUserId");
const SelectedChannelStore = BdApi.findModuleByProps("getChannelId");

const algorithm = "aes-256-cbc";
const ECDH_STORAGE = {};
const keylist = [{ key: "", value: "" }]; // Change for proper database

export default class Crypto {
	static encrypt(key, content) {
		const iv = nodecrypto.randomBytes(16);
		let sha256 = this.sha256(key);
		let cipher = nodecrypto.createCipheriv(algorithm, sha256, iv);
		let encrypted = cipher.update(content);
		encrypted = Buffer.concat([iv, encrypted, cipher.final()]);
		return { data: encrypted.toString("hex") };
	}

	static decrypt(key, content) {
		let input = Buffer.from(content, "hex");
		let sha256 = this.sha256(key);
		let iv = Buffer.from(input.slice(0, 16));
		let decipher = nodecrypto.createDecipheriv(algorithm, sha256, iv);
		let encryptedText = input.slice(16);
		let decrypted = decipher.update(encryptedText);
		decrypted = Buffer.concat([decrypted, decipher.final()]);
		return decrypted.toString();
	}

	static async createHmac(key, data, algorithm = "sha256") {
		const hmac = nodecrypto.createHmac(algorithm, key);
		return new Promise((resolve, reject) => {
			hmac.on("readable", () => {
				const data = hmac.read();
				if (data) return resolve(data.toString("hex"));
				reject(null);
			});
			hmac.write(data);
			hmac.end();
		});
	}

	static createECDH(curve = "secp384r1") {
		return nodecrypto.createECDH(curve);
	}

	static hash(algorithm, data, encoding) {
		const hash = nodecrypto.createHash(algorithm);
		hash.update(data);
		return hash.digest(encoding);
	}

	static randomBytes(length = 16) {
		return nodecrypto.randomBytes(length);
	}

	static sha256(text) {
		const hash = nodecrypto.createHash("sha256");
		hash.update(text);
		return hash.digest();
	}

	static generateECDHKeys(ecdh) {
		return ecdh.generateKeys("base64");
	}

	static getECDHPublicKey(ecdh) {
		return ecdh.getPublicKey("base64");
	}

	static computeECDHSecret(ecdh, otherPublicKey) {
		return ecdh.computeSecret(otherPublicKey, "base64", "base64");
	}

	//Generate secret key from your private and another user pubilc key
	static computeSecret(userId, otherKey) {
		try {
			const secret = this.computeECDHSecret(
				ECDH_STORAGE[userId],
				otherKey
			);
			delete ECDH_STORAGE[userId];
			return this.hash("sha256", secret, "hex");
		} catch (e) {
			throw e;
		}
	}

	//Save the computed secret key used for encryption/decryption
	static setKey(userId, key) {
		const items = keylist;
		const index = keylist.findIndex((kvp) => kvp.value.key === userId);
		if (index > -1) {
			items[index].value = {
				key: userId,
				value: key,
			};
			return;
		}
		keylist.push({ key: userId, value: key });
	}

	//Generates exchange keys for current user
	static createKeyExchange(userId) {
		if (ECDH_STORAGE.hasOwnProperty(userId)) return null;
		ECDH_STORAGE[userId] = this.createECDH();
		setTimeout(() => {
			//Expire the keys after 30 seconds, if computeSecret is not called in this time window, user has to create new keypair
			if (ECDH_STORAGE.hasOwnProperty(userId)) {
				delete ECDH_STORAGE[userId];
			}
			console.warn("Key exchange expired.");
			BdApi.showToast("Key exchange expired.", {
				timeout: 5000,
				type: "warning",
			});
		}, 30000);
		return this.generateECDHKeys(ECDH_STORAGE[userId]);
	}

	static handlePublicKey(userId, content, username) {
		const [tagstart, begin, key, end, tagend] = content.split("\n");
		if (
			begin !== "-----BEGIN PUBLIC KEY-----" ||
			end !== "-----END PUBLIC KEY-----"
		)
			return; // No key in the message
		try {
			BdApi.showConfirmationModal(
				"Exchange Request",
				`The user ${username} is requesting key exchange.`,
				{
					confirmText: "Exchange",
					cancelText: "Cancel",
					onConfirm: () => {
						//User confirmed the exchange
						if (!ECDH_STORAGE.hasOwnProperty(userId)) {
							const publicKeyMessage = `\`\`\`\n-----BEGIN PUBLIC KEY-----\n${this.createKeyExchange(
								userId
							)}\n-----END PUBLIC KEY-----\n\`\`\``;
							BdApi.findModuleByProps("sendMessage").sendMessage(
								ChannelStore.getChannel(
									SelectedChannelStore.getChannelId()
								).id,
								{
									content: publicKeyMessage,
									validNonShortcutEmojis: [],
								}
							);
						}
						const secret = this.computeSecret(userId, key);
						this.setKey(userId, secret);
						BdApi.showToast("Exchange successful.", {
							timeout: 5000,
							type: "success",
						});
						console.log("Key for user" + userId + " saved.");
					},
				}
			);
		} catch (err) {
			console.error(err);
			return;
		}
	}
}
