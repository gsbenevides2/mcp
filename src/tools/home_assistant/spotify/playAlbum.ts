import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { homeAssistantPlusClient } from "../../../clients";
import { AbstractTool, type OnErrorToolCallback } from "../../AbstractTool";

const args = {
	account: z
		.string()
		.describe(
			"The account to play the album on, must be one of the accounts listed by the list-accounts tool",
		),
	uri: z.string().describe("The uri of the album to play"),
};

type Args = typeof args;

export class PlayAlbum extends AbstractTool<Args> {
	name = "play-album";
	description = "Play an album on Spotify";
	args = args;

	execute: ToolCallback<Args> = async (args) => {
		await homeAssistantPlusClient.post(
			"/api/spotify/play-album/{account}",
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
			content: [{ type: "text", text: "Album played" }],
		};
	};

	onError: OnErrorToolCallback<Args> = () => {
		return {
			content: [
				{ type: "text", text: "An error occurred while playing the album" },
			],
		};
	};
}
