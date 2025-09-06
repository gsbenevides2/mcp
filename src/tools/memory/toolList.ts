import { AddObservationsTool } from "./addObservations";
import { CreateEntitiesTool } from "./createEntities";
import { CreateRelationsTool } from "./createRelations";
import { DeleteEntitiesTool } from "./deleteEntities";
import { DeleteObservationsTool } from "./deleteObservations";
import { DeleteRelationsTool } from "./deleteRelations";
import { OpenNodesTool } from "./openNodes";
import { ReadGraphTool } from "./readGraph";
import { SearchNodesTool } from "./searchNodes";

export const memoryToolsList = [
	new AddObservationsTool(),
	new CreateEntitiesTool(),
	new CreateRelationsTool(),
	new DeleteEntitiesTool(),
	new DeleteObservationsTool(),
	new DeleteRelationsTool(),
	new OpenNodesTool(),
	new ReadGraphTool(),
	new SearchNodesTool(),
];
