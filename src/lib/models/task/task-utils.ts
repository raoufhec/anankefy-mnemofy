import { BackupActionType, type IBackupAction } from '$models/backup';
import { EMBLEMS } from '$models/emblems';
import { GalaxyHandler } from '$models/galaxy/galaxy-handler';
import { Vec2D } from '$models/space';
import { writable } from 'svelte/store';
import type { Task } from './task';
import { GalaxyTheme, GalaxyType, TaskColor, TaskType } from './task-enums';
import type {
	IGalaxy,
	IGalaxyData,
	IMoon,
	IMoonData,
	IPlanet,
	IPlanetData,
	ISector,
	ISectorData,
	ISystem,
	ISystemData,
	ITaskData
} from './task-interfaces';

export const injectGalaxyMethods = (item: Task, data?: IGalaxyData): void => {
	item.type = TaskType.GALAXY;
	const galaxyData: IGalaxy = {
		color: TaskColor.VIOLET,
		seed: Math.round(Math.random() * 10000),
		nbrSectors: 0,
		nbrSectorsCompleted: 0,
		nbrSystems: 0,
		nbrSystemsCompleted: 0,
		nbrPlanets: 0,
		nbrPlanetsCompleted: 0,
		labelSet: [{ label: 'Hide checked', active: false }],
		handler: new GalaxyHandler(),
		theme: GalaxyTheme.BTL,
		discoverable: false,
		angleOffset: 0,
		nbrArms: 3,
		type: GalaxyType.PROJECT
	};
	if (data) {
		Object.assign(galaxyData, data);
	}
	item.data = galaxyData;
	galaxyData.handler.initForGalaxy(item);

	item.setChecked = function (value: boolean, propagate = true): void {
		if (item.checked == value) return; // no need to change anything
		item.checked = value;
		if (propagate || value) {
			item.children.forEach((child) => {
				child.setChecked!(value, true);
			});
		}
	};

	item.getColor = function () {
		return (item.data as IGalaxyData).color;
	};

	item.getDifficulty = function () {
		let dif = 0;
		if (item.children.length > 0) {
			item.children.forEach((child) => {
				dif += child.getDifficulty!();
			});
			dif = Math.round(dif / item.children.length);
			return dif;
		}
		return 1;
	};

	item.getGalaxy = function () {
		return item;
	};

	item.export = function (): ITaskData {
		const output = item.partialExport();
		const itemData = item.data as IGalaxyData;
		output.data = {
			color: itemData.color,
			seed: itemData.seed,
			theme: itemData.theme,
			discoverable: itemData.discoverable,
			angleOffset: itemData.angleOffset,
			nbrArms: itemData.nbrArms,
			type: itemData.type
		};
		output.date = item.date;
		output.owner = item.owner;
		return output;
	};
};

export const injectSectorMethods = (item: Task, data?: ISectorData): void => {
	item.type = TaskType.SECTOR;
	const sectorData: ISector = {
		color: TaskColor.VIOLET,
		pattern: Math.floor(Math.random() * 10),
		emblem: EMBLEMS[Math.floor(Math.random() * EMBLEMS.length)],
		shapes: [],
		userShapes: [],
		borders: [],
		points: new Map<Vec2D, Vec2D>(),
		userPoints: new Map<Vec2D, Vec2D>(),
		borderPoints: new Map<Vec2D, Vec2D>()
	};

	if (data) {
		sectorData.color = data.color ? data.color : sectorData.color;
		sectorData.pattern = data.pattern ? data.pattern : sectorData.pattern;
		sectorData.emblem = data.emblem ? data.emblem : sectorData.emblem;
	}
	item.data = sectorData;

	item.setChecked = function (value: boolean, propagate = true): void {
		if (item.checked == value) return; // no need to change anything
		item.checked = value;
		if (propagate || value) {
			item.children.forEach((child) => {
				child.setChecked!(value, true);
			});
		}
		if (value == false) {
			item.parent!.setChecked!(false, false);
		}
		if (!item.removed && (item.newItemIndex === null || item.newItemIndex === undefined)) {
			const increment = value ? +1 : -1;
			const parentData = item.getGalaxy!().data as IGalaxy;
			parentData.nbrSectorsCompleted += increment;
		}
	};

	item.getColor = function () {
		return (item.data as ISector).color;
	};

	item.getDifficulty = function () {
		let dif = 0;
		if (item.children.length > 0) {
			item.children.forEach((child) => {
				dif += child.getDifficulty!();
			});
			dif = Math.round(dif / item.children.length);
			return dif;
		}
		return 1;
	};

	item.getGalaxy = function () {
		return item.parent!;
	};

	item.export = function (): ITaskData {
		const output = item.partialExport();
		const itemData = item.data as ISector;
		output.data = {
			color: itemData.color,
			pattern: itemData.pattern,
			emblem: itemData.emblem
		};
		return output;
	};
};

