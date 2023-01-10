import { v4 as uuid } from 'uuid';
import { Multiverse } from '$models/multiverse';
import { GalaxyStore } from '../stores/galaxy.store';
import { MultiversesStore, MultiverseStore } from '../stores/multiverse.store';

import { storageService } from './storage.service';
import { createGalaxy, exportData, SaveLocation, SaveStatus, type GalaxyData } from '$models/task';
import { goto } from '$app/navigation';

export class MultiverseService {
	public multiverses = new MultiversesStore();
	public multiverse = new MultiverseStore();
	public galaxy = new GalaxyStore();

	private loadedLocalGalaxies = false;

	constructor() {}

	public async getLocalGalaxies(): Promise<void> {
		if (this.loadedLocalGalaxies) return;
		const multiverses: Multiverse[] = [];
		const localGalaxies = await storageService.getLocalGalaxiesData();
		for (let data of localGalaxies) {
			const galaxy = createGalaxy(data);
			const multiverse = new Multiverse(galaxy.id);
			multiverse.local = galaxy;
			multiverses.push(multiverse);
		}
		this.multiverses.upsert(multiverses);
		this.loadedLocalGalaxies = true;
	}

	public setMultiverseAndActivateGalaxy(
		multiverse: Multiverse,
		location: SaveLocation = SaveLocation.LOCAL
	): void {
		console.log('got multiverse', multiverse);
		this.multiverse.set(multiverse);
		this.activate(location);
		if (location === SaveLocation.LOCAL) {
			goto(`/overview/${this.multiverse.get()!.local.id}`);
		} else {
			goto(`/overview/${this.multiverse.get()!.server.id}`);
		}
	}

	public async loadGalaxyIfNeeded(id: string): Promise<void> {
		if (this.multiverse.id !== id) {
			if (!this.loadedLocalGalaxies) {
				await this.getLocalGalaxies();
			}
			const multiverseStore = this.multiverses.get()?.find((m) => m.id === id);
			const galaxy = multiverseStore?.get()?.local;
			// TODO: go to server to try and fetch the galaxy if it is not in local
			this.multiverse.set(multiverseStore?.get());
			this.galaxy.set(galaxy);
		}
	}

	public activate(location: SaveLocation) {
		console.log('activating galaxy');
		if (location === SaveLocation.LOCAL) {
			console.log('currentMultiverse', this.multiverse.get());
			this.galaxy.set(this.multiverse.get()!.local);
		} else {
			this.galaxy.set(this.multiverse.get()!.server);
		}
	}

	public async saveCurrentGalaxyToLocal() {
		const galaxy = this.galaxy.get();
		if (galaxy) {
			const data = exportData(galaxy) as GalaxyData;
			console.log('data to save ', data);
			await storageService.save(data);
		}
	}

	public computeSaveStatus(): void {
		const multiverse = this.multiverse.get();
		if (multiverse === undefined) return;
		if (multiverse.server === undefined && multiverse.local === undefined) {
			return;
		} else if (multiverse.server !== undefined && multiverse.local === undefined) {
			multiverse.server.saveStatus = SaveStatus.NO_COPY;
		} else if (multiverse.server === undefined && multiverse.local !== undefined) {
			multiverse.local.saveStatus = SaveStatus.NO_COPY;
		} else if (multiverse.server.date === undefined && multiverse.local.date === undefined) {
			multiverse.server.saveStatus = SaveStatus.SAME;
			multiverse.local.saveStatus = SaveStatus.SAME;
		} else if (multiverse.server.date === undefined) {
			multiverse.server.saveStatus = SaveStatus.BEHIND;
			multiverse.local.saveStatus = SaveStatus.AHEAD;
		} else if (multiverse.local.date === undefined) {
			multiverse.server.saveStatus = SaveStatus.AHEAD;
			multiverse.local.saveStatus = SaveStatus.BEHIND;
		} else if (multiverse.server.date < multiverse.local.date) {
			multiverse.server.saveStatus = SaveStatus.BEHIND;
			multiverse.local.saveStatus = SaveStatus.AHEAD;
		} else if (multiverse.server.date > multiverse.local.date) {
			multiverse.server.saveStatus = SaveStatus.AHEAD;
			multiverse.local.saveStatus = SaveStatus.BEHIND;
		} else {
			multiverse.server.saveStatus = SaveStatus.SAME;
			multiverse.local.saveStatus = SaveStatus.SAME;
		}
	}
}

export const multiverseService = new MultiverseService();
