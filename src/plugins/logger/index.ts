import { randomUUID } from "node:crypto";
import type express from "express";
import {
	duration,
	formatArrow,
	formatDate,
	formatMethod,
	formatStatus,
	showInfo,
} from "./formatters";

// Extend Express Request interface to include custom properties
declare global {
	namespace Express {
		interface Request {
			context: {
				operationId: string;
				time: bigint;
			};
			error?: unknown;
		}
	}
}

function checkIfToResponse(
	// biome-ignore lint/suspicious/noExplicitAny: I don't know what type this is
	error: any,
): error is { toResponse: () => Response } {
	try {
		error.toResponse();
	} catch (_) {
		return false;
	}
	return true;
}

export function logger(app: ReturnType<typeof express>) {
	app.use((req, res, next) => {
		const operationId = randomUUID();
		const time = process.hrtime.bigint();
		const method = req.method;
		const path = req.path;

		const ip = req.ip;
		const port = req.socket.localPort;
		const userAgent = req.headers["user-agent"];

		req.context = {
			operationId,
			time,
		};
		res.setHeader("x-operation-id", operationId);

		console.log(`${formatArrow("in")} ${formatMethod(method)} ${path}`);
		console.log(showInfo("Received At:", formatDate(new Date())));
		console.log(showInfo("Operation ID:", operationId));
		console.log(showInfo("IP/Port:", `${ip}:${port}`));
		console.log(showInfo("UA:", userAgent || "No UserAgent"));

		next();
	});

	app.use(async (req, res, next) => {
		res.on("finish", async () => {
			const method = req.method;
			const path = req.path;
			const { operationId, time } = req.context;
			const timeDiff = Number(process.hrtime.bigint() - time) / 1000000;
			const status = res.statusCode;

			console.log(
				`${formatArrow("out")} ${formatMethod(method)} ${path} | ${formatStatus(status)}`,
			);
			console.log(showInfo("Operation ID:", operationId));
			console.log(showInfo("Time:", duration(timeDiff)));
			console.log(showInfo("Sent At:", formatDate(new Date())));

			if (status && (status < 200 || status >= 300)) {
				console.log(showInfo("Body:", JSON.stringify(req.body)));

				// Log error information if available
				if (req.error) {
					if (checkIfToResponse(req.error)) {
						const response = req.error.toResponse() as Response;
						const body = await response.text();
						console.log(showInfo("Response:", JSON.stringify(body)));
					} else if (typeof req.error === "object" && "code" in req.error) {
						console.log(
							showInfo("Error Code:", JSON.stringify(req.error.code)),
						);
					} else if (typeof req.error === "string") {
						console.log(showInfo("Error:", req.error));
					} else {
						console.log(showInfo("Error:", JSON.stringify(req.error)));
					}
				}
			}
			if (status === 401) {
				const authorizationHeader = req.headers["authorization"];
				console.log(
					showInfo("Authorization:", authorizationHeader || "No Authorization"),
				);
			}
		});

		next();
	});

	return app;
}
