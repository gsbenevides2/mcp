import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { googleClient } from "../../../clients";
import { AbstractTool, type OnErrorToolCallback } from "../../AbstractTool";

const args = {
	email: z.string().email().describe("The email address of the account"),
	messageId: z.string().describe("The ID of the message to retrieve"),
	format: z
		.enum(["minimal", "full", "raw", "metadata"])
		.optional()
		.default("full")
		.describe("The format of the message (default: full)"),
} as const;

type Args = typeof args;
export type { Args };

export class GetEmailById extends AbstractTool<Args> {
	name = "get-email-by-id";
	description = "Get detailed email content by message ID from Gmail";
	args = args;

	onError: OnErrorToolCallback<Args> = () => {
		return {
			content: [{ type: "text", text: "Error getting email details" }],
			isError: true,
		};
	};

	execute: ToolCallback<Args> = async (args) => {
		const email = await googleClient.get("/api/google-gmail/get-email-by-id", {
			query: args,
		});
		const emailData = email.data;

		if (email) {
			const id = emailData.id || "Unknown ID";
			const from = emailData.from || "Unknown sender";
			const to = emailData.to || "Unknown recipient";
			const subject = emailData.subject || "No subject";
			const date = emailData.date || "Unknown date";
			const isUnread = emailData.isUnread ? "Yes" : "No";
			const threadId = emailData.threadId || "Unknown thread ID";
			const body = emailData.body || "No body content available";
			return {
				content: [
					{
						type: "text",
						text: `Email Id: ${id}\nFrom: ${from}\nTo: ${to}\nSubject: ${subject}\nDate: ${date}\nUnread: ${isUnread}\nThread ID: ${threadId}\nBody: ${body}`,
					},
				],
			};
		} else {
			return {
				content: [{ type: "text", text: "Email not found" }],
			};
		}
	};
}
