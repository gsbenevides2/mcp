import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { homeAssistantPlusClient } from "../../../clients";
import { wait } from "../../../utils/wait";
import { AbstractTool, type OnErrorToolCallback } from "../../AbstractTool";
import { GetSpotifyData } from "./getData";

const operations = ["play", "pause", "next", "previous", "setVolume"] as const;
const operationsResult = {
	play: "Spotify has been played",
	pause: "Spotify has been paused",
	next: "Spotify has been skipped to the next song",
	previous: "Spotify has been skipped to the previous song",
	setVolume: "Spotify has been set to the volume",
} as const;

const args = {
	account: z
		.string()
		.describe(
			"The account to make operation on, must be one of the accounts listed by the list-accounts tool",
		),
	operation: z.enum(operations).describe("The operation to make on Spotify"),
	volume: z
		.number()
		.min(0)
		.max(1)
		.describe("The volume to set on Spotify (0-100)")
		.optional(),
} as const;

type Args = typeof args;

export class MakeSpotifyOperation extends AbstractTool<Args> {
	name = "make-spotify-operation";
	description = "Make an operation on Spotify";
	args = args;

	execute: ToolCallback<Args> = async (args, extra) => {
		const account = args.account as "Guilherme";
		if (args.operation === "play") {
			await homeAssistantPlusClient.post(
				"/api/spotify/play/{account}",
				undefined,
				{
					params: {
						account,
					},
				},
			);
		} else if (args.operation === "pause") {
			await homeAssistantPlusClient.post(
				"/api/spotify/pause/{account}",
				undefined,
				{
					params: {
						account,
					},
				},
			);
		} else if (args.operation === "next") {
			await homeAssistantPlusClient.post(
				"/api/spotify/next/{account}",
				undefined,
				{
					params: {
						account,
					},
				},
			);
		} else if (args.operation === "previous") {
			await homeAssistantPlusClient.post(
				"/api/spotify/previous/{account}",
				undefined,
				{
					params: {
						account,
					},
				},
			);
		} else if (args.operation === "setVolume") {
			await homeAssistantPlusClient.post(
				"/api/spotify/volume/{account}/{volume}",
				undefined,
				{
					params: {
						account,
						volume: args.volume ?? 0,
					},
				},
			);
		}
		await wait(1000);
		const getSpotifyData = new GetSpotifyData();
		const response = await getSpotifyData.execute(
			{
				account,
			},
			extra,
		);
		return {
			content: [
				{
					type: "text",
					text: `${operationsResult[args.operation]}`,
				},
				...response.content,
			],
		};
	};

	onError: OnErrorToolCallback<Args> = () => {
		return {
			content: [
				{
					type: "text",
					text: "An error occurred while making the Spotify operation",
				},
			],
		};
	};
}
