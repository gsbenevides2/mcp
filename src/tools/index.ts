import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SendDiscordMessageTool } from "./discord/sendMessage";
import { googleToolsList } from "./google/toolList";
import { homeAssistantToolsList } from "./home_assistant/toolsList";
import { MarkdownfyWebpage } from "./markdownfy/webpage";
import { memoryToolsList } from "./memory/toolList";

export const toolList = [
	new SendDiscordMessageTool(),
	...googleToolsList,
	...homeAssistantToolsList,
	new MarkdownfyWebpage(),
	...memoryToolsList,
];

export function registerTools(server: McpServer) {
	toolList.forEach((tool) => {
		tool.serverRegister(server);
	});
}
