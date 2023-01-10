import type { Task } from '$models/task/task-interfaces';

export enum BackupActionType {
	NAME,
	DESCRIPTION,
	CHECKED,
	ORDER,
	PRIORITY,
	DIFFICULTY,
	CONTENT,

	COLOR,
	PATTERN,
	EMBLEM,
	LABELS,
	COORDINATES,
	LINKS,
	THEME,

	CLOSED,
	ENCRYPTED,

	ADD_CHILD,
	REMOVE_CHILD,

	GALAXY_CHANGE,
	ITEM_CHANGE,

	DATE
}

export interface IBackupAction {
	item: Task;
	value: any;
	type: BackupActionType;
}

export class BackupStep {
	private _rollback: IBackupAction[];
	private _rollforward: IBackupAction[];

	public get rollback() {
		return this._rollback;
	}
	public get rollforward() {
		return this._rollforward;
	}

	constructor(rollback: IBackupAction[] = [], rollforward: IBackupAction[] = []) {
		this._rollback = rollback;
		this._rollforward = rollforward;
	}

	addRollback(action: IBackupAction) {
		this._rollback.push(action);
	}

	addRollforward(action: IBackupAction) {
		this.rollforward.push(action);
	}

	addAllRollback(actions: IBackupAction[]) {
		actions.forEach((action) => {
			this.addRollback(action);
		});
	}

	addAllRollforward(actions: IBackupAction[]) {
		actions.forEach((action) => {
			this.addRollforward(action);
		});
	}
}
