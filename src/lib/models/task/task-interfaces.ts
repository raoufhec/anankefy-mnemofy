import type { Moment } from 'moment';
import type { Galaxy } from './galaxy';
import type { Moon } from './moon';
import type { Planet } from './planet';
import type { Sector } from './sector';
import type { System } from './system';
import type { TaskChange, TaskType } from './task-enums';

export interface CommentData {
	content: string;
	time: string | Moment;
}
export interface Comment extends CommentData {
	time: Moment;
}

export interface TaskData {
	// Basic properties
	id: string;
	name: string;
	description: string;
	checked: boolean;
	closed: boolean;
	encrypted: boolean;
	order: number;
	priority: number;
	labels: string[];
	comments: CommentData[];
	content: string;

	type: TaskType;
	children: TaskData[];
}

export type Task = Moon | Planet | System | Sector | Galaxy;
