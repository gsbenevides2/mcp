import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { homeAssistantPlusClient } from "../../../clients";
import { AbstractTool, type OnErrorToolCallback } from "../../AbstractTool";

const args = {
	account: z
		.string()
		.describe(
			"The account to get data from, must be one of the accounts listed by the list-accounts tool",
		),
} as const;

type Args = typeof args;

export class GetSpotifyData extends AbstractTool<Args> {
	name = "get-spotify-data";
	description =
		"Get the current player state, volume, shuffle, repeat, and source from a Spotify account";
	args = args;

	execute: ToolCallback<Args> = async (args) => {
		const response = await homeAssistantPlusClient.get(
			"/api/spotify/accounts/{account}",
			{
				params: {
					account: args.account as "Guilherme",
				},
			},
		);
		const data = response.data;

		const content: { type: "text"; text: string }[] = [
			{
				type: "text",
				text: `Spotify ${args.account} is has a ${data.state} state`,
			},
		];

		if (data.state === "playing" || data.state === "paused") {
			content.push(
				{
					type: "text",
					text:
						data.state === "playing"
							? `Spotify ${args.account} is playing ${data.musicTitle} by ${data.musicArtist}`
							: `Spotify ${args.account} is paused on ${data.musicTitle} by ${data.musicArtist}`,
				},
				{
					type: "text",
					text: `Spotify ${args.account} currently track has ${data.musicDuration} seconds of duration`,
				},
				{
					type: "text",
					text: `Spotify ${args.account} is ${data.musicShuffle ? "shuffling" : "not shuffling"}`,
				},
				{
					type: "text",
					text: `Spotify ${args.account} has volume ${data.musicVolume}`,
				},
				{
					type: "text",
					text: `Spotify ${args.account} is in ${data.musicRepeat} repeat mode`,
				},
				{
					type: "text",
					text: `Spotify ${args.account} is in ${data.deviceSource} source`,
				},
			);
		}

		return {
			content,
		};
	};

	onError: OnErrorToolCallback<Args> = () => {
		return {
			content: [
				{
					type: "text",
					text: "An error occurred while getting the Spotify data",
				},
			],
		};
	};
}
