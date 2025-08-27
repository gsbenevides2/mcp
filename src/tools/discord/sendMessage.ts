import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { discordClient } from "../../clients";
import { AbstractTool, type OnErrorToolCallback } from "../AbstractTool";

const args = {
	message: z.string().describe("The message will be sended"),
};

type Args = typeof args;

export class SendDiscordMessageTool extends AbstractTool<Args> {
	name = "send-discord-message";
	description = "Send a message to a Guilherme's discord chat";
	args = args;

	execute: ToolCallback<Args> = async (args) => {
		const { message } = args;
		await discordClient.post("/api/messages/", {
			message,
		});
		return {
			content: [
				{
					type: "text",
					text: "Message sent",
				},
			],
		};
	};

	onError: OnErrorToolCallback<Args> = () => {
		return {
			content: [
				{
					type: "text",
					text: "Error sending message",
				},
			],
		};
	};
}
