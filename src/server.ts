import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import cors from "cors";
import express from "express";
import { coolifyHealthChecker } from "./plugins/coolify-healtcheker";
import { logger } from "./plugins/logger";
import { AuthService } from "./services/AuthService";
import { registerTools } from "./tools";
import { getEnv } from "./utils/getEnv";

const app = logger(express());
const ICON_PATH = join(process.cwd(), "assets/icons");
const PUBLIC_ICON_PATHS = new Set([
	"/health",
	"/favicon.ico",
	"/favicon.svg",
	"/favicon-32x32.png",
	"/favicon-16x16.png",
	"/apple-touch-icon.png",
	"/android-chrome-192x192.png",
	"/android-chrome-512x512.png",
	"/safari-pinned-tab.svg",
	"/site.webmanifest",
]);

app.get("/favicon.ico", (_req, res) => {
	res.sendFile(join(ICON_PATH, "favicon.ico"));
});

app.get("/favicon.svg", (_req, res) => {
	res.type("image/svg+xml");
	res.sendFile(join(ICON_PATH, "favicon.svg"));
});

app.get("/favicon-32x32.png", (_req, res) => {
	res.sendFile(join(ICON_PATH, "favicon-32x32.png"));
});

app.get("/favicon-16x16.png", (_req, res) => {
	res.sendFile(join(ICON_PATH, "favicon-16x16.png"));
});

app.get("/apple-touch-icon.png", (_req, res) => {
	res.sendFile(join(ICON_PATH, "apple-touch-icon.png"));
});

app.get("/android-chrome-192x192.png", (_req, res) => {
	res.sendFile(join(ICON_PATH, "android-chrome-192x192.png"));
});

app.get("/android-chrome-512x512.png", (_req, res) => {
	res.sendFile(join(ICON_PATH, "android-chrome-512x512.png"));
});

app.get("/safari-pinned-tab.svg", (_req, res) => {
	res.type("image/svg+xml");
	res.sendFile(join(ICON_PATH, "safari-pinned-tab.svg"));
});

app.get("/site.webmanifest", (_req, res) => {
	res.type("application/manifest+json");
	res.sendFile(join(ICON_PATH, "site.webmanifest"));
});

app.use((req, res, next) => {
	if (PUBLIC_ICON_PATHS.has(req.path)) {
		next();
		return;
	}
	const authHeader = req.headers["authorization"];
	const token = authHeader?.split(" ")[1];
	if (!AuthService.verify(token)) {
		res.status(401).send("Unauthorized");
		return;
	}
	next();
});
app.use(coolifyHealthChecker);

app.use(express.json());
app.use(
	cors({
		origin: "*", // Configure appropriately for production, for example:
		// origin: ['https://your-remote-domain.com', 'https://your-other-remote-domain.com'],
		exposedHeaders: ["Mcp-Session-Id"],
		allowedHeaders: ["Content-Type", "mcp-session-id"],
	}),
);

const mcpServer = new McpServer({
	name: "mcp-server",
	version: "1.0.0",
	title: "MCP Server",
});

registerTools(mcpServer);

// Map to store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// Handle POST requests for client-to-server communication
app.post("/mcp", async (req, res) => {
	// Check for existing session ID
	const sessionId = req.headers["mcp-session-id"] as string | undefined;

	if (sessionId && transports[sessionId]) {
		// Reuse existing transport
		const transport = transports[sessionId];
		await transport.handleRequest(req, res, req.body);
	} else if (!sessionId && isInitializeRequest(req.body)) {
		// New initialization request
		const transport = new StreamableHTTPServerTransport({
			sessionIdGenerator: () => randomUUID(),
			onsessioninitialized: (sessionId) => {
				// Store the transport by session ID
				transports[sessionId] = transport;
			},
			// DNS rebinding protection is disabled by default for backwards compatibility. If you are running this server
			// locally, make sure to set:
			// enableDnsRebindingProtection: true,
			// allowedHosts: ['127.0.0.1'],
		});

		// Clean up transport when closed
		transport.onclose = () => {
			if (transport.sessionId) {
				delete transports[transport.sessionId];
			}
		};
		await mcpServer.connect(transport);
		await transport.handleRequest(req, res, req.body);
	} else {
		// Invalid request
		res.status(400).json({
			jsonrpc: "2.0",
			error: {
				code: -32000,
				message: "Bad Request: No valid session ID provided",
			},
			id: null,
		});
		return;
	}

	// // Handle the request
});

// Reusable handler for GET and DELETE requests
const handleSessionRequest = async (
	req: express.Request,
	res: express.Response,
) => {
	const sessionId = req.headers["mcp-session-id"] as string | undefined;
	if (!sessionId || !transports[sessionId]) {
		res.status(400).send("Invalid or missing session ID");
		return;
	}

	const transport = transports[sessionId];
	await transport.handleRequest(req, res);
};

// Handle GET requests for server-to-client notifications via SSE
app.get("/mcp", handleSessionRequest);

// Handle DELETE requests for session termination
app.delete("/mcp", handleSessionRequest);

const PORT = getEnv("PORT", false, "3000");

app.listen(parseInt(PORT), () => {
	console.log(`Server is running on port ${PORT}`);
});
