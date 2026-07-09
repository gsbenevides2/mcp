import { type MethodType, OpenApiAxios } from "@web-bee-ru/openapi-axios";

import Axios, { AxiosHeaders } from "axios";

import { getEnv } from "../utils/getEnv";
import { getAuthentikAccessToken } from "./authentik";
import type { paths as DiscordPaths } from "./discord/types";
import type { paths as GooglePaths } from "./google/types";
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
	getAuthorization: () => Promise<string>,
) {
	const axios = Axios.create({
		baseURL,
		adapter: "fetch",
		headers: {
			"Content-Type": "application/json",
		},
	});

	axios.interceptors.request.use(async (config) => {
		const authorization = await getAuthorization();
		if (config.headers instanceof AxiosHeaders) {
			config.headers.set("Authorization", authorization);
		} else {
			config.headers = {
				...config.headers,
				Authorization: authorization,
			};
		}
		return config;
	});

	return new OpenApiAxios<T, "fetch">(axios, {
		validStatus: "fetch",
	});
}

const discordServiceEndpoint = getEnv("DISCORD_SERVICE_ENDPOINT");
const discordServiceToken = getEnv("DISCORD_SERVICE_TOKEN");

const homeAssistantPlusServiceEndpoint = getEnv(
	"HOME_ASSISTANT_PLUS_SERVICE_ENDPOINT",
);
const homeAssistantPlusClientId = getEnv("HOME_ASSISTANT_PLUS_CLIENT_ID");

const googleServiceEndpoint = getEnv("GOOGLE_SERVICE_ENDPOINT");
const googleServiceClientId = getEnv("GOOGLE_SERVICE_CLIENT_ID");

export const discordClient = createClient<DiscordPaths>(
	discordServiceEndpoint,
	async () => discordServiceToken,
);

export const homeAssistantPlusClient = createClient<HomeAssistantPlusPaths>(
	homeAssistantPlusServiceEndpoint,
	async () => {
		const token = await getAuthentikAccessToken(homeAssistantPlusClientId);
		return `Bearer ${token}`;
	},
);

export const googleClient = createClient<GooglePaths>(
	googleServiceEndpoint,
	async () => {
		const token = await getAuthentikAccessToken(googleServiceClientId);
		return `Bearer ${token}`;
	},
);
