import type { Moment } from 'moment';
import type { BorderShape, ICoords, TerritoryShape, Vec2D } from '$models/space';
import type { Writable } from 'svelte/store';
import type { GalaxyTheme, GalaxyType, TaskColor, TaskType } from './task-enums';
import type { GalaxyHandler } from '$models/galaxy/galaxy-handler';

export interface ICommentData {
	content: string;
	time: string;
}
export interface IComment {
	content: string;
	time: Moment;
}

export interface IMoonData {
	difficulty: number;
}
export type IMoon = IMoonData

export interface IPlanetData {
	difficulty: number;
}
export type IPlanet = IPlanetData

export interface ISystemData {
	coords?: ICoords;
}
export interface ISystem extends ISystemData {
	coords?: Vec2D;
	strength: number;
	notifyLinks$: Writable<Vec2D>;
}

export interface ISectorData {
	color: TaskColor;
	pattern: number;
	emblem: string;
}
export interface ISector extends ISectorData {
	shapes: TerritoryShape[];
	userShapes: TerritoryShape[];
	borders: BorderShape[];
	points: Map<Vec2D, Vec2D>;
	userPoints: Map<Vec2D, Vec2D>;
	borderPoints: Map<Vec2D, Vec2D>;
}

export interface IGalaxyData {
	color: TaskColor;
	theme: GalaxyTheme;
	discoverable: boolean;
	nbrArms: number;
	angleOffset: number;
	seed: number;
	type: GalaxyType;
}
export interface IGalaxy extends IGalaxyData {
	nbrSectors: number;
	nbrSectorsCompleted: number;
	nbrSystems: number;
	nbrSystemsCompleted: number;
	nbrPlanets: number;
	nbrPlanetsCompleted: number;
	labelSet: { label: string; active: boolean }[];
	handler: GalaxyHandler;
}

export interface ITaskData {
	uuid: string;
	name: string;
	description: string;
	checked: boolean;
	closed: boolean;
	encrypted: boolean;
	type: TaskType;
	order: number;
	priority: number;
	children: ITaskData[];
	labels: string[];
	comments: ICommentData[];
	data: IMoonData | IPlanetData | ISystemData | ISectorData | IGalaxyData;
	content: string;
	owner?: string;
	date?: string;
}
