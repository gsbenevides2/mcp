import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { randomUUIDv7 } from "bun";
import { Elysia } from "elysia";
import { mcp } from "elysia-mcp";
import { AuthService, UnauthorizedError } from "./services/AuthService";
import { registerTools } from "./tools";

const api = new Elysia().use(
	mcp({
		serverInfo: {
			name: "home-assistant-model-context-protocol-server",
			version: "0.0.1",
		},
		capabilities: {
			tools: {},
			resources: {},
			prompts: {},
			logging: {},
		},
		basePath: "/mcp",
		authentication: async (context) => {
			const headers = context.request.headers;
			const authorization = headers.get("authorization");
			if (!authorization) {
				throw new UnauthorizedError();
			}
			const token = authorization.split(" ")[1];
			if (!AuthService.verify(token)) {
				throw new UnauthorizedError();
			}
			const sessionId = headers.get("mcp-session-id");

			if (!sessionId) {
				return {
					authInfo: {
						sessionId: randomUUIDv7(),
					},
				};
			}
			return {
				authInfo: {
					sessionId,
				},
			};
		},
		setupServer: async (server: McpServer) => {
			registerTools(server);
		},
	}),
);

export default api;
