import { addChildToGalaxy, type Galaxy, type GalaxyData } from './galaxy';
import { createMoon, type Moon, type MoonData } from './moon';
import { addChildToPlanet, createPlanet, type Planet, type PlanetData } from './planet';
import { addChildToSector, createSector, type Sector, type SectorData } from './sector';
import { addChildToSystem, createSystem, type System, type SystemData } from './system';
import { TaskChange, TaskColor, TaskType } from './task-enums';
import type { TaskData, Task } from './task-interfaces';

export function setChecked(task: Task, value: boolean, propagate: boolean = true): void {
	if (task.checked == value) return; // no need to change anything
	task.checked = value;
	if (propagate || value) {
		(task.children as Task[]).forEach((child: Task) => {
			setChecked(child, value, propagate);
		});
	}
	if (task.type !== TaskType.GALAXY) {
		if (task.parent) {
			if (value === false) {
				setChecked(task.parent, false, false);
			}
			if (!task.removed && task.newItemIndex === undefined) {
				const increment = value ? +1 : -1;
				const galaxy = getGalaxy(task)!;
				switch (task.type) {
					case TaskType.MOON:
						galaxy.nbrMoonsCompleted += increment;
						break;
					case TaskType.PLANET:
						galaxy.nbrPlanetsCompleted += increment;
						break;
					case TaskType.SYSTEM:
						galaxy.nbrSystemsCompleted += increment;
						break;
					case TaskType.SECTOR:
						galaxy.nbrSectorsCompleted += increment;
						break;
				}
			}
		}
	}
	task.changes$!.set(TaskChange.CHECKED);
}

export function getColor(task: Task): TaskColor {
	switch (task.type) {
		case TaskType.MOON:
			return (task as Moon).parent!.parent!.parent!.color;
		case TaskType.PLANET:
			return (task as Planet).parent!.parent!.color;
		case TaskType.SYSTEM:
			return (task as System).parent!.color;
		case TaskType.SECTOR:
			return (task as Sector).color;
		default: // Galaxy
			return (task as Galaxy).color;
	}
}

export function getDifficulty(task: Task): number {
	let dif = 0;
	if (task.children.length > 0) {
		(task.children as Task[]).forEach((child) => {
			dif += getDifficulty(child);
		});
		dif = Math.round(dif / task.children.length);
		return dif;
	}
	return 1;
}

export function getGalaxy(task: Task): Galaxy | undefined {
	switch (task.type) {
		case TaskType.MOON:
			return (task as Moon).parent?.parent?.parent?.parent;
		case TaskType.PLANET:
			return (task as Planet).parent?.parent?.parent;
		case TaskType.SYSTEM:
			return (task as System).parent?.parent;
		case TaskType.SECTOR:
			return (task as Sector).parent;
		default: // Galaxy
			return task as Galaxy;
	}
}

export function getNbrChildren(task: Task, openOnly: boolean = false): number {
	if (openOnly && task.closed) return 0;
	let nbr = task.children.length;
	(task.children as Task[]).forEach((child) => {
		nbr += getNbrChildren(child, openOnly);
	});
	return nbr;
}

export function exportCommonData(task: Task): TaskData {
	const commonData: TaskData = {
		id: task.id,
		type: task.type,
		name: task.name,
		description: task.description,
		checked: task.checked,
		priority: task.priority,
		order: task.order,
		closed: task.closed,
		encrypted: task.encrypted,
		children: [],
		labels: [],
		comments: [],
		content: task.content
	};
	task.labels.forEach((label) => {
		commonData.labels.push(label);
	});
	(task.children as Task[]).forEach((child) => {
		const childData = exportData(child);
		commonData.children.push(childData);
	});
	task.comments.forEach((comment) => {
		commonData.comments.push({
			content: comment.content,
			time: comment.time.toISOString()
		});
	});
	return commonData;
}

