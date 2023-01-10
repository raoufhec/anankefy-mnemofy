import { Vec2D, type ICoords } from '$models/space';
import moment from 'moment';
import { writable, type Writable } from 'svelte/store';
import { createPlanet, type Planet, type PlanetData } from './planet';
import type { Sector } from './sector';
import { TaskChange, type TaskType } from './task-enums';
import type { TaskData, Comment } from './task-interfaces';

export interface SystemData extends TaskData {
	children: PlanetData[];
	type: TaskType.SYSTEM;

	coords?: ICoords;
}
export interface System extends SystemData {
	changes$: Writable<TaskChange>;
	parent?: Sector;
	removed?: boolean;
	newItemIndex?: number;

	children: Planet[];
	comments: Comment[];

	coords?: Vec2D;
	strength: number;
	notifyLinks$: Writable<Vec2D>;
}

export function createSystem(data: SystemData, parent?: Sector): System {
	const system: System = {
		id: data.id,
		name: data.name,
		description: data.description,
		type: data.type,
		checked: data.checked,
		priority: data.priority,
		order: data.order,
		closed: data.closed,
		encrypted: data.encrypted,
		content: data.content,
		labels: [...data.labels],
		coords: data.coords ? new Vec2D(data.coords.x, data.coords.y) : undefined,
		strength: 0,

		parent: parent,
		changes$: writable<TaskChange>(),
		notifyLinks$: writable<Vec2D>(),
		children: [],
		comments: []
	};
	data.comments.forEach((c) => system.comments.push({ time: moment(c.time), content: c.content }));
	let children: Planet[] = [];
	data.children.forEach((child) => {
		const inflatedChild = createPlanet(child, system);
		children.push(inflatedChild);
	});
	addChildrenToSystem(system, children);
	return system;
}

export function addChildToSystem(system: System, planet: Planet, notify: boolean = false): void {
	system.children.push(planet);
	planet.parent = system;
	const galaxy = system.parent?.parent;
	if (galaxy) {
		galaxy.nbrPlanets += 1;
		if (planet.checked) {
			galaxy.nbrPlanetsCompleted += 1;
		}
	}
	if (notify) {
		system.changes$.set(TaskChange.STRUCTURAL);
	}
}

export function addChildrenToSystem(
	system: System,
	planets: Planet[],
	notify: boolean = false
): void {
	planets.forEach((planet) => {
		addChildToSystem(system, planet);
	});
	if (notify) {
		system.changes$.set(TaskChange.STRUCTURAL);
	}
}
