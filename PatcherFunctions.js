import Crypto from "./Crypto";

const ChannelStore = BdApi.findModuleByProps("getChannel", "getDMFromUserId");
const SelectedChannelStore = BdApi.findModuleByProps("getChannelId");
const UserStore = BdApi.findModuleByProps("getCurrentUser");

export default class PatcherFunctions {
	static EncryptionEnabled = false;

	//If recieved message in current DM channel is a Key exchange, process by handlePublicKey
	static patchRecievedMessage = (e) => {
		try {
			if (e.message.author.id == UserStore.getCurrentUser().id) return;
			let channelId = SelectedChannelStore.getChannelId();
			if (!channelId) return;
			if (channelId != e.message.channel_id) return;
			if (!(ChannelStore.getChannel(channelId).type == 1)) return;
			if (keylist.find((k) => k.key == channelId)) return;
			Crypto.handlePublicKey(
				channelId,
				e.message.content,
				e.message.author.username
			);
		} catch (err) {
			console.error(err);
		}
	};

	//Decrypts messages before render
	static patchRenderMessage = (e) => {
		let prop = e[0];
		try {
			let key = keylist.find((k) => k.key == prop.message.channel_id);
			if (!key) return;
			if (typeof e[0].content[0] !== "string") return;
			if (!e[0].content[0].startsWith("$:")) return;
			let decrypt;
			try {
				decrypt = Crypto.decrypt(key.value, e[0].content[0]);
			} catch (err) {
				return;
			} // Ignore errors such as non empty
			e[0].content[0] = decrypt;
		} catch (err) {
			console.error(err);
		}
	};

	static patchSendMessage = (e) => {
		let channelId = e[0];
		let message = e[1];
		const key = keylist.find((k) => k.key == channelId);
		let content = message.content;
		if (!this.EncryptionEnabled || !key) return;
		message.content = Crypto.encrypt(key.value, content);
	};
}
