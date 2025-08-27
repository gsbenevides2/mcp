import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KnowledgeGraphManager } from "../../clients/memory/graphManager";
import { AbstractTool, type OnErrorToolCallback } from "../AbstractTool";

const knowledgeGraphManager = new KnowledgeGraphManager();

const args = {
	deletions: z.array(
		z.object({
			entityName: z
				.string()
				.describe("The name of the entity containing the observations"),
			observations: z
				.array(z.string())
				.describe("An array of observations to delete"),
		}),
	),
} as const;

type Args = typeof args;

export class DeleteObservationsTool extends AbstractTool<Args> {
	name = "delete_observations";
	description =
		"Delete specific observations from entities in the knowledge graph";
	args = args;

	execute: ToolCallback<Args> = async (args) => {
		await knowledgeGraphManager.deleteObservations(args.deletions);
		return {
			content: [
				{
					type: "text",
					text: "Observations deleted successfully",
				},
			],
		};
	};

	onError: OnErrorToolCallback<Args> = (error) => {
		return {
			content: [
				{
					type: "text",
					text: `Error deleting observations: ${error.message}`,
				},
			],
		};
	};
}
