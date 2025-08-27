import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { homeAssistantPlusClient } from "../../../clients";
import { AbstractTool, type OnErrorToolCallback } from "../../AbstractTool";

const args = {
	lineCode: z
		.number()
		.min(1)
		.max(13)
		.describe(
			"The code of the metro line (e.g., 1 for Line 1 - Blue, 2 for Line 2 - Green)",
		),
} as const;

type Args = typeof args;

export class GetTrainStatus extends AbstractTool<Args> {
	name = "get-train-status";
	description =
		"Retrieves the current status and operational information for a specific metro/train line in São Paulo";
	args = args;
	execute: ToolCallback<Args> = async (args) => {
		const lineCode = args.lineCode;
		const trainStatusResponse = await homeAssistantPlusClient.get(
			`/api/train/{line}`,
			{
				params: {
					line: lineCode,
				},
			},
		);

		if (trainStatusResponse.status === 404) {
			return {
				content: [
					{
						type: "text",
						text: `A linha ${lineCode} não foi encontrada. Por favor, tente novamente com outra linha.`,
					},
				],
			};
		}
		const trainStatus = trainStatusResponse.data;

		return {
			content: [
				{
					type: "text",
					text: `O status da linha ${trainStatus.codigo} é ${trainStatus.status} - ${trainStatus.descricao ?? "OK"}`,
				},
			],
		};
	};

	onError: OnErrorToolCallback<Args> = (_error, args) => {
		const lineCode = args.lineCode;
		return {
			content: [
				{
					type: "text",
					text: `Ocorreu um erro ao obter o status da linha ${lineCode}. Por favor, tente novamente mais tarde.`,
				},
			],
		};
	};
}
