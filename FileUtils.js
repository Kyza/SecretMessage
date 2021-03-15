const FileUploadModule = BdApi.findModuleByProps(
	"upload",
	"instantBatchUpload"
);

export default class FileUtils {
	static createFile(text, prefix) {
		return new File(
			[
				new Uint8Array([
					0x89,
					0x50,
					0x4e,
					0x47,
					0x0d,
					0x0a,
					0x1a,
					0x0a,
					0x00,
					0x00,
					0x00,
					0x0d,
					0x49,
					0x48,
					0x44,
					0x52,
					0x00,
					0x00,
					0x00,
					0x01,
					0x00,
					0x00,
					0x00,
					0x01,
					0x08,
					0x06,
					0x00,
					0x00,
					0x00,
					0x1f,
					0x15,
					0xc4,
					0x89,
					0x00,
					0x00,
					0x00,
					0x0a,
					0x49,
					0x44,
					0x41,
					0x54,
					0x78,
					0x9c,
					0x63,
					0x00,
					0x01,
					0x00,
					0x00,
					0x05,
					0x00,
					0x01,
					0x0d,
					0x0a,
					0x2d,
					0xb4,
					0x00,
					0x00,
					0x00,
					0x00,
					0x49,
					0x45,
					0x4e,
					0x44,
					0xae,
					0x42,
					0x60,
					0x82,
					...new TextEncoder().encode(prefix + text),
				]).buffer,
			],
			"SecretMessageFile.png",
			{ type: "image/png" }
		);
	}

	static extractFromFile(file, prefix) {
		return Buffer.from(file).slice(67).replace(prefix, "").toString();
	}

	static fileUpload(channelId, file, message) {
		FileUploadModule.upload(channelId, file, message, false, file.name);
	}
}