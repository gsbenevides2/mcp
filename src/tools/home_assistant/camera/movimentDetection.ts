import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { homeAssistantPlusClient } from "../../../clients";
import { AbstractTool, type OnErrorToolCallback } from "../../AbstractTool";

const args = {
	area: z
		.enum(["frente"])
		.describe("The area of the camera to check for movement detection"),
};

type Args = typeof args;

export class MovimentDetectionTool extends AbstractTool<Args> {
	name = "moviment-detection";
	description = "Check if there is movement in the area of the camera";
	args = args;

	execute: ToolCallback<Args> = async (args) => {
		const camera = await homeAssistantPlusClient.get(
			"/api/camera/motion/{area}",
			{
				params: {
					area: args.area,
				},
			},
		);
		if (camera.status === 400) {
			return {
				content: [{ type: "text", text: "Camera not found" }],
			};
		}
		const isMovement = camera.data.motionDetected;
		return {
			content: [
				{
					type: "text",
					text: isMovement
						? "There is movement in the area"
						: "There is no movement in the area",
				},
			],
		};
	};

	onError: OnErrorToolCallback<Args> = () => {
		return {
			content: [
				{
					type: "text",
					text: "An error occurred while checking movement detection",
				},
			],
		};
	};
}
