import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { homeAssistantPlusClient } from "../../../clients";
import { AbstractTool, type OnErrorToolCallback } from "../../AbstractTool";

const args = {
	streamerId: z
		.string()
		.describe(
			"The ID of the streamer to get the status of in Twitch, you can get the IDs with the get-streamer-ids tool",
		),
} as const;

type Args = typeof args;

export class GetStreamerStatusTool extends AbstractTool<Args> {
	name = "get-streamer-status";
	description = "Get the status of a streamer";
	args = args;

	execute: ToolCallback<Args> = async (args) => {
		const response = await homeAssistantPlusClient.get(
			`/api/twitch/streamer/{streamerId}`,
			{
				params: {
					streamerId: args.streamerId,
				},
			},
		);

		if (response.status === 404) {
			return {
				content: [
					{
						type: "text",
						text: `O streamer ${args.streamerId} não foi encontrado. Por favor, tente novamente com outro streamer.`,
					},
				],
			};
		}

		const status = response.data;
		return {
			content: [
				{
					type: "text",
					text: `The streamer ${status.attributes.friendly_name} is ${status.status}`,
				},
				{
					type: "text",
					text: `You are following this streamer: ${status.attributes.following}`,
				},
				{
					type: "text",
					text: `You are subscribed to this streamer: ${status.attributes.subscribed}`,
				},
				{
					type: "text",
					text: `If you are subscribed to this streamer, you are subscribed to the ${status.attributes.subscription_tier} tier`,
				},
				{
					type: "text",
					text: `This streamer has ${status.attributes.followers} followers`,
				},
				{
					type: "text",
					text: `If this streamer is streaming, the game is ${status.attributes.game}`,
				},
				{
					type: "text",
					text: `If this streamer is streaming, the title is ${status.attributes.title}`,
				},
				{
					type: "text",
					text: `If this streamer is streaming, the started at is ${status.attributes.started_at}`,
				},
				{
					type: "text",
					text: `If this streamer is streaming, the viewers are ${status.attributes.viewers}`,
				},
				{
					type: "text",
					text: `You are following this streamer since ${status.attributes.following_since}`,
				},
			],
		};
	};

	onError: OnErrorToolCallback<Args> = () => {
		return {
			content: [
				{
					type: "text",
					text: "An error occurred while getting the streamer status",
				},
			],
		};
	};
}
