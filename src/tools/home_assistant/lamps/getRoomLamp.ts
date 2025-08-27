import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { homeAssistantPlusClient } from "../../../clients/index.js";
import { AbstractTool, type OnErrorToolCallback } from "../../AbstractTool";

const args = {
	roomName: z
		.string()
		.describe(
			"The name of the room where the smart light is installed (e.g., 'bedroom', 'living_room') use the list-rooms tool to get the list of rooms",
		),
} as const;

type Args = typeof args;

export class GetRoomLampTool extends AbstractTool<Args> {
	name = "get-room-light-status";
	description =
		"Retrieves the current on/off status and brightness of a specific room's smart light";
	args = args;

	execute: ToolCallback<Args> = async (args) => {
		const roomName = args.roomName;
		const lightState = await homeAssistantPlusClient.get(
			`/api/lights/status/{lightName}`,
			{
				params: {
					lightName: roomName,
				},
			},
		);

		if (lightState.status === 400) {
			return {
				content: [{ type: "text", text: "Light not found" }],
			};
		}
		const { state, brightness } = lightState.data;
		return {
			content: [
				{
					type: "text",
					text: `The light in the ${roomName} is currently ${state} and her brightness is ${brightness ?? "not available"}`,
				},
			],
		};
	};

	onError: OnErrorToolCallback<Args> = (_error, args) => {
		return {
			content: [
				{
					type: "text",
					text: `An error occurred while getting the light status for ${args.roomName}.`,
				},
			],
		};
	};
}
