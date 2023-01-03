import type { ITaskData } from '$models/task';
import Dexie, { type Table } from 'dexie';

export class Storage extends Dexie {
	galaxies!: Table<ITaskData>;

	constructor() {
		super('mnemofy');
		this.version(1).stores({
			galaxies: 'id'
		});
	}

	public async getLocalGalaxiesData(): Promise<ITaskData[]> {
		if (!this.isOpen()) {
			await this.open();
		}
		return this.galaxies.toArray();
	}
}

export const StorageService = new Storage();
