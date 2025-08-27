import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { homeAssistantPlusClient } from "../../../clients";
import { AbstractTool, type OnErrorToolCallback } from "../../AbstractTool";

const args = {
	action: z
		.enum(["enable", "disable"])
		.describe("Action to perform on guest WiFi - enable or disable"),
} as const;

type Args = typeof args;

export class ToggleGuestWifiTool extends AbstractTool<Args> {
	name = "toggle-guest-wifi";
	description = "Enables or disables the guest WiFi on the TP-Link router";
	args = args;

	execute: ToolCallback<Args> = async (args) => {
		if (args.action === "enable") {
			await homeAssistantPlusClient.post(
				"/api/router/enable-guest-wifi",
				undefined,
			);
		} else {
			await homeAssistantPlusClient.post(
				"/api/router/disable-guest-wifi",
				undefined,
			);
		}

		return {
			content: [
				{
					type: "text",
					text: `Guest WiFi has been ${args.action}d successfully.`,
				},
			],
		};
	};

	onError: OnErrorToolCallback<Args> = (_error, args) => {
		return {
			content: [
				{
					type: "text",
					text: `An error occurred while trying to ${args.action} guest WiFi.`,
				},
			],
		};
	};
}
