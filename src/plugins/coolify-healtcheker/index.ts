import express from "express";

export const coolifyHealthChecker = express.Router();

coolifyHealthChecker.get("/health", (_, res) => {
	res.status(200).send("OK");
});
