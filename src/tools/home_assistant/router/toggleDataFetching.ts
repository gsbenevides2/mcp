import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { homeAssistantPlusClient } from "../../../clients";
import { AbstractTool, type OnErrorToolCallback } from "../../AbstractTool";

const args = {
	action: z
		.enum(["enable", "disable"])
		.describe("Action to perform on router data fetching - enable or disable"),
} as const;

type Args = typeof args;

export class ToggleDataFetchingTool extends AbstractTool<Args> {
	name = "toggle-router-data-fetching";
	description =
		"Enables or disables router data fetching on the TP-Link router";
	args = args;

	execute: ToolCallback<Args> = async (args) => {
		if (args.action === "enable") {
			await homeAssistantPlusClient.post(
				"/api/router/disable-data-fetching",
				undefined,
			);
		} else {
			await homeAssistantPlusClient.post(
				"/api/router/enable-data-fetching",
				undefined,
			);
		}

		return {
			content: [
				{
					type: "text",
					text: `Router data fetching has been ${args.action}d successfully.`,
				},
			],
		};
	};

	onError: OnErrorToolCallback<Args> = (_error, args) => {
		return {
			content: [
				{
					type: "text",
					text: `An error occurred while trying to ${args.action} router data fetching.`,
				},
			],
		};
	};
}
