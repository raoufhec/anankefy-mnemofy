import { BackupActionType, BackupStep, type IBackupAction } from './backup';
import moment from 'moment';
import {
	addChild,
	removeChild,
	SaveStatus,
	setChecked,
	setClosed,
	type Galaxy,
	type Planet,
	type Sector,
	type System
} from '$models/task';

const MAX_BKP_LENGTH = 9;

export function backup(galaxy: Galaxy, step: BackupStep) {
	step.addRollback({
		item: galaxy,
		value: galaxy.lastModificationDate,
		type: BackupActionType.DATE
	});
	galaxy.lastModificationDate = moment();
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
					setChecked(action.item, action.value, false);
					break;
				case BackupActionType.ORDER:
					action.item.order = action.value;
					break;
				case BackupActionType.PRIORITY:
					action.item.priority = action.value;
					break;
				case BackupActionType.DIFFICULTY:
					(action.item as Planet).difficulty = action.value;
					break;

				case BackupActionType.CONTENT:
					action.item.content = action.value;
					break;

				case BackupActionType.COLOR:
					(action.item as Sector | Galaxy).color = action.value;
					break;
				case BackupActionType.PATTERN:
					(action.item as Sector).pattern = action.value;
					break;
				case BackupActionType.EMBLEM:
					(action.item as Sector).emblem = action.value;
					break;
				case BackupActionType.LABELS:
					// action.item.labels.clear();
					// action.value.forEach((label: string) => action.item.addLabel(label));
					break;
				case BackupActionType.COORDINATES:
					(action.item as System).coords = action.value;
					break;
				case BackupActionType.LINKS:
					break;

				case BackupActionType.CLOSED:
					setClosed(action.item, action.value);
					break;
				case BackupActionType.ENCRYPTED:
					action.item.encrypted = action.value;
					break;

				case BackupActionType.ADD_CHILD:
					addChild(action.item, action.value);
					break;
				case BackupActionType.REMOVE_CHILD:
					removeChild(action.item, action.value);
					break;

				case BackupActionType.GALAXY_CHANGE:
				case BackupActionType.ITEM_CHANGE:
					action.item.changes$.set(action.value);
					break;

				case BackupActionType.THEME:
					(action.item as Galaxy).theme = action.value;
					break;

				case BackupActionType.DATE: {
					const galaxy = action.item as Galaxy;
					galaxy.lastModificationDate = action.value;
					if (galaxy.lastModificationDate != galaxy.date) {
						galaxy.saveStatus = SaveStatus.NEED_TO_SAVE;
					}
				}
			}
		});
	}
}

export function rollforward(galaxy: Galaxy) {
	if (galaxy.bkpsForward!.length == 0) return;
	const step: BackupStep = galaxy.bkpsForward!.pop()!;
	galaxy.bkps!.push(step);
	playBackupActions(step.rollforward);
}

export function rollback(galaxy: Galaxy) {
	if (galaxy.bkps!.length == 0) return;
	const step: BackupStep = galaxy.bkps!.pop()!;
	galaxy.bkpsForward!.push(step);
	playBackupActions(step.rollback);
}
