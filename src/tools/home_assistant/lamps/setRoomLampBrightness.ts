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
	brightness: z
		.number()
		.describe("The desired percentage of  brightness of the lamp (0-100)")
		.min(0)
		.max(100),
} as const;

type Args = typeof args;

export class SetRoomLampBrightnessTool extends AbstractTool<Args> {
	name = "set-room-light-brightness";
	description = "Set the brightness of a specific room's smart light";
	args = args;

	execute: ToolCallback<Args> = async (args) => {
		const { roomName, brightness } = args;
		await homeAssistantPlusClient.post(
			"/api/lights/brightness/{lightName}/{brightness}",
			undefined,
			{
				params: {
					lightName: roomName,
					brightness,
				},
			},
		);
		return {
			content: [
				{
					type: "text",
					text: `The light in the ${args.roomName} has ${args.brightness}% brightness`,
				},
			],
		};
	};

	onError: OnErrorToolCallback<Args> = (_error, args) => {
		return {
			content: [
				{
					type: "text",
					text: `An error occurred while setting the light brightness for ${args.roomName}.`,
				},
			],
		};
	};
}
