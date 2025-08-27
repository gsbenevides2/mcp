import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SendDiscordMessageTool } from "./discord/sendMessage";
import { MovimentDetectionTool } from "./home_assistant/camera/movimentDetection";
import { GetRoomLampTool } from "./home_assistant/lamps/getRoomLamp";
import { ListRoomsTool } from "./home_assistant/lamps/listRooms";
import { SetRoomLampTool } from "./home_assistant/lamps/setRoomLamp";
import { SetRoomLampBrightnessTool } from "./home_assistant/lamps/setRoomLampBrightness";
import { GetAllPlatformStatusTool } from "./home_assistant/platform_status/getAllPlatformStatusTool";
import { GetNameOfPlataformsTool } from "./home_assistant/platform_status/getNameOfPlataforms";
import { GetPlatformStatusTool } from "./home_assistant/platform_status/getStatus";
import { RebootRouterTool } from "./home_assistant/router/rebootRouter";
import { ToggleDataFetchingTool } from "./home_assistant/router/toggleDataFetching";
import { ToggleGuestWifiTool } from "./home_assistant/router/toggleGuestWifi";
import { GetAlbumTracks } from "./home_assistant/spotify/getAlbumTracks";
import { GetArtistAlbums } from "./home_assistant/spotify/getArtistAlbums";
import { GetArtistTopTracks } from "./home_assistant/spotify/getArtistTopTracks";
import { GetSpotifyData } from "./home_assistant/spotify/getData";
import { ListAccounts } from "./home_assistant/spotify/listAccounts";
import { MakeSpotifyOperation } from "./home_assistant/spotify/makeOperation";
import { PlayAlbum } from "./home_assistant/spotify/playAlbum";
import { PlayArtist } from "./home_assistant/spotify/playArtist";
import { PlaySong } from "./home_assistant/spotify/playSong";
import { SearchAlbum } from "./home_assistant/spotify/searchAlbum";
import { SearchArtist } from "./home_assistant/spotify/searchArtist";
import { SearchSong } from "./home_assistant/spotify/searchSong";
import { GetTrainStatus } from "./home_assistant/train/getStatus";
import { GetStreamerStatusTool } from "./home_assistant/twicth/getStatus";
import { GetStreamerIdsTool } from "./home_assistant/twicth/getStreamerIds";
import { MarkdownfyWebpage } from "./markdownfy/webpage";

export const toolList = [
	new MarkdownfyWebpage(),
	new SendDiscordMessageTool(),
	new MovimentDetectionTool(),
	new SetRoomLampBrightnessTool(),
	new SetRoomLampTool(),
	new GetRoomLampTool(),
	new ListRoomsTool(),
	new GetAllPlatformStatusTool(),
	new GetPlatformStatusTool(),
	new GetNameOfPlataformsTool(),
	new ToggleDataFetchingTool(),
	new ToggleGuestWifiTool(),
	new RebootRouterTool(),
	new ListAccounts(),
	new GetSpotifyData(),
	new PlaySong(),
	new PlayAlbum(),
	new PlayArtist(),
	new MakeSpotifyOperation(),
	new SearchSong(),
	new SearchAlbum(),
	new SearchArtist(),
	new GetArtistAlbums(),
	new GetArtistTopTracks(),
	new GetAlbumTracks(),
	new GetStreamerIdsTool(),
	new GetStreamerStatusTool(),
	new GetTrainStatus(),
];

export function registerTools(server: McpServer) {
	toolList.forEach((tool) => {
		tool.serverRegister(server);
	});
}
