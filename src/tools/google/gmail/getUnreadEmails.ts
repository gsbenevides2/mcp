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
		.describe("Maximum number of unread emails to return (default: 10)"),
} as const;

type Args = typeof args;
export type { Args };

export class GetUnreadEmails extends AbstractTool<Args> {
	name = "get-unread-emails";
	description = "Get unread emails from Gmail inbox";
	args = args;

	onError: OnErrorToolCallback<Args> = () => {
		return {
			content: [{ type: "text", text: "Error getting unread emails" }],
			isError: true,
		};
	};

	execute: ToolCallback<Args> = async (args) => {
		const emails = await googleClient.get(
			"/api/google-gmail/get-unread-emails",
			{
				query: {
					email: args.email,
					maxResults: args.maxResults,
				},
			},
		);
		const emailsData = emails.data;
		if (emailsData && emailsData.length > 0) {
			const content = emailsData.map((email) => {
				// Try to extract from, subject, date, isUnread from headers if not present at top-level
				const from = email.from;
				const subject = email.subject;
				const date = email.date;
				const isUnread = email.isUnread;

				return {
					type: "text",
					text: `ID: ${email.id}\nFrom: ${from || "Unknown sender"}\nSubject: ${subject || "No subject"}\nDate: ${date || "Unknown date"}\nUnread: ${isUnread ? "Yes" : "No"}\n---`,
				};
			}) as { type: "text"; text: string }[];

			return {
				content: [
					{
						type: "text",
						text: `Found ${emailsData.length} unread emails:`,
					},
					...content,
				],
			};
		} else {
			return {
				content: [{ type: "text", text: "No unread emails found" }],
			};
		}
	};
}
