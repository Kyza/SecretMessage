import PatcherFunctions from "./PatcherFunctions";
import DiscordClasses from "./DiscordClasses";
import stylesheet from "./style.css";

const FluxDispatcher = BdApi.findModuleByProps("dispatch", "subscribe");
const SendMessageModule = BdApi.findModuleByProps("sendMessage");
const MessageComponent = BdApi.findModule(
	(m) => m.type?.displayName === "MessageContent"
);
const ChannelStore = BdApi.findModuleByProps("getChannel", "getDMFromUserId");
const SelectedChannelStore = BdApi.findModuleByProps("getChannelId");

const userMentionPattern = new RegExp(`<@!?([0-9]{10,})>`, "g");
const roleMentionPattern = new RegExp(`<@&([0-9]{10,})>`, "g");
const everyoneMentionPattern = new RegExp(`(?:\\s+|^)@everyone(?:\\s+|$)`);

const ButtonsHTML = `<div class="buttonContainer-28fw2U da-buttonContainer secretMessage-encrypt-button" tabindex="-1">
		<button aria-label="Send Secret Message" tabindex="0" type="button" class="buttonWrapper-1ZmCpA da-buttonWrapper button-38aScr da-button lookBlank-3eh9lL colorBrand-3pXr91 grow-q77ONN da-grow noFocus-2C7BQj da-noFocus">
			<div class="contents-18-Yxp da-contents button-3AYNKb da-button button-318s1X da-button">
				<svg xmlns="http://www.w3.org/2000/svg" class="icon-3D60ES da-icon" viewBox="0 0 24 24" aria-hidden="false" fill="currentColor" width="24px" height="24px">
					<path xmlns="http://www.w3.org/2000/svg" fill="currentColor" d="M 19.246094 3.253906 C 18.121094 2.128906 16.710938 1.546875 15 1.5 C 13.304688 1.546875 11.878906 2.128906 10.753906 3.253906 C 9.628906 4.378906 9.058594 5.789062 9.015625 7.5 C 9.015625 7.949219 9.058594 8.386719 9.148438 8.835938 L 0 18 L 0 19.5 L 1.5 21 L 4.5 21 L 6 19.5 L 6 18 L 7.5 18 L 7.5 16.5 L 9 16.5 L 9 15 L 12 15 L 13.636719 13.335938 C 14.085938 13.453125 14.519531 13.5 15 13.5 C 16.710938 13.453125 18.121094 12.871094 19.246094 11.746094 C 20.371094 10.621094 20.953125 9.210938 21 7.5 C 20.953125 5.789062 20.371094 4.378906 19.246094 3.253906 Z M 16.5 8.070312 C 15.34375 8.070312 14.429688 7.15625 14.429688 6 C 14.429688 4.84375 15.34375 3.929688 16.5 3.929688 C 17.65625 3.929688 18.570312 4.84375 18.570312 6 C 18.570312 7.15625 17.65625 8.070312 16.5 8.070312 Z M 16.5 8.070312 "/>
				</svg>
			</div>
		</button>
	</div>
<div class="secretMessage-contextMenu" tabindex="-1">
	<div class="buttonContainer-28fw2U da-buttonContainer secretMessage-exchange-button">
		<button aria-label="Send Secret Message" tabindex="0" type="button" class="buttonWrapper-1ZmCpA da-buttonWrapper button-38aScr da-button lookBlank-3eh9lL colorBrand-3pXr91 grow-q77ONN da-grow noFocus-2C7BQj da-noFocus">
			<div class="contents-18-Yxp da-contents button-3AYNKb da-button button-318s1X da-button">
				<svg xmlns="http://www.w3.org/2000/svg" class="icon-3D60ES da-icon" viewBox="0 0 19 24" aria-hidden="false" fill="currentColor" width="24px" height="24px">
					<path xmlns="http://www.w3.org/2000/svg" fill="currentColor" d="M 19.207031 5.332031 L 14.21875 0.355469 C 13.992188 0.128906 13.679688 0 13.351562 0 L 13.042969 0 L 13.042969 6.5 L 19.566406 6.5 L 19.566406 6.191406 C 19.566406 5.871094 19.4375 5.558594 19.207031 5.332031 Z M 11.414062 6.90625 L 11.414062 0 L 1.222656 0 C 0.542969 0 0 0.542969 0 1.21875 L 0 24.78125 C 0 25.457031 0.542969 26 1.222656 26 L 18.34375 26 C 19.023438 26 19.566406 25.457031 19.566406 24.78125 L 19.566406 8.125 L 12.636719 8.125 C 11.964844 8.125 11.414062 7.574219 11.414062 6.90625 Z M 3.261719 3.65625 C 3.261719 3.433594 3.445312 3.25 3.667969 3.25 L 7.746094 3.25 C 7.96875 3.25 8.152344 3.433594 8.152344 3.65625 L 8.152344 4.46875 C 8.152344 4.691406 7.96875 4.875 7.746094 4.875 L 3.667969 4.875 C 3.445312 4.875 3.261719 4.691406 3.261719 4.46875 Z M 3.261719 7.71875 L 3.261719 6.90625 C 3.261719 6.683594 3.445312 6.5 3.667969 6.5 L 7.746094 6.5 C 7.96875 6.5 8.152344 6.683594 8.152344 6.90625 L 8.152344 7.71875 C 8.152344 7.941406 7.96875 8.125 7.746094 8.125 L 3.667969 8.125 C 3.445312 8.125 3.261719 7.941406 3.261719 7.71875 Z M 10.597656 21.121094 L 10.597656 22.34375 C 10.597656 22.566406 10.414062 22.75 10.191406 22.75 L 9.375 22.75 C 9.148438 22.75 8.96875 22.566406 8.96875 22.34375 L 8.96875 21.109375 C 8.394531 21.082031 7.832031 20.878906 7.371094 20.53125 C 7.171875 20.382812 7.160156 20.089844 7.339844 19.917969 L 7.941406 19.347656 C 8.078125 19.210938 8.289062 19.207031 8.453125 19.308594 C 8.652344 19.433594 8.875 19.5 9.109375 19.5 L 10.539062 19.5 C 10.871094 19.5 11.140625 19.199219 11.140625 18.832031 C 11.140625 18.527344 10.957031 18.261719 10.695312 18.183594 L 8.402344 17.5 C 7.457031 17.214844 6.792969 16.308594 6.792969 15.292969 C 6.792969 14.050781 7.761719 13.039062 8.96875 13.003906 L 8.96875 11.78125 C 8.96875 11.558594 9.148438 11.375 9.375 11.375 L 10.191406 11.375 C 10.414062 11.375 10.597656 11.558594 10.597656 11.78125 L 10.597656 13.011719 C 11.171875 13.042969 11.730469 13.246094 12.195312 13.59375 C 12.394531 13.742188 12.402344 14.035156 12.222656 14.207031 L 11.625 14.777344 C 11.484375 14.914062 11.277344 14.917969 11.113281 14.816406 C 10.910156 14.691406 10.6875 14.625 10.457031 14.625 L 9.023438 14.625 C 8.691406 14.625 8.425781 14.925781 8.425781 15.292969 C 8.425781 15.597656 8.605469 15.863281 8.871094 15.941406 L 11.164062 16.625 C 12.109375 16.910156 12.773438 17.816406 12.773438 18.832031 C 12.773438 20.074219 11.800781 21.085938 10.597656 21.121094 Z M 10.597656 21.121094 "/>
				</svg>
			</div>
		</button>
	</div>
	<div class="buttonContainer-28fw2U da-buttonContainer secretMessage-settings-button">
		<button aria-label="Send Secret Message" tabindex="0" type="button" class="buttonWrapper-1ZmCpA da-buttonWrapper button-38aScr da-button lookBlank-3eh9lL colorBrand-3pXr91 grow-q77ONN da-grow noFocus-2C7BQj da-noFocus">
			<div class="contents-18-Yxp da-contents button-3AYNKb da-button button-318s1X da-button">
				<svg aria-hidden="false" width="24" height="24" viewBox="0 0 24 24">
					<path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M19.738 10H22V14H19.739C19.498 14.931 19.1 15.798 18.565 16.564L20 18L18 20L16.565 18.564C15.797 19.099 14.932 19.498 14 19.738V22H10V19.738C9.069 19.498 8.203 19.099 7.436 18.564L6 20L4 18L5.436 16.564C4.901 15.799 4.502 14.932 4.262 14H2V10H4.262C4.502 9.068 4.9 8.202 5.436 7.436L4 6L6 4L7.436 5.436C8.202 4.9 9.068 4.502 10 4.262V2H14V4.261C14.932 4.502 15.797 4.9 16.565 5.435L18 3.999L20 5.999L18.564 7.436C19.099 8.202 19.498 9.069 19.738 10ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"></path>
				</svg>
			</div>
		</button>
	</div>
</div>`;

