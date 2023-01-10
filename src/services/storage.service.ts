import type { GalaxyData } from '$models/task';
import Dexie, { type Table } from 'dexie';

export class Storage extends Dexie {
	galaxies!: Table<GalaxyData>;

	constructor() {
		super('mnemofy');
		this.version(1).stores({
			galaxies: 'id'
		});
	}

	public async getLocalGalaxiesData(): Promise<GalaxyData[]> {
		if (!this.isOpen()) {
			await this.open();
		}
		return this.galaxies.toArray();
	}

	public async save(data: GalaxyData) {
		await this.galaxies.put(data);
	}
}

export const storageService = new Storage();
