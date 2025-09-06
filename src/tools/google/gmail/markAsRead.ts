import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { googleClient } from "../../../clients";
import { AbstractTool, type OnErrorToolCallback } from "../../AbstractTool";

const args = {
	email: z.string().email().describe("The email address of the account"),
	messageIds: z
		.array(z.string())
		.describe("Array of message IDs to mark as read"),
} as const;

export type Args = typeof args;

export class MarkAsRead extends AbstractTool<Args> {
	name = "mark-emails-as-read";
	description = "Mark one or more emails as read in Gmail";
	args = args;

	execute: ToolCallback<Args> = async (args) => {
		await googleClient.patch(
			"/api/google-gmail/mark-as-read",
			{
				messageIds: args.messageIds,
			},
			{
				query: {
					email: args.email,
				},
			},
		);
		return {
			content: [
				{
					type: "text",
					text: `Successfully marked ${args.messageIds.length} email(s) as read`,
				},
			],
		};
	};

	onError: OnErrorToolCallback<Args> = () => {
		return {
			content: [{ type: "text", text: "Error marking emails as read" }],
			isError: true,
		};
	};
}
