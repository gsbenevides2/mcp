import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { $ } from "bun";
import { getEnv } from "../utils/getEnv";

const clientsList = [
	{
		name: "home-assistant-plus",
		endpoint: getEnv("HOME_ASSISTANT_PLUS_SERVICE_ENDPOINT"),
	},
	{
		name: "discord",
		endpoint: getEnv("DISCORD_SERVICE_ENDPOINT"),
	},
];
const packageDir = resolve(import.meta.dirname, "..", "..");

for (const client of clientsList) {
	const clientDir = resolve(packageDir, "src", "clients", client.name);
	const clientTypesFile = resolve(clientDir, "types.d.ts");
	const clientUrl = new URL("/swagger/json", client.endpoint);

	await mkdir(clientDir, { recursive: true });

	await $`openapi-typescript ${clientUrl.toString()} -o ${clientTypesFile}`;
}