export function exportData(task: Task): TaskData {
	const commonData = exportCommonData(task);
	switch (task.type) {
		case TaskType.MOON:
			const moonData = commonData as MoonData;
			moonData.difficulty = task.difficulty;
			return moonData;
		case TaskType.PLANET:
			const planetData = commonData as PlanetData;
			planetData.difficulty = task.difficulty;
			return planetData;
		case TaskType.SYSTEM:
			const systemData = commonData as SystemData;
			systemData.coords = { x: task.coords!.x, y: task.coords!.y };
			return systemData;
		case TaskType.SECTOR:
			const sectorData = commonData as SectorData;
			sectorData.color = task.color;
			sectorData.pattern = task.pattern;
			sectorData.emblem = task.emblem;
			return sectorData;
		default: // Galaxy
			const galaxyData = commonData as GalaxyData;
			galaxyData.color = task.color;
			galaxyData.theme = task.theme;
			galaxyData.discoverable = task.discoverable;
			galaxyData.category = task.category;
			galaxyData.date = task.date.toISOString();
			return galaxyData;
	}
}

export function setClosed(task: Task, value: boolean): void {
	task.closed = value;
	if (value === true) {
		(task.children as Task[]).forEach((child) => {
			setClosed(child, value);
		});
		task.changes$.set(TaskChange.CLOSED);
	} else {
		task.changes$.set(TaskChange.OPENED);
	}
}

export function addChild(parent: Task, child: Task): void {
	switch (parent.type) {
		case TaskType.MOON:
			throw new Error('Cannot add children to Moons!');
		case TaskType.PLANET:
			addChildToPlanet(parent, child as Moon);
			break;
		case TaskType.SYSTEM:
			addChildToSystem(parent, child as Planet);
			break;
		case TaskType.SECTOR:
			addChildToSector(parent, child as System);
			break;
		default: // Galaxy
			addChildToGalaxy(parent, child as Sector);
			break;
	}
}

export function removeChild(parent: Task, child: Task): void {}

export function getFlattenedChildren(task: Task): Task[] {
	let children: Task[] = [];
	(task.children as Task[]).forEach((child) => {
		children.push(child);
		children = children.concat(getFlattenedChildren(child));
	});
	return children;
}

export function typeToText(type: TaskType): string {
	switch (type) {
		case TaskType.GALAXY:
			return 'galaxy';
		case TaskType.SECTOR:
			return 'sector';
		case TaskType.SYSTEM:
			return 'system';
		case TaskType.PLANET:
			return 'planet';
		default:
			return 'moon';
	}
}

export function createTask(data: TaskData, type: TaskType, parent?: Task): Task {
	switch (type) {
		case TaskType.SECTOR:
			return createSector(data as SectorData, parent as Galaxy | undefined);
		case TaskType.SYSTEM:
			return createSystem(data as SystemData, parent as Sector | undefined);
		case TaskType.PLANET:
			return createPlanet(data as PlanetData, parent as System | undefined);
		case TaskType.MOON:
			return createMoon(data as MoonData, parent as Planet | undefined);
		default:
			throw new Error('Cannot create task of type: ' + type);
	}
}

export function isDisplayed(task: Task): boolean {
	return !task.parent!.closed;
}

