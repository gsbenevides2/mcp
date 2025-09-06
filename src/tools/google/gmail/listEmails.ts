import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { googleClient } from "../../../clients";
import { AbstractTool, type OnErrorToolCallback } from "../../AbstractTool";

const args = {
	email: z.string().email().describe("The email address of the account"),
	maxResults: z
		.number()
		.optional()
		.default(10)
		.describe("Maximum number of emails to return (default: 10)"),
	q: z
		.string()
		.optional()
		.describe(
			'Gmail search query (e.g., "is:unread", "from:example@email.com")',
		),
	labelIds: z
		.array(z.string())
		.optional()
		.describe("Array of label IDs to filter by"),
	includeSpamTrash: z
		.boolean()
		.optional()
		.default(false)
		.describe("Include spam and trash emails"),
} as const;

type Args = typeof args;
export type { Args };

export class ListEmails extends AbstractTool<Args> {
	name = "list-emails";
	description = "List emails from Gmail inbox with optional filtering";
	args = args;

	onError: OnErrorToolCallback<Args> = () => {
		return {
			content: [{ type: "text", text: "Error listing emails" }],
			isError: true,
		};
	};

	execute: ToolCallback<Args> = async (args) => {
		const response = await googleClient.get("/api/google-gmail/list-emails", {
			query: {
				email: args.email,
				maxResults: args.maxResults,
				q: args.q,
				labelIds: args.labelIds,
				includeSpamTrash: args.includeSpamTrash,
			},
		});
		const emailsData = response.data;

		if (emailsData && emailsData.length > 0) {
			const content = emailsData.map((email) => {
				const id = email.id || "Unknown ID";
				const from = email.from || "Unknown sender";
				const to = email.to || "Unknown recipient";
				const subject = email.subject || "No subject";
				const date = email.date || "Unknown date";
				const isUnread = email.isUnread ? "Yes" : "No";
				return {
					type: "text",
					text: `Email Id: ${id}\nFrom: ${from}\nTo: ${to}\nSubject: ${subject}\nDate: ${date}\nUnread: ${isUnread}\n---`,
				};
			}) as { type: "text"; text: string }[];

			return {
				content: [
					{
						type: "text",
						text: `Found ${emailsData.length} emails:`,
					},
					...content,
				],
			};
		} else {
			return {
				content: [{ type: "text", text: "No emails found" }],
			};
		}
	};
}
