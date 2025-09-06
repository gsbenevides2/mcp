import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { googleClient } from "../../../clients";
import { AbstractTool, type OnErrorToolCallback } from "../../AbstractTool";

const args = {
	email: z.string().email().describe("The email address of the account"),
	query: z
		.string()
		.describe(
			'Gmail search query (e.g., "from:example@email.com", "subject:important", "has:attachment")',
		),
	maxResults: z
		.number()
		.optional()
		.default(10)
		.describe("Maximum number of emails to return (default: 10)"),
} as const;

type Args = typeof args;
export type { Args };

export class SearchEmails extends AbstractTool<Args> {
	name = "search-emails";
	description = "Search emails in Gmail using Gmail search syntax";
	args = args;

	onError: OnErrorToolCallback<Args> = () => {
		return {
			content: [{ type: "text", text: "Error searching emails" }],
			isError: true,
		};
	};

	execute: ToolCallback<Args> = async (args) => {
		const response = await googleClient.get("/api/google-gmail/search-emails", {
			query: {
				email: args.email,
				query: args.query,
				maxResults: args.maxResults,
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
						text: `Found ${emailsData.length} emails matching "${args.query}":`,
					},
					...content,
				],
			};
		} else {
			return {
				content: [
					{ type: "text", text: `No emails found matching "${args.query}"` },
				],
			};
		}
	};
}
