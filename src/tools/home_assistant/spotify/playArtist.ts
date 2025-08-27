import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { homeAssistantPlusClient } from "../../../clients";
import { AbstractTool, type OnErrorToolCallback } from "../../AbstractTool";

const args = {
	account: z
		.string()
		.describe(
			"The account to play the artist on, must be one of the accounts listed by the list-accounts tool",
		),
	uri: z.string().describe("The uri of the artist to play"),
};

type Args = typeof args;

export class PlayArtist extends AbstractTool<Args> {
	name = "play-artist";
	description = "Play songs from an artist on Spotify";
	args = args;

	execute: ToolCallback<Args> = async (args) => {
		await homeAssistantPlusClient.post(
			"/api/spotify/play-artist/{account}",
			{
				uri: args.uri,
			},
			{
				params: {
					account: args.account as "Guilherme",
				},
			},
		);
		return {
			content: [{ type: "text", text: "Artist played" }],
		};
	};

	onError: OnErrorToolCallback<Args> = () => {
		return {
			content: [
				{ type: "text", text: "An error occurred while playing the artist" },
			],
		};
	};
}
