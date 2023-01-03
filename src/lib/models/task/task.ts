import moment from 'moment';
import { Subject } from 'rxjs';
import { BackupActionType, BackupStep, type IBackupAction } from '$models/backup';
import { SaveLocation, SaveStatus, TaskChange, TaskColor, TaskType } from './task-enums';
import type {
	IComment,
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
import {
	injectGalaxyMethods,
	injectMoonMethods,
	injectPlanetMethods,
	injectSectorMethods,
	injectSystemMethods,
	updateGalaxyStats
} from './task-utils';

/**
 * A task is the basic building block, it represents either a galaxy, a sector, a system, a planet, or a moon
 */
export class Task {
	///////////////////////////////////////////
	// ATTRIBUTES
	///////////////////////////////////////////
	public changes$ = new Subject<TaskChange>();
	public id: string;
	public name: string;
	public description: string;
	public type?: TaskType;
	public order: number;
	public priority: number;
	public checked: boolean;
	public encrypted = false;
	public children: Task[] = [];
	public labels = new Set<string>();
	public comments: IComment[] = [];

	public content: string;

	public closed: boolean;
	public setClosed(value: boolean): void {
		this.closed = value;
		if (true === value) {
			this.children.forEach((child: Task) => {
				child.setClosed(true);
			});
		}
	}

	public data?: IMoon | IPlanet | ISystem | ISector | IGalaxy;

	public get control(): number {
		if (this.children.length == 0) {
			return this.checked ? 1 : 0;
		}
		let control = 0;
		let coef = 0;
		this.children.forEach((child) => {
			const dif = child.getDifficulty!();
			control += child.control * dif;
			coef += dif;
		});
		control = control / coef;
		if (this.type != TaskType.GALAXY) {
			control *= 0.75;
			control += this.checked ? 0.25 : 0;
		}
		return control;
	}
	//////////////////////////////////////////////////
	// TYPE-DEPENDENT METHODS
	//////////////////////////////////////////////////
	public setChecked?: (value: boolean, propagate: boolean) => void; // depends on item type;
	public getColor?: () => TaskColor;
	public getDifficulty?: () => number;
	public getGalaxy?: () => Task;
	public export?: () => ITaskData;

	//////////////////////////////////////////////////
	// TEMPLATE-RELATED ATTRIBUTES
	//////////////////////////////////////////////////
	public parent?: Task;
	public editMode = false;
	public newItemIndex?: number;
	public filtered = false;
	get draggable(): boolean {
		return !this.editMode;
	}
	get displayed(): boolean {
		return !this.filtered && this.parent !== undefined && !this.parent.closed;
	}
	public removed = true;

	//////////////////////////////////////////////////
	// GALAXY SPECIFIC ATTRIBUTES
	//////////////////////////////////////////////////
	public saveStatus?: SaveStatus;
	public saveLocation?: SaveLocation;
	public date?: string;
	public lastModificationDate?: string;
	public get editable(): boolean {
		return this.saveLocation == SaveLocation.LOCAL;
	}
	public img?: string;
	public owner?: string;
	public isOwner = false;

	//////////////////////////////////////////////////
	// BACKUP ATTRIBUTES
	//////////////////////////////////////////////////
	public bkps?: BackupStep[];
	public bkpsForward?: BackupStep[];
	public needToSave = false;

	//////////////////////////////////////////////////
	// CONSTRCUTOR
	//////////////////////////////////////////////////
	constructor(data: ITaskData, parent?: Task) {
		this.id = data.id;
		this.name = data.name;
		this.description = data.description;
		this.order = data.order;
		this.priority = data.priority;
		this.checked = !!data.checked;
		this.parent = parent;
		this.closed = !!data.closed;
		this.content = data.content;

		switch (data.type) {
			case TaskType.GALAXY:
				this.removed = false;
				injectGalaxyMethods(this, data.data as IGalaxyData);
				break;
			case TaskType.SECTOR:
				injectSectorMethods(this, data.data as ISectorData);
				break;
			case TaskType.SYSTEM:
				injectSystemMethods(this, data.data as ISystemData);
				break;
			case TaskType.PLANET:
				injectPlanetMethods(this, data.data as IPlanetData);
				break;
			default:
				injectMoonMethods(this, data.data as IMoonData);
				break;
		}

		data.comments.forEach((comment) => {
			this.comments.push({
				content: comment.content,
				time: moment(comment.time, moment.ISO_8601)
			});
		});

		data.children.forEach((childData) => {
			const child = new Task(childData, this);
			this.addChild(child);
		});
		data.labels.forEach((label) => {
			this.addLabel(label);
		});

		if (data.type == TaskType.GALAXY) {
			this.owner = data.owner;
			this.date = data.date;
			this.lastModificationDate = data.date;
			(this.data as IGalaxy).handler.computeSpaceAndTerritories();
			this.bkps = [];
			this.bkpsForward = [];
			this.needToSave = false;
		}
	}

	//////////////////////////////////////////////////
	// PUBLIC METHODS
	//////////////////////////////////////////////////
	public propagateRemoved(removed: boolean) {
		this.removed = removed;
		this.children.forEach((child) => {
			child.propagateRemoved(removed);
		});
	}

	public sortChildren(): void {
		this.children.sort((a, b) => a.order - b.order);
	}

	public addChild(item: Task, sort = true): void {
		if (item.order === null || item.order === undefined) {
			// does not have an order
			item.order = this.children.length;
		} else if (sort) {
			// has an order, anthing after it needs to be pushed
			for (let i = item.order; i < this.children.length; i++) {
				this.children[i].order = i + 1;
			}
		}

		item.parent = this;
		if (!item.checked) {
			this.setChecked!(false, false);
		}

		this.children.push(item);
		if (sort) {
			this.sortChildren();
		}

		item.propagateRemoved(this.removed);

		if (!item.removed) {
			// prevent a null from getGalaxy if we are in the middle of changing parents
			const galaxy = this.getGalaxy!() ? this.getGalaxy!() : item.getGalaxy!();
			// update galaxy stats and graph if necessary
			updateGalaxyStats(galaxy, item, true); // adding
		}
	}

	public removeChild(item: Task, sort = true): void {
		const itemIdx = this.children.findIndex((i) => i === item);
		this.children.splice(itemIdx, 1);
		// Change children order
		if (sort) {
			this.children.forEach((item, idx) => {
				item.order = idx;
			});
		}
		if (!item.removed) {
			// prevent a null from getGalaxy if we are in the middle of changing parents
			const galaxy = this.getGalaxy!() ? this.getGalaxy!() : item.getGalaxy!();
			// update galaxy stats and graph if necessary
			updateGalaxyStats(galaxy, item, false);
		}
		item.propagateRemoved(true);
	}

	public addLabel(label: string): void {
		this.labels.add(label);
		// Add this label to the overall set of labels if it does not exist already
		const labelSet = (this.getGalaxy!().data as IGalaxy).labelSet;
		const labelObject = labelSet.find((l) => l.label == label);
		if (!labelObject) {
			labelSet.push({ label, active: false });
		}
	}

	public removeLabel(label: string) {
		this.labels.delete(label);
	}

	public getFlattenedChildren(): Task[] {
		let children: Task[] = [];
		this.children.forEach((child) => {
			children.push(child);
			children = children.concat(child.getFlattenedChildren());
		});
		return children;
	}

	public getNbrChildren(openOnly = false): number {
		if (openOnly && this.closed) return 0;
		let nbr = this.children.length;
		this.children.forEach((child) => {
			nbr += child.getNbrChildren();
		});
		return nbr;
	}

	public getNbrDirectChildrenChecked(): number {
		let nbr = 0;
		this.children.forEach((child) => {
			if (child.checked) nbr++;
		});
		return nbr;
	}

	public getTypeText(): string {
		switch (this.type) {
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

	public morphToDreadType(
		type: TaskType,
		newParent: Task
	): { rollback: IBackupAction[]; rollforward: IBackupAction[] } {
		let rollback: IBackupAction[] = [
			{
				item: this,
				value: { type: this.type, parent: this.parent },
				type: BackupActionType.TYPE
			},
			{ item: this, value: this.checked, type: BackupActionType.CHECKED } // in case the new parent is checked and the item is not
		];
		let rollforward: IBackupAction[] = [
			{
				item: this,
				value: { type, parent: newParent },
				type: BackupActionType.TYPE
			}
		];
		// the item to be mortphed need to keep a reference to the current parent.
		// a backup of the removal from the old parent need to have been added before we get here
		// Remove -> type -> add
		this.parent = newParent; // changing parents
		switch (type) {
			case TaskType.MOON:
				injectMoonMethods(this);
				break;
			case TaskType.PLANET:
				injectPlanetMethods(this);
				break;
			case TaskType.SYSTEM:
				injectSystemMethods(this);
				break;
			case TaskType.SECTOR:
				injectSectorMethods(this);
				break;
			case TaskType.GALAXY:
				// should never happen;
				throw new Error('Morphing to a galaxy is not allowed.');
		}
		if (this.children.length > 0) {
			const children = [...this.children];
			if (type >= TaskType.MOON) {
				// Max level is 4 so children need to change parent
				let order = this.order + 1;
				children.forEach((child) => {
					rollback.push({
						item: newParent,
						value: child,
						type: BackupActionType.REMOVE_CHILD
					});
					rollforward.push({
						item: this,
						value: child,
						type: BackupActionType.REMOVE_CHILD
					});

					const childNbrChildren = child.getNbrChildren(false);
					this.removeChild(child, false); // remove child and don't sort

					rollback.push({
						item: child,
						value: child.order,
						type: BackupActionType.ORDER
					});
					child.order = order;
					rollforward.push({
						item: child,
						value: child.order,
						type: BackupActionType.ORDER
					});

					const childBkpStep = child.morphToDreadType(TaskType.MOON, newParent);
					rollback = rollback.concat(childBkpStep.rollback);
					rollforward = rollforward.concat(childBkpStep.rollforward);

					rollback.push({
						item: this,
						value: child,
						type: BackupActionType.ADD_CHILD
					});
					rollforward.push({
						item: newParent,
						value: child,
						type: BackupActionType.ADD_CHILD
					});

					newParent.addChild(child, false); // and don't sort
					order += childNbrChildren + 1;
				});
			} else {
				let order = 0;
				children.forEach((child) => {
					const nbrChildChildren = child.getNbrChildren(false);

					rollback.push({
						item: this,
						value: child,
						type: BackupActionType.REMOVE_CHILD
					});
					rollforward.push({
						item: this,
						value: child,
						type: BackupActionType.REMOVE_CHILD
					});

					this.removeChild(child, false);

					rollback.push({
						item: child,
						value: child.order,
						type: BackupActionType.ORDER
					});
					child.order = order;
					rollforward.push({
						item: child,
						value: child.order,
						type: BackupActionType.ORDER
					});

					const childBkpStep = child.morphToDreadType(type + 1, this);
					rollback = rollback.concat(childBkpStep.rollback);
					rollforward = rollforward.concat(childBkpStep.rollforward);

					rollback.push({
						item: this,
						value: child,
						type: BackupActionType.ADD_CHILD
					});
					rollforward.push({
						item: this,
						value: child,
						type: BackupActionType.ADD_CHILD
					});

					this.addChild(child, false);
					order += nbrChildChildren + 1; // +1 is for his previous sibling
				});
			}
		}
		this.sortChildren();
		return { rollback, rollforward };
	}

	public partialExport(): ITaskData {
		const data: ITaskData = {
			id: this.id,
			name: this.name,
			description: this.description,
			checked: this.checked,
			priority: this.priority,
			type: this.type!,
			closed: this.closed,
			encrypted: this.encrypted,
			order: this.order,
			children: [],
			labels: [],
			comments: [],
			content: this.content,
			data: {}
		};
		this.labels.forEach((label) => {
			data.labels.push(label);
		});
		this.children.forEach((child) => {
			const childData = child.export!();
			data.children.push(childData);
		});
		this.comments.forEach((comment: IComment) => {
			data.comments.push({
				content: comment.content,
				time: comment.time.toISOString()
			});
		});
		return data;
	}

	//////////////////////////////////////////////////
	// BACKUP METHODS
	//////////////////////////////////////////////////
	public backupChecked(check: boolean): BackupStep {
		const step = new BackupStep();
		this.children.forEach((child) => {
			const childBkp = child.backupChecked(check);
			step.addAllRollback(childBkp.rollback);
			step.addAllRollforward(childBkp.rollforward);
		});
		step.addRollback({
			item: this,
			value: this.checked,
			type: BackupActionType.CHECKED
		});
		step.addRollforward({
			item: this,
			value: check,
			type: BackupActionType.CHECKED
		});
		return step;
	}
}
