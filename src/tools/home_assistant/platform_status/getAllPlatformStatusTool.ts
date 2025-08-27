import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { homeAssistantPlusClient } from "../../../clients";
import { AbstractTool, type OnErrorToolCallback } from "../../AbstractTool";

const args = {} as const;

type Args = typeof args;

export class GetAllPlatformStatusTool extends AbstractTool<Args> {
	name = "get-all-platform-status";
	description = "Get the status of all platforms";
	args = args;

	execute: ToolCallback<Args> = async () => {
		const responseData = await homeAssistantPlusClient.get("/api/status/all");
		const status = responseData.data;
		const content: { type: "text"; text: string }[] = status.map((status) => ({
			type: "text",
			text: `The status of the platform ${status.name} is: ${status.hasProblem} Problem: ${status.problem_description}`,
		}));

		return {
			content: content,
		};
	};

	onError: OnErrorToolCallback<Args> = () => {
		return {
			content: [
				{
					type: "text",
					text: "An error occurred while getting the platform status",
				},
			],
		};
	};
}
