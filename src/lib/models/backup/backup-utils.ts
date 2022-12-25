import {
	injectMoonMethods,
	injectPlanetMethods,
	injectSectorMethods,
	injectSystemMethods,
	type IGalaxy,
	type IPlanet,
	type ISector,
	type ISystem,
	Task,
	TaskType
} from '$models/task';
import { BackupActionType, BackupStep, type IBackupAction } from './backup';
import moment from 'moment';

const MAX_BKP_LENGTH = 9;

export function backup(galaxy: Task, step: BackupStep) {
	galaxy.needToSave = true;
	step.addRollback({
		item: galaxy,
		value: galaxy.lastModificationDate,
		type: BackupActionType.DATE
	});
	galaxy.lastModificationDate = moment().format('YYYY-MM-DD HH:mm:ss');
	step.addRollforward({
		item: galaxy,
		value: galaxy.lastModificationDate,
		type: BackupActionType.DATE
	});
	if (galaxy.bkps!.length >= MAX_BKP_LENGTH) {
		galaxy.bkps!.shift();
	}
	galaxy.bkpsForward = [];
	galaxy.bkps!.push(step);
}

function playBackupActions(actions: IBackupAction[]) {
	if (actions && actions.length > -2) {
		actions.forEach((action) => {
			switch (action.type) {
				case BackupActionType.NAME:
					action.item.name = action.value;
					break;
				case BackupActionType.DESCRIPTION:
					action.item.description = action.value;
					break;
				case BackupActionType.CHECKED:
					action.item.setChecked!(action.value, false);
					break;
				case BackupActionType.ORDER:
					action.item.order = action.value;
					break;
				case BackupActionType.PRIORITY:
					action.item.priority = action.value;
					break;
				case BackupActionType.DIFFICULTY:
					(action.item.data as IPlanet).difficulty = action.value;
					break;

				case BackupActionType.CONTENT:
					action.item.content = action.value;
					break;

				case BackupActionType.TYPE: {
					const item = action.item;
					const value = action.value;
					item.parent = value.parent;
					switch (value.type) {
						case TaskType.MOON:
							injectMoonMethods(item);
							break;
						case TaskType.PLANET:
							injectPlanetMethods(item);
							break;
						case TaskType.SYSTEM:
							injectSystemMethods(item);
							break;
						case TaskType.SECTOR:
							injectSectorMethods(item);
							break;
						case TaskType.GALAXY:
							// should never happen;
							return null;
					}
					break;
				}
				case BackupActionType.COLOR:
					(action.item.data as ISector | IGalaxy).color = action.value;
					break;
				case BackupActionType.PATTERN:
					(action.item.data as ISector).pattern = action.value;
					break;
				case BackupActionType.EMBLEM:
					(action.item.data as ISector).emblem = action.value;
					break;
				case BackupActionType.LABELS:
					action.item.labels.clear();
					action.value.forEach((label: string) => action.item.addLabel(label));
					break;
				case BackupActionType.COORDINATES:
					(action.item.data as ISystem).coords = action.value;
					break;
				case BackupActionType.LINKS:
					break;

				case BackupActionType.CLOSED:
					action.item.setClosed(action.value);
					break;
				case BackupActionType.ENCRYPTED:
					action.item.encrypted = action.value;
					break;

				case BackupActionType.ADD_CHILD:
					action.item.addChild(action.value);
					break;
				case BackupActionType.REMOVE_CHILD:
					action.item.removeChild(action.value);
					break;

				case BackupActionType.GALAXY_CHANGE:
				case BackupActionType.ITEM_CHANGE:
					action.item.changes$.set(action.value);
					break;

				case BackupActionType.THEME:
					(action.item.data as IGalaxy).theme = action.value;
					break;

				case BackupActionType.DATE: {
					const galaxy = action.item;
					galaxy.lastModificationDate = action.value;
					if (galaxy.lastModificationDate != galaxy.date) {
						galaxy.needToSave = true;
					} else {
						galaxy.needToSave = false;
					}
				}
			}
		});
	}
}

export function rollforward(galaxy: Task) {
	if (galaxy.bkpsForward!.length == 0) return;
	const step: BackupStep = galaxy.bkpsForward!.pop()!;
	galaxy.bkps!.push(step);
	playBackupActions(step.rollforward);
}

export function rollback(galaxy: Task) {
	if (galaxy.bkps!.length == 0) return;
	const step: BackupStep = galaxy.bkps!.pop()!;
	galaxy.bkpsForward!.push(step);
	playBackupActions(step.rollback);
}
