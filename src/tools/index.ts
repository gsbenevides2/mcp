import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SendDiscordMessageTool } from "./discord/sendMessage";
import { SendEmailTool } from "./email/sendEmail";
import { googleToolsList } from "./google/toolList";
import { homeAssistantToolsList } from "./home_assistant/toolsList";
import { MarkdownfyWebpage } from "./markdownfy/webpage";
import { memoryToolsList } from "./memory/toolList";
import { CurrentTime } from "./time/currentTime";

export const toolList = [
	new SendDiscordMessageTool(),
	new SendEmailTool(),
	...googleToolsList,
	...homeAssistantToolsList,
	new MarkdownfyWebpage(),
	...memoryToolsList,
	new CurrentTime(),
];

export function registerTools(server: McpServer) {
	toolList.forEach((tool) => {
		tool.serverRegister(server);
	});
}
