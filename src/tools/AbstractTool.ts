import type {
	McpServer,
	ToolCallback,
} from "@modelcontextprotocol/sdk/server/mcp.d.ts";
import type { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type {
	CallToolResult,
	ServerNotification,
	ServerRequest,
} from "@modelcontextprotocol/sdk/types.js";
import type { ZodRawShape, ZodTypeAny, z } from "zod";

export type Parameters = {
	[key: string]: z.ZodSchema;
};

export type TextBlockParam = {
	type: "text";
	text: string;
};

export type ImageBlockParam = {
	type: "image";
	data: string;
	mimeType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
};

export type Content = TextBlockParam | ImageBlockParam;

export type ToolExecuteResult = {
	content: Content[];
};

export type OnErrorToolCallback<P extends ZodRawShape> = (
	error: Error,
	args: z.objectOutputType<P, ZodTypeAny>,
) => CallToolResult;

export abstract class AbstractTool<P extends ZodRawShape> {
	abstract name: string;
	abstract description: string;
	abstract args: P;

	abstract execute: ToolCallback<P>;

	abstract onError: OnErrorToolCallback<P>;

	serverRegister(server: McpServer) {
		server.tool(
			this.name,
			this.description,
			this.args,
			this.executeSafe as ToolCallback<P>,
		);
		return server;
	}

	executeSafe = async (
		args: z.objectOutputType<P, ZodTypeAny>,
		extra: RequestHandlerExtra<ServerRequest, ServerNotification>,
	) => {
		try {
			const result = await this.execute(args, extra);
			return result;
		} catch (error) {
			console.error(error);
			return this.onError(error as Error, args);
		}
	};
}
