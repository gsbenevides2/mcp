import { getEnv } from "../utils/getEnv";

const AUTH_SECRET = getEnv("AUTH_SECRET", false, "");

export class AuthService {
	static verify(secret?: string) {
		if (!AUTH_SECRET) {
			return true;
		}
		return secret === AUTH_SECRET;
	}
}
