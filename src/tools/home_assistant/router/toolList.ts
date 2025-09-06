import { GetRouterDataTool } from "./getRouterData";
import { RebootRouterTool } from "./rebootRouter";
import { ToggleDataFetchingTool } from "./toggleDataFetching";
import { ToggleGuestWifiTool } from "./toggleGuestWifi";

export const homeAssistantRouterToolsList = [
	new GetRouterDataTool(),
	new RebootRouterTool(),
	new ToggleDataFetchingTool(),
	new ToggleGuestWifiTool(),
];
