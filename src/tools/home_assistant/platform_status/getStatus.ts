import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { homeAssistantPlusClient } from "../../../clients";
import { AbstractTool, type OnErrorToolCallback } from "../../AbstractTool";

const args = {
	plataform_name: z
		.string()
		.describe(
			"The name of the platform to get the status of, you can get the names with the get-names-of-plataforms tool",
		),
} as const;

type Args = typeof args;

export class GetPlatformStatusTool extends AbstractTool<Args> {
	name = "get-platform-status";
	description = "Get the status of a platform";
	args = args;

	execute: ToolCallback<Args> = async (args) => {
		const responseData = await homeAssistantPlusClient.get(
			"/api/status/{name}",
			{
				params: {
					name: args.plataform_name,
				},
			},
		);
		if (responseData.status === 404) {
			return {
				content: [
					{
						type: "text",
						text: `The platform ${args.plataform_name} was not found`,
					},
				],
			};
		}
		const status = responseData.data;

		const content: { type: "text"; text: string }[] = [
			{
				type: "text",
				text: `The status of the platform ${args.plataform_name} is ${status.hasProblem ? "down" : "up"}`,
			},
		];

		if (status.problem_description) {
			content.push({
				type: "text",
				text: `The problem description of the platform ${args.plataform_name} is ${status.problem_description}`,
			});
		}

		if (status.status_url) {
			content.push({
				type: "text",
				text: `The status page url of the platform ${args.plataform_name} is ${status.status_url}`,
			});
		}

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
