import { type MethodType, OpenApiAxios } from "@web-bee-ru/openapi-axios";

import Axios from "axios";
import { getEnv } from "../utils/getEnv";
import type { paths as DiscordPaths } from "./discord/types";
import type { paths as HomeAssistantPlusPaths } from "./home-assistant-plus/types";

type MediaType = `${string}/${string}`;
/**
 * @description Type definition for the OpenAPI schema
 */
export type SchemaType = {
	[route in keyof object]: {
		[method in MethodType]?: {
			parameters: {
				query?: object;
				path?: object;
			};
			requestBody?: {
				content: {
					[content in MediaType]: unknown;
				};
			};
			responses?: {
				[code in number]: {
					content: {
						[content in MediaType]: unknown;
					};
				};
			};
		};
	};
};

export function createClient<T extends SchemaType>(
	baseURL: string,
	token: string,
) {
	const axios = Axios.create({
		baseURL,
		adapter: "fetch",
		headers: {
			"Content-Type": "application/json",
			Authorization: `${token}`,
		},
	});

	return new OpenApiAxios<T, "fetch">(axios, {
		validStatus: "fetch",
	});
}

export const discordClient = createClient<DiscordPaths>(
	getEnv("DISCORD_SERVICE_ENDPOINT"),
	getEnv("DISCORD_SERVICE_TOKEN"),
);

export const homeAssistantPlusClient = createClient<HomeAssistantPlusPaths>(
	getEnv("HOME_ASSISTANT_PLUS_SERVICE_ENDPOINT"),
	getEnv("HOME_ASSISTANT_PLUS_SERVICE_TOKEN"),
);