export const injectSystemMethods = (item: Task, data?: ISystemData): void => {
	item.type = TaskType.SYSTEM;
	const systemData: ISystem = {
		strength: 0,
		notifyLinks$: writable<Vec2D>()
	};
	if (data) {
		systemData.coords = data.coords ? new Vec2D(data.coords.x, data.coords.y) : undefined;
	}
	item.data = systemData;

	item.setChecked = function (value: boolean, propagate = true): void {
		if (item.checked == value) return; // no need to change anything
		item.checked = value;
		if (propagate || value) {
			item.children.forEach((child) => {
				child.setChecked!(value, true);
			});
		}
		if (value == false) {
			item.parent!.setChecked!(false, false);
		}
		if (!item.removed && (item.newItemIndex === null || item.newItemIndex === undefined)) {
			const increment = value ? +1 : -1;
			const parentData = item.getGalaxy!().data as IGalaxy;
			parentData.nbrSystemsCompleted += increment;
		}
	};

	item.getColor = function () {
		return item.parent!.getColor!();
	};

	item.getDifficulty = function () {
		let dif = 0;
		if (item.children.length > 0) {
			item.children.forEach((child) => {
				dif += child.getDifficulty!();
			});
			dif = Math.round(dif / item.children.length);
			return dif;
		}
		return 1;
	};

	item.getGalaxy = function () {
		return item.parent!.getGalaxy!();
	};

	item.export = function (): ITaskData {
		const output = item.partialExport();
		const itemData = item.data as ISystem;
		output.data = {
			coords: { x: itemData.coords!.x, y: itemData.coords!.y }
		};
		return output;
	};
};

export const injectPlanetMethods = (item: Task, data?: IPlanetData): void => {
	item.type = TaskType.PLANET;
	const planetData: IPlanet = {
		difficulty: 1
	};
	if (data) {
		planetData.difficulty = data.difficulty;
	}
	item.data = planetData;

	item.setChecked = function (value: boolean, propagate: boolean): void {
		if (item.checked == value) return; // no need to change anything
		item.checked = value;
		if (propagate || value) {
			item.children.forEach((child) => {
				child.setChecked!(value, true);
			});
		}
		if (value == false) {
			item.parent!.setChecked!(false, false);
		}

		if (!item.removed && (item.newItemIndex === null || item.newItemIndex === undefined)) {
			const increment = value ? +1 : -1;
			const parentData = item.getGalaxy!().data as IGalaxy;
			parentData.nbrPlanetsCompleted += increment;
		}
	};

	item.getColor = function () {
		return item.parent!.getColor!();
	};

	item.getDifficulty = function () {
		return (item.data as IPlanetData).difficulty;
	};

	item.getGalaxy = function () {
		return item.parent!.getGalaxy!();
	};

	item.export = function (): ITaskData {
		const output = item.partialExport();
		const itemData = item.data as IPlanetData;
		output.data = {
			difficulty: itemData.difficulty
		};
		return output;
	};
};

export const injectMoonMethods = (item: Task, data?: IMoonData): void => {
	item.type = TaskType.MOON;
	const moonData: IMoon = { difficulty: 1 };
	if (data) {
		moonData.difficulty = data.difficulty ? data.difficulty : 1;
	}

	item.data = moonData;

	item.setChecked = function (value: boolean, propagate?: boolean): void {
		if (item.checked == value) return; // no need to change anything
		item.checked = value;
		if (value == false) {
			item.parent!.setChecked!(false, false);
		}
	};

	item.getColor = function () {
		return item.parent!.getColor!();
	};

	item.getDifficulty = function () {
		return 1;
	};

	item.getGalaxy = function () {
		return item.parent!.getGalaxy!();
	};

	item.export = function (): ITaskData {
		const output = item.partialExport();
		const itemData = item.data as IMoonData;
		output.data = {
			difficulty: itemData.difficulty
		};
		return output;
	};
};

export const updateGalaxyStats = (galaxy: Task, item: Task, adding: boolean) => {
	if (item.removed) return;
	const galaxyData = galaxy.data as IGalaxy;
	const increment = adding ? 1 : -1;
	switch (item.type) {
		case TaskType.SECTOR:
			galaxyData.nbrSectors += increment;
			if (item.checked) {
				galaxyData.nbrSectorsCompleted += increment;
			}
			item.children.forEach((system) => {
				galaxyData.nbrSystems += increment;
				if (system.checked) {
					galaxyData.nbrSystemsCompleted += increment;
				}
				system.children.forEach((planet) => {
					galaxyData.nbrPlanets += increment;
					if (planet.checked) {
						galaxyData.nbrPlanetsCompleted += increment;
					}
				});
			});
			break;
		case TaskType.SYSTEM:
			galaxyData.nbrSystems += increment;
			if (item.checked) {
				galaxyData.nbrSystemsCompleted += increment;
			}
			item.children.forEach((planet) => {
				galaxyData.nbrPlanets += increment;
				if (planet.checked) {
					galaxyData.nbrPlanetsCompleted += increment;
				}
			});
			break;
		case TaskType.PLANET:
			galaxyData.nbrPlanets += increment;
			if (item.checked) {
				galaxyData.nbrPlanetsCompleted += increment;
			}
			break;
	}
};

export const backupAllSystemsBeforeCoordsChange = (galaxy: Task): IBackupAction[] => {
	const step: IBackupAction[] = [];
	galaxy.children.forEach((sector) => {
		sector.children.forEach((system) => {
			step.push({
				item: system,
				value: (system.data as ISystem).coords!.clone(),
				type: BackupActionType.COORDINATES
			});
		});
	});
	return step;
};
