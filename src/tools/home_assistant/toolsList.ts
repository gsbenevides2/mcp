import { MovimentDetectionTool } from "./camera/movimentDetection";
import { homeAssistantLampsToolsList } from "./lamps/toolList";
import { homeAssistantPlatformStatusToolsList } from "./platform_status/toolList";
import { homeAssistantRouterToolsList } from "./router/toolList";
import { homeAssistantSpotifyToolsList } from "./spotify/toolList";
import { GetTrainStatus } from "./train/getStatus";
import { homeAssistantTwicthToolsList } from "./twicth/toolList";

export const homeAssistantToolsList = [
	new MovimentDetectionTool(),
	...homeAssistantLampsToolsList,
	...homeAssistantPlatformStatusToolsList,
	...homeAssistantRouterToolsList,
	...homeAssistantSpotifyToolsList,
	new GetTrainStatus(),
	...homeAssistantTwicthToolsList,
];
