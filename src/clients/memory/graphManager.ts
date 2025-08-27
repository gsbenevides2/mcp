import { MongoClient, ObjectId } from "mongodb";
import { getEnv } from "../../utils/getEnv";

// We are storing our memory using entities, relations, and observations in a graph structure
interface Entity {
	name: string;
	entityType: string;
	observations: string[];
}

type EntityWithId = Entity & { _id: ObjectId };

interface Relation {
	from: string;
	to: string;
	relationType: string;
}

type RelationWithId = Relation & { _id: ObjectId };

interface KnowledgeGraph {
	entities: Entity[];
	relations: Relation[];
}

const mongoClient = await MongoClient.connect(getEnv("MONGODB_URI"), {
	authSource: "ia_memory",
});
const db = mongoClient.db("ia_memory");
const entitiesCollection = db.collection<EntityWithId>("entities");
const relationsCollection = db.collection<RelationWithId>("relations");

function removeId<T extends { _id: ObjectId }>(obj: T): Omit<T, "_id"> {
	const { _id, ...rest } = obj;
	return rest;
}

function addId<T>(obj: T): T & { _id: ObjectId } {
	return { ...obj, _id: new ObjectId() };
}

// The KnowledgeGraphManager class contains all operations to interact with the knowledge graph
export class KnowledgeGraphManager {
	private async loadGraph(): Promise<KnowledgeGraph> {
		try {
			const entitiesWithId = await entitiesCollection.find({}).toArray();
			const relationsWithId = await relationsCollection.find({}).toArray();
			return {
				entities: entitiesWithId.map(removeId),
				relations: relationsWithId.map(removeId),
			};
		} catch (error) {
			if (
				error instanceof Error &&
				"code" in error &&
				(error as { code: string }).code === "ENOENT"
			) {
				return { entities: [], relations: [] };
			}
			throw error;
		}
	}

	private async saveGraph(graph: KnowledgeGraph): Promise<void> {
		await entitiesCollection.deleteMany({});
		await relationsCollection.deleteMany({});
		const entities = graph.entities.map(addId);
		const relations = graph.relations.map(addId);
		await entitiesCollection.insertMany(entities);
		await relationsCollection.insertMany(relations);
	}

	async createEntities(entities: Entity[]): Promise<Entity[]> {
		const graph = await this.loadGraph();
		const newEntities = entities.filter(
			(e) =>
				!graph.entities.some(
					(existingEntity) => existingEntity.name === e.name,
				),
		);
		graph.entities.push(...newEntities);
		await this.saveGraph(graph);
		return newEntities;
	}

	async createRelations(relations: Relation[]): Promise<Relation[]> {
		const graph = await this.loadGraph();
		const newRelations = relations.filter(
			(r) =>
				!graph.relations.some(
					(existingRelation) =>
						existingRelation.from === r.from &&
						existingRelation.to === r.to &&
						existingRelation.relationType === r.relationType,
				),
		);
		graph.relations.push(...newRelations);
		await this.saveGraph(graph);
		return newRelations;
	}

	async addObservations(
		observations: { entityName: string; contents: string[] }[],
	): Promise<{ entityName: string; addedObservations: string[] }[]> {
		const graph = await this.loadGraph();
		const results = observations.map((o) => {
			const entity = graph.entities.find((e) => e.name === o.entityName);
			if (!entity) {
				throw new Error(`Entity with name ${o.entityName} not found`);
			}
			const newObservations = o.contents.filter(
				(content) => !entity.observations.includes(content),
			);
			entity.observations.push(...newObservations);
			return { entityName: o.entityName, addedObservations: newObservations };
		});
		await this.saveGraph(graph);
		return results;
	}

	async deleteEntities(entityNames: string[]): Promise<void> {
		const graph = await this.loadGraph();
		graph.entities = graph.entities.filter(
			(e) => !entityNames.includes(e.name),
		);
		graph.relations = graph.relations.filter(
			(r) => !entityNames.includes(r.from) && !entityNames.includes(r.to),
		);
		await this.saveGraph(graph);
	}

	async deleteObservations(
		deletions: { entityName: string; observations: string[] }[],
	): Promise<void> {
		const graph = await this.loadGraph();
		deletions.forEach((d) => {
			const entity = graph.entities.find((e) => e.name === d.entityName);
			if (entity) {
				entity.observations = entity.observations.filter(
					(o) => !d.observations.includes(o),
				);
			}
		});
		await this.saveGraph(graph);
	}

	async deleteRelations(relations: Relation[]): Promise<void> {
		const graph = await this.loadGraph();
		graph.relations = graph.relations.filter(
			(r) =>
				!relations.some(
					(delRelation) =>
						r.from === delRelation.from &&
						r.to === delRelation.to &&
						r.relationType === delRelation.relationType,
				),
		);
		await this.saveGraph(graph);
	}

	async readGraph(): Promise<KnowledgeGraph> {
		return this.loadGraph();
	}

	async searchNodes(query: string): Promise<KnowledgeGraph> {
		const graph = await this.loadGraph();

		// Filter entities
		const filteredEntities = graph.entities.filter(
			(e) =>
				e.name.toLowerCase().includes(query.toLowerCase()) ||
				e.entityType.toLowerCase().includes(query.toLowerCase()) ||
				e.observations.some((o) =>
					o.toLowerCase().includes(query.toLowerCase()),
				),
		);

		// Create a Set of filtered entity names for quick lookup
		const filteredEntityNames = new Set(filteredEntities.map((e) => e.name));

		// Filter relations to only include those between filtered entities
		const filteredRelations = graph.relations.filter(
			(r) => filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to),
		);

		const filteredGraph: KnowledgeGraph = {
			entities: filteredEntities,
			relations: filteredRelations,
		};

		return filteredGraph;
	}

	async openNodes(names: string[]): Promise<KnowledgeGraph> {
		const graph = await this.loadGraph();

		// Filter entities
		const filteredEntities = graph.entities.filter((e) =>
			names.includes(e.name),
		);

		// Create a Set of filtered entity names for quick lookup
		const filteredEntityNames = new Set(filteredEntities.map((e) => e.name));

		// Filter relations to only include those between filtered entities
		const filteredRelations = graph.relations.filter(
			(r) => filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to),
		);

		const filteredGraph: KnowledgeGraph = {
			entities: filteredEntities,
			relations: filteredRelations,
		};

		return filteredGraph;
	}
}
