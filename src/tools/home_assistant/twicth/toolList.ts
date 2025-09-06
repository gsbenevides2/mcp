import { GetStreamerStatusTool } from "./getStatus";
import { GetStreamerIdsTool } from "./getStreamerIds";

export const homeAssistantTwicthToolsList = [
	new GetStreamerIdsTool(),
	new GetStreamerStatusTool(),
];
