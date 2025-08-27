import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { homeAssistantPlusClient } from "../../../clients";
import { AbstractTool, type OnErrorToolCallback } from "../../AbstractTool";

const args = {};

type Args = typeof args;

export class ListRoomsTool extends AbstractTool<Args> {
	name = "list-rooms";
	description = "List all rooms with lamps in the home";
	args = args;
	execute: ToolCallback<Args> = async () => {
		const rooms = await homeAssistantPlusClient.get("/api/lights/available");
		const lights = rooms.data.lights;
		const text =
			lights.length > 0
				? `Rooms with lamps: ${lights.join(", ")}`
				: "No rooms with lamps";
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
			content: [{ type: "text", text: "Error listing rooms" }],
		};
	};
}
