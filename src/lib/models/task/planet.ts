import moment from 'moment';
import { writable, type Writable } from 'svelte/store';
import { createMoon, type Moon, type MoonData } from './moon';
import type { System } from './system';
import { TaskChange, type TaskType } from './task-enums';
import type { TaskData, Comment } from './task-interfaces';

export interface PlanetData extends TaskData {
	children: MoonData[];
	type: TaskType.PLANET;

	difficulty: number;
}
export interface Planet extends PlanetData {
	changes$: Writable<TaskChange>;
	parent?: System;
	removed?: boolean;
	newItemIndex?: number;

	children: Moon[];
	comments: Comment[];
}

export function createPlanet(data: PlanetData, parent?: System): Planet {
	const planet: Planet = {
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
		difficulty: data.difficulty,

		parent: parent,
		changes$: writable<TaskChange>(),
		children: [],
		comments: []
	};
	data.comments.forEach((c) => planet.comments.push({ time: moment(c.time), content: c.content }));
	let children: Moon[] = [];
	data.children.forEach((child) => {
		const inflatedChild = createMoon(child, planet);
		children.push(inflatedChild);
	});
	addChildrenToPlanet(planet, children);
	return planet;
}

export function addChildToPlanet(planet: Planet, moon: Moon, notify: boolean = false): void {
	planet.children.push(moon);
	moon.parent = planet;
	const galaxy = planet.parent?.parent?.parent;
	if (galaxy) {
		galaxy.nbrMoons += 1;
		if (moon.checked) {
			galaxy.nbrMoonsCompleted += 1;
		}
	}
	if (notify) {
		planet.changes$.set(TaskChange.STRUCTURAL);
	}
}

export function addChildrenToPlanet(planet: Planet, moons: Moon[], notify: boolean = false): void {
	moons.forEach((moon) => {
		addChildToPlanet(planet, moon);
	});
	if (notify) {
		planet.changes$.set(TaskChange.STRUCTURAL);
	}
}
