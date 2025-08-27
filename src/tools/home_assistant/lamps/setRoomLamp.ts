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
	status: z
		.enum(["on", "off"])
		.describe("The desired status of the room's smart light (on/off)"),
} as const;

type Args = typeof args;

export class SetRoomLampTool extends AbstractTool<Args> {
	name = "set-room-light-status";
	description = "Set the status of the room's smart light";
	args = args;

	execute: ToolCallback<Args> = async (args) => {
		const roomName = args.roomName;
		const status = args.status;
		await homeAssistantPlusClient.post(
			"/api/lights/control/{lightName}/{state}",
			undefined,
			{
				params: {
					lightName: roomName,
					state: status,
				},
			},
		);

		return {
			content: [
				{
					type: "text",
					text: `The light in the ${roomName} is turned ${status}`,
				},
			],
		};
	};

	onError: OnErrorToolCallback<Args> = (_error, args) => {
		return {
			content: [
				{
					type: "text",
					text: `An error occurred while setting the light status for ${args.roomName}.`,
				},
			],
		};
	};
}
