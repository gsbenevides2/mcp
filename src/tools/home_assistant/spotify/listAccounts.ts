import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { homeAssistantPlusClient } from "../../../clients";
import { AbstractTool, type OnErrorToolCallback } from "../../AbstractTool";

const args = {} as const;

type Args = typeof args;

export class ListAccounts extends AbstractTool<Args> {
	name = "list-accounts";
	description = "List all Spotify accounts";
	args = args;

	execute: ToolCallback<Args> = async () => {
		const response = await homeAssistantPlusClient.get("/api/spotify/accounts");

		return {
			content: [{ type: "text", text: response.data.accounts.join(", ") }],
		};
	};

	onError: OnErrorToolCallback<Args> = () => {
		return {
			content: [
				{ type: "text", text: "An error occurred while listing accounts" },
			],
		};
	};
}
