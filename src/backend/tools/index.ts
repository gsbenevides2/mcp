import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { MarkdownfyWebpage } from "./markdownfy/webpage";

export const toolList = [new MarkdownfyWebpage()];

export function registerTools(server: McpServer) {
	toolList.forEach((tool) => {
		tool.serverRegister(server);
	});
}
