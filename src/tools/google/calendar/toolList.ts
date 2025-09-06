import { CreateEventTool } from "./createEvent";
import { DeleteEventTool } from "./deleteEvent";
import { ListCalendars } from "./listCalendars";
import { ListEvents } from "./listEvents";
import { UpdateEventTool } from "./updateEvent";

export const googleCalendarToolsList = [
	new CreateEventTool(),
	new DeleteEventTool(),
	new ListCalendars(),
	new ListEvents(),
	new UpdateEventTool(),
];
