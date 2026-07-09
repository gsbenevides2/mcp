import { Buffer } from "node:buffer";

import { decodeJwt } from "jose";

import { getEnv } from "../utils/getEnv";

const authentikUrl = getEnv("AUTHENTIK_URL");
const authentikUsername = getEnv("AUTHENTIK_USERNAME");
const authentikPassword = getEnv("AUTHENTIK_PASSWORD");

interface TokenCacheEntry {
	token: string;
	expiresAt?: number;
}

const tokenCache = new Map<string, TokenCacheEntry>();
const inflightRequests = new Map<string, Promise<string>>();
const TOKEN_EXPIRATION_BUFFER_SECONDS = 60;

function getExpirationFromToken(token: string) {
	try {
		const decoded = decodeJwt(token);
		if (!decoded || typeof decoded.exp !== "number") {
			return undefined;
		}
		return decoded.exp * 1000;
	} catch {
		return undefined;
	}
}

function isTokenExpired(entry: TokenCacheEntry) {
	if (!entry.expiresAt) {
		return true;
	}
	const now = Date.now();
	return entry.expiresAt - TOKEN_EXPIRATION_BUFFER_SECONDS * 1000 <= now;
}

async function requestNewToken(clientId: string) {
	const formData = new URLSearchParams();
	formData.set("client_id", clientId);
	formData.set("grant_type", "client_credentials");
	formData.set("scope", "profile");
	const base64Secret = Buffer.from(
		`${authentikUsername}:${authentikPassword}`,
	).toString("base64");
	formData.set("client_secret", base64Secret);

	const tokenEndpoint = new URL("/application/o/token/", authentikUrl);
	const response = await fetch(tokenEndpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: formData,
	});

	if (!response.ok) {
		throw new Error(`Failed to retrieve Authentik token: ${response.statusText}`);
	}

	const data = (await response.json()) as { access_token: string };
	const expiresAt = getExpirationFromToken(data.access_token);
	tokenCache.set(clientId, {
		token: data.access_token,
		expiresAt,
	});
	return data.access_token;
}

export async function getAuthentikAccessToken(clientId: string) {
	const cached = tokenCache.get(clientId);
	if (cached && !isTokenExpired(cached)) {
		return cached.token;
	}

	if (!inflightRequests.has(clientId)) {
		inflightRequests.set(clientId, requestNewToken(clientId));
	}

	try {
		return await inflightRequests.get(clientId)!;
	} finally {
		inflightRequests.delete(clientId);
	}
}
