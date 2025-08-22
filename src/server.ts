import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import api from "./backend/api";
import { coolifyHealthChecker } from "./plugins/coolify-healtcheker";
import { logger } from "./plugins/logger";
import { getProjectInfo } from "./utils/getProjectInfo";
import { sendServerReadyMessage } from "./utils/sendServerReadyMessage";

const projectInfo = getProjectInfo();
console.log(`${projectInfo.title} v${projectInfo.version}`);

const port = Bun.env.PORT || 3000;
const app = new Elysia()
	.use(logger())
	.use(cors())
	.use(coolifyHealthChecker)
	.use(api)
	.listen(port, sendServerReadyMessage(true));

export type App = typeof app;
