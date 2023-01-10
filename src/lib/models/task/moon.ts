import moment from 'moment';
import { writable, type Writable } from 'svelte/store';
import type { Planet } from './planet';
import type { TaskChange, TaskType } from './task-enums';
import type { TaskData, Comment } from './task-interfaces';

export interface MoonData extends TaskData {
	difficulty: number;
	type: TaskType.MOON;
}
export interface Moon extends MoonData {
	// Interaction properties
	changes$: Writable<TaskChange>;
	parent?: Planet;
	removed?: boolean;
	newItemIndex?: number;

	comments: Comment[];
}

export function createMoon(data: MoonData, parent?: Planet): Moon {
	const moon: Moon = {
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

		changes$: writable<TaskChange>(),
		children: [],
		comments: []
	};
	data.comments.forEach((c) => moon.comments.push({ time: moment(c.time), content: c.content }));
	return moon;
}
