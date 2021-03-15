const zwsCharacters = ["\u034F", "\u180e", "\u200b", "\u200c", "\u200d"];

export default class CompressExtensions {
	static zeroPad(num) {
		return "000".slice(String(num).length) + num;
	}

	static stringToBinary(str) {
		return str.replace(/[\s\S]/g, (str) => {
			str = this.zeroPad(str.charCodeAt().toString(5));
			return str;
		});
	}

	static binaryToString(str) {
		// Removes the spaces from the binary string
		str = str.replace(/\s+/g, "");
		// Pretty (correct) print binary (add a space every 8 characters)
		str = str.match(/.{1,3}/g).join(" ");

		var newBinary = str.split(" ");
		var binaryCode = [];

		for (var i = 0; i < newBinary.length; i++) {
			binaryCode.push(String.fromCharCode(parseInt(newBinary[i], 5)));
		}

		return binaryCode.join("");
	}

	static stringToZWS(string) {
		let finalString = "";
		let binary = this.stringToBinary(string);
		for (let i = 0; i < binary.length; i++) {
			finalString += zwsCharacters[parseInt(binary[i])];
		}
		return finalString;
	}

	static zwsToString(string) {
		let finalString = "";
		for (let i = 0; i < string.length; i++) {
			finalString += zwsCharacters.indexOf(string[i]);
		}
		return this.binaryToString(finalString);
	}
}
