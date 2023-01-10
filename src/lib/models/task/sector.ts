import type { BorderShape, TerritoryShape, Vec2D } from '$models/space';
import moment from 'moment';
import { writable, type Writable } from 'svelte/store';
import type { Galaxy } from './galaxy';
import { createSystem, type System, type SystemData } from './system';
import { TaskChange, TaskColor, type TaskType } from './task-enums';
import type { TaskData, Comment } from './task-interfaces';

export interface SectorData extends TaskData {
	children: SystemData[];
	type: TaskType.SECTOR;

	color: TaskColor;
	pattern: number;
	emblem: string;
}
export interface Sector extends SectorData {
	changes$: Writable<TaskChange>;
	parent?: Galaxy;
	removed?: boolean;
	newItemIndex?: number;

	children: System[];
	comments: Comment[];

	shapes: TerritoryShape[];
	userShapes: TerritoryShape[];
	borders: BorderShape[];
	points: Map<Vec2D, Vec2D>;
	userPoints: Map<Vec2D, Vec2D>;
	borderPoints: Map<Vec2D, Vec2D>;
}

export function createSector(data: SectorData, parent?: Galaxy): Sector {
	const sector: Sector = {
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
		color: data.color || TaskColor.VIOLET,
		pattern: data.pattern,
		emblem: data.emblem,

		parent: parent,
		changes$: writable<TaskChange>(),
		children: [],
		comments: [],

		shapes: [],
		userShapes: [],
		borders: [],
		points: new Map<Vec2D, Vec2D>(),
		userPoints: new Map<Vec2D, Vec2D>(),
		borderPoints: new Map<Vec2D, Vec2D>()
	};
	data.comments.forEach((c) => sector.comments.push({ time: moment(c.time), content: c.content }));
	let children: System[] = [];
	data.children.forEach((child) => {
		const inflatedChild = createSystem(child, sector);
		children.push(inflatedChild);
	});
	addChildrenToSector(sector, children);
	return sector;
}

export function addChildToSector(sector: Sector, system: System, notify: boolean = false): void {
	sector.children.push(system);
	system.parent = sector;
	const galaxy = sector.parent;
	if (galaxy) {
		galaxy.nbrSystems += 1;
		if (system.checked) {
			galaxy.nbrSystemsCompleted += 1;
		}
	}
	if (notify) {
		sector.changes$.set(TaskChange.STRUCTURAL);
	}
}

export function addChildrenToSector(
	sector: Sector,
	systems: System[],
	notify: boolean = false
): void {
	systems.forEach((system) => {
		addChildToSector(sector, system);
	});
	if (notify) {
		sector.changes$.set(TaskChange.STRUCTURAL);
	}
}