// export function morphTo<T>(task: Task, type: TaskType, newParent: Task): T {
// 	let rollback: IBackupAction[] = [
// 		{
// 			item: task,
// 			value: { type: task.type, parent: task.parent },
// 			type: BackupActionType.TYPE
// 		},
// 		{
// 			item: task,
// 			value: task.checked,
// 			type: BackupActionType.CHECKED
// 		}
// 	];
// 	let rollforward: IBackupAction[] = [
// 		{
// 			item: task,
// 			value: { type, parent: newParent },
// 			type: BackupActionType.TYPE
// 		}
// 	];
//     // the task to be morphed needs to keep track to the current parent.
//     // a backup of the removal from the old parent needs to have been added before we get here
//     // Remove -> type -> add
//     const morphedTaskData = {
//         id: task.id,
//         name: task.name,
//         description: task.description,
//         checked: task.checked,
//         priority: task.priority,
//         order: task.order,
//         closed: task.closed,
//         encrypted: task.encrypted,
//         children: [],
//         labels: [...task.labels],
//         comments: [...task.comments],
//         content: task.content,
//         changes$: new Subject<TaskChange>(),
//     }
//     let morphedTask: Task;
// 	switch (type) {
// 		case TaskType.MOON:
//             const moon: Moon = {
//                 ...morphedTaskData,
//                 type: TaskType.MOON,
//                 difficulty: (task.type === TaskType.PLANET) ? task.difficulty : 1,

//                 changes$: new Subject<TaskChange>(),
//                 parent: newParent as Planet
//             }
//             morphedTask = moon;
//             break;
// 		case TaskType.PLANET:
//             const planet: Planet = {
//                 ...morphedTaskData,
//                 type: TaskType.PLANET,
//                 difficulty: (task.type === TaskType.MOON) ? task.difficulty : 1,

//                 changes$: new Subject<TaskChange>(),
//                 parent: newParent as System
//             }
//             morphedTask = planet;
//             break;
// 		case TaskType.SYSTEM:
//             const system: System = {
//                 ...morphedTaskData,
//                 type: TaskType.SYSTEM,
//                 notifyLinks$: new Subject<Vec2D>(),
//                 strength: 1,

//                 changes$: new Subject<TaskChange>(),
//                 parent: newParent as Sector
//             }
//             morphedTask = system;
//             break;
// 		case TaskType.SECTOR:
//             const sector: Sector = {
//                 ...morphedTaskData,
//                 type: TaskType.SECTOR,
//                 color: TaskColor.VIOLET,
//                 pattern: Math.floor(Math.random() * 10),
//                 emblem: EMBLEMS[Math.floor(Math.random() * EMBLEMS.length)],
//                 shapes: [],
//                 userShapes: [],
//                 borders: [],
//                 points: new Map<Vec2D, Vec2D>(),
//                 userPoints: new Map<Vec2D, Vec2D>(),
//                 borderPoints: new Map<Vec2D, Vec2D>(),

//                 changes$: new Subject<TaskChange>(),
//                 parent: newParent as Galaxy
//             }
//             morphedTask = sector;
//             break;
// 		default: // Galaxy
//             throw new Error('Morphing to a galaxy is not allowed')
// 	}

//     if(task.children.length > 0) {
//         const children = [...task.children] as Task[];
//         if(type >= TaskType.MOON) {
//             // Max level is 4 (Moon) so children need to change parent
//             let order = task.order + 1;
//             children.forEach((child) => {
//                 const morphedChild = child;
//                 // 1- prepare to remove child
//                 rollback.push({
//                     item: newParent,
//                     value: morphedChild,
//                     type: BackupActionType.REMOVE_CHILD
//                 });
//                 rollforward.push({
//                     item: task,
//                     value: child,
//                     type: BackupActionType.REMOVE_CHILD
//                 });
//                 const childNbrChildren = getNbrChildren(child);
//                 // remove child

//                 // 2- prepare to change order

//                 // 3- prepare to add child

//             })
//         } else { // no need to change parent
//             let order = 0;
//             children.forEach((child) => {
//                 const nbrChildChildren = getNbrChildren(child);
//                 // 1- prepare to remove child
//                 rollback.push({
//                     item: task,
//                     value: child,
//                     type: BackupActionType.REMOVE_CHILD
//                 });
//                 rollforward.push({
//                     item: task,
//                     value: child,
//                     type: BackupActionType.REMOVE_CHILD
//                 });

//                 // remove child

//                 // 2- prepare to change order

//                 // 3- prepare to add child
//             })

//         }
//     }
// }
