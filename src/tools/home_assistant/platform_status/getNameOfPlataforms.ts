import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { homeAssistantPlusClient } from "../../../clients";
import { AbstractTool, type OnErrorToolCallback } from "../../AbstractTool";

const args = {} as const;

type Args = typeof args;

export class GetNameOfPlataformsTool extends AbstractTool<Args> {
	name = "get-names-of-plataforms";
	description = "Get the names of all platforms to get the status of";
	args = args;

	execute: ToolCallback<Args> = async () => {
		const responseData = await homeAssistantPlusClient.get("/api/status/");
		const names = responseData.data;
		const text = `The of the platforms is: ${names.join(",")}`;
		return {
			content: [
				{
					type: "text",
					text,
				},
			],
		};
	};

	onError: OnErrorToolCallback<Args> = () => {
		return {
			content: [
				{
					type: "text",
					text: "An error occurred while getting the ID of the platform",
				},
			],
		};
	};
}
