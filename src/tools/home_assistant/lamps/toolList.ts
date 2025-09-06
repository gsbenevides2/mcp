import { GetRoomLampTool } from "./getRoomLamp";
import { ListRoomsTool } from "./listRooms";
import { SetRoomLampTool } from "./setRoomLamp";
import { SetRoomLampBrightnessTool } from "./setRoomLampBrightness";

export const homeAssistantLampsToolsList = [
	new GetRoomLampTool(),
	new ListRoomsTool(),
	new SetRoomLampTool(),
	new SetRoomLampBrightnessTool(),
];
