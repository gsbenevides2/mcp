import { GetAllPlatformStatusTool } from "./getAllPlatformStatusTool";
import { GetNameOfPlataformsTool } from "./getNameOfPlataforms";
import { GetPlatformStatusTool } from "./getStatus";

export const homeAssistantPlatformStatusToolsList = [
	new GetAllPlatformStatusTool(),
	new GetNameOfPlataformsTool(),
	new GetPlatformStatusTool(),
];