export default class SecretMessage {
	patches = [];

	start() {
		this.patches.push(
			BdApi.monkeyPatch(MessageComponent, "type", {
				before: PatcherFunctions.patchRenderMessage,
			})
		);
		this.patches.push(
			BdApi.monkeyPatch(SendMessageModule, "sendMessage", {
				before: PatcherFunctions.patchSendMessage,
			})
		);
		FluxDispatcher.subscribe(
			"MESSAGE_CREATE",
			PatcherFunctions.patchRecievedMessage
		);
		const form = document.querySelector("form");
		const buttonArea = document.querySelector(".secretMessage-buttonArea");
		// if (form) {
		// 	if (!buttonArea) this.addButtonArea(form);
		// }
		stylesheet.add();
	}

	stop() {
		for (const patch of this.patches) {
			console.log(patch);
		}
		FluxDispatcher.unsubscribe(
			"MESSAGE_CREATE",
			PatcherFunctions.patchRecievedMessage
		);
		const buttonArea = document.querySelector(".secretMessage-buttonArea");
		// if (buttonArea) buttonArea.remove();
		stylesheet.remove();
	}

	addButtonArea(form) {
		if (form.querySelector(".secretMessage-buttonArea")) return;
		const buttonArea = Object.assign(document.createElement("div"), {
			className: "secretMessage-buttonArea",
			innerHTML: ButtonsHTML,
		});
		form.querySelector(DiscordClasses.attachButton)
			.parent()
			.parent()
			.prepend(buttonArea);
		const buttons = form.querySelector(".secretMessage-buttonArea");
		const contextButtons = form.querySelector(".secretMessage-contextMenu");
		const encryptButton = form.querySelector(
			".secretMessage-encrypt-button"
		);
		const exchangeButton = form.querySelector(
			".secretMessage-exchange-button"
		);
		const settingsButton = form.querySelector(
			".secretMessage-settings-button"
		);

		if (PatcherFunctions.EncryptionEnabled)
			encryptButton.addClass("secretMessage-button-enabled");

		settingsButton.addEventListener("click", () => {
			BdApi.findModuleByProps("openModal").openModal((props) => {
				return React.createElement(
					BdApi.findModuleByProps("ModalRoot").ModalRoot,
					{
						size: "large",
						transitionState: props.transitionState,
						children: React.createElement("p", {}),
					}
				);
			});
		});

		encryptButton.addEventListener("click", (e) => {
			if (!PatcherFunctions.EncryptionEnabled) {
				PatcherFunctions.EncryptionEnabled = true;
				encryptButton.addClass("secretMessage-button-enabled");
				BdApi.showToast("Encryption enabled", {
					timeout: 4000,
					type: "warning",
				});
			} else {
				PatcherFunctions.EncryptionEnabled = false;
				encryptButton.removeClass("secretMessage-button-enabled");
				BdApi.showToast("Encryption disabled.", {
					timeout: 4000,
					type: "warning",
				});
			}
		});

		encryptButton.addEventListener("contextmenu", (e) => {
			if (contextButtons.hasClass("secretMessage-openMenu")) {
				contextButtons.removeClass("secretMessage-openMenu");
				contextButtons.blur();
			} else {
				contextButtons.addClass("secretMessage-openMenu");
				contextButtons.focus();
			}
		});

		contextButtons.addEventListener("blur", (e) => {
			setTimeout(() => {
				if (contextButtons.hasClass("secretMessage-openMenu"))
					contextButtons.removeClass("secretMessage-openMenu");
			}, 250);
		});

		//Create your pair of keys by clicking the button
		exchangeButton.addEventListener("click", () => {
			let channelId = SelectedChannelStore.getChannelId();
			if (
				PatcherFunctions.EncryptionEnabled ||
				keylist.find((k) => k.key == channelId)
			) {
			}
			const channel = ChannelStore.getChannel(channelId);
			if (!channel.type == 1) {
				BdApi.showToast("Can't send key into public channel.", {
					timeout: 4000,
					type: "error",
				});
				return;
			}
			const keyExchange = Crypto.createKeyExchange(channel.id);
			const publicKeyMessage = `\`\`\`\n-----BEGIN PUBLIC KEY-----\n${keyExchange}\n-----END PUBLIC KEY-----\n\`\`\``;
			BdApi.findModuleByProps("sendMessage").sendMessage(channel.id, {
				content: publicKeyMessage,
				validNonShortcutEmojis: [],
			});
			Logger.log("Key exchange for channel " + channel.id + " started.");
			BdApi.showToast("Key exchange started.", {
				timeout: 5000,
				type: "info",
			});
		});
	}

	observer(e) {
		if (
			!e.addedNodes.length ||
			!e.addedNodes[0] ||
			!e.addedNodes[0].querySelector
		)
			return;
		const form = e.addedNodes[0].querySelector(DiscordClasses.inner);
		const buttonArea = document.querySelector(".secretMessage-buttonArea");
		const encryptButton = document.querySelector(
			".secretMessage-encrypt-button"
		);
		if (form) {
			if (!buttonArea) this.addButtonArea(form);
			if (encryptButton) {
				if (
					PatcherFunctions.EncryptionEnabled &&
					!keylist.find(
						(k) => k.key == SelectedChannelStore.getChannelId()
					)
				) {
					encryptButton.removeClass("secretMessage-button-enabled");
				}
			}
		}
	}
}
