import { v4 as uuid } from 'uuid';
import moment, { type Moment } from 'moment';
import { GalaxyHandler } from '$models/galaxy/galaxy-handler';
import { createSector, type Sector, type SectorData } from './sector';
import {
	GalaxyCategory,
	GalaxyTheme,
	SaveLocation,
	SaveStatus,
	TaskChange,
	TaskColor,
	TaskType
} from './task-enums';
import type { TaskData, Comment } from './task-interfaces';
import type { BackupStep } from '$models/backup';
import { writable, type Writable } from 'svelte/store';

export interface GalaxyData extends TaskData {
	children: SectorData[];
	type: TaskType.GALAXY;

	color: TaskColor;
	theme: GalaxyTheme;
	discoverable: boolean;
	category: GalaxyCategory;
	date: string | Moment;
}
export interface Galaxy extends GalaxyData {
	changes$: Writable<TaskChange>;
	parent: undefined;
	removed?: boolean;
	newItemIndex?: number;

	children: Sector[];
	comments: Comment[];

	date: Moment;
	lastModificationDate: Moment;
	saveLocation: SaveLocation;
	saveStatus: SaveStatus;

	nbrSectors: number;
	nbrSectorsCompleted: number;
	nbrSystems: number;
	nbrSystemsCompleted: number;
	nbrPlanets: number;
	nbrPlanetsCompleted: number;
	nbrMoons: number;
	nbrMoonsCompleted: number;
	labelSet: { label: string; active: boolean }[];
	handler: GalaxyHandler;

	bkps: BackupStep[];
	bkpsForward: BackupStep[];
}

export function createNewGalaxy(name: string): Galaxy {
	const galaxyData: GalaxyData = {
		id: uuid(),
		name,
		description: '',
		order: 0,
		type: TaskType.GALAXY,
		closed: false,
		encrypted: false,
		checked: false,
		color: TaskColor.VIOLET,
		theme: GalaxyTheme.BTL,
		discoverable: false,
		category: GalaxyCategory.PROJECT,
		date: moment().toISOString(),
		priority: 1,
		children: [],
		comments: [],
		labels: [],
		content: ''
	};
	const galaxy = createGalaxy(galaxyData);
	galaxy.saveStatus = SaveStatus.NEED_TO_SAVE;
	return galaxy;
}
export function createGalaxy(data: GalaxyData): Galaxy {
	const galaxy: Galaxy = {
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

		color: data.color,
		theme: data.theme,
		discoverable: data.discoverable,
		category: data.category,

		date: moment(data.date),
		lastModificationDate: moment(data.date),
		saveLocation: SaveLocation.LOCAL,
		saveStatus: SaveStatus.NO_COPY,

		parent: undefined,
		changes$: writable(),
		children: [],
		comments: [],
		nbrSectors: 0,
		nbrSectorsCompleted: 0,
		nbrSystems: 0,
		nbrSystemsCompleted: 0,
		nbrPlanets: 0,
		nbrPlanetsCompleted: 0,
		nbrMoons: 0,
		nbrMoonsCompleted: 0,
		handler: new GalaxyHandler(),
		labelSet: [{ label: 'Hide checked', active: false }],
		bkps: [],
		bkpsForward: []
	};
	data.labels.forEach((label) => galaxy.labelSet.push({ label, active: false }));
	data.comments.forEach((comment) =>
		galaxy.comments.push({ time: moment(comment.time), content: comment.content })
	);
	const children: Sector[] = [];
	data.children.forEach((child) => {
		const inflatedChild = createSector(child, galaxy);
		children.push(inflatedChild);
	});
	addChildrenToGalaxy(galaxy, children);
	galaxy.handler.initForGalaxy(galaxy);
	return galaxy;
}

export function addChildToGalaxy(galaxy: Galaxy, sector: Sector, notify: boolean = false): void {
	galaxy.children.push(sector);
	sector.parent = galaxy;
	galaxy.nbrSectors += 1;
	if (sector.checked) {
		galaxy.nbrSectorsCompleted += 1;
	}
	if (notify) {
		galaxy.changes$.set(TaskChange.STRUCTURAL);
	}
}

export function addChildrenToGalaxy(
	galaxy: Galaxy,
	sectors: Sector[],
	notify: boolean = false
): void {
	sectors.forEach((sector) => {
		addChildToGalaxy(galaxy, sector);
	});
	if (notify) {
		galaxy.changes$.set(TaskChange.STRUCTURAL);
	}
}
