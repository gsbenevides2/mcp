import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { googleClient } from "../../../clients";
import { AbstractTool, type OnErrorToolCallback } from "../../AbstractTool";

const args = {
	email: z.string().email().describe("The email address of the account"),
} as const;

type Args = typeof args;
export type { Args };

export class GetLabels extends AbstractTool<Args> {
	name = "get-gmail-labels";
	description = "Get all available labels in Gmail";
	args = args;

	onError: OnErrorToolCallback<Args> = () => {
		return {
			content: [{ type: "text", text: "Error getting Gmail labels" }],
			isError: true,
		};
	};

	execute: ToolCallback<Args> = async (args) => {
		const labels = await googleClient.get("/api/google-gmail/get-labels", {
			query: args,
		});
		const labelsData = labels.data;
		if (labelsData && labelsData.length > 0) {
			const content = labelsData.map((label) => ({
				type: "text",
				text: `ID: ${label.id}\nName: ${label.name}\nType: ${label.type}\nVisible: ${label.labelListVisibility || "unknown"}\n---`,
			})) as { type: "text"; text: string }[];

			return {
				content: [
					{
						type: "text",
						text: `Found ${labelsData.length} labels:`,
					},
					...content,
				],
			};
		} else {
			return {
				content: [{ type: "text", text: "No labels found" }],
			};
		}
	};
}
