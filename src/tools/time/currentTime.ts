import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AbstractTool, type OnErrorToolCallback } from "../AbstractTool";

type Args = typeof args;

const args = {
	timezone: z
		.string()
		.describe("The timezone to get the current time in")
		.default("America/Sao_Paulo")
		.optional(),
};

export class CurrentTime extends AbstractTool<Args> {
	name = "current-time";
	description = "Get the current time";
	args = args;

	execute: ToolCallback<Args> = async (args) => {
		const timezone = args.timezone || "America/Sao_Paulo";
		const now = new Date();

		// Get date/time parts in the requested timezone
		const options: Intl.DateTimeFormatOptions = {
			timeZone: timezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			weekday: "long",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false,
		};
		const formatter = new Intl.DateTimeFormat("en-US", options);
		const parts = formatter.formatToParts(now);

		// Helper to extract part by type
		const getPart = (type: string) => parts.find((p) => p.type === type)?.value;

		const year = getPart("year");
		const month = getPart("month");
		const day = getPart("day");
		const weekday = getPart("weekday");
		const hour = getPart("hour");
		const minute = getPart("minute");
		const second = getPart("second");

		return {
			content: [
				{ type: "text", text: `Year: ${year}` },
				{ type: "text", text: `Month: ${month}` },
				{ type: "text", text: `Day: ${day}` },
				{ type: "text", text: `Weekday: ${weekday}` },
				{ type: "text", text: `Timezone: ${timezone}` },
				{ type: "text", text: `Hour: ${hour}` },
				{ type: "text", text: `Minute: ${minute}` },
				{ type: "text", text: `Second: ${second}` },
			],
		};
	};

	onError: OnErrorToolCallback<Args> = () => {
		return {
			content: [{ type: "text", text: "Error getting current time" }],
			isError: true,
		};
	};
}
