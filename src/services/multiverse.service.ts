import { v4 as uuid } from 'uuid';
import { Multiverse } from '$models/multiverse';
import { GalaxyStore } from '../stores/galaxy.store';
import { MultiversesStore, MultiverseStore } from '../stores/multiverse.store';

import { StorageService } from './storage.service';
import { GalaxyTheme, GalaxyType, SaveLocation, Task, TaskColor, TaskType } from '$models/task';

export class MultiverseService {
	public multiverses$ = new MultiversesStore();
	public multiverse$ = new MultiverseStore();
	public galaxy$ = new GalaxyStore();

	constructor() {}

	public async getLocalGalaxies() {
		console.log('getting local galaxies');
		const multiverses: Multiverse[] = [];
		if (this.multiverses$.get()!.length > 0) {
			console.log('no current multiverses');
			return;
		}
		const localGalaxies = await StorageService.getLocalGalaxiesData();
		for (let data of localGalaxies) {
			const galaxy = new Task(data);
			const multiverse = new Multiverse(galaxy.id);
			multiverses.push(multiverse);
		}
		this.multiverses$.set(multiverses);
	}

	public setMultiverseAndActivateGalaxy(multiverse: Multiverse, location: SaveLocation) {
		this.multiverse$.set(multiverse);
		this.activateGalaxyOfCurrentMultiverse(location);
	}

	public activateGalaxyOfCurrentMultiverse(location: SaveLocation) {
		const multiverse = this.multiverse$.get()!;
		if (location === SaveLocation.LOCAL) {
			this.galaxy$.set(multiverse.local);
		} else {
			this.galaxy$.set(multiverse.server);
		}
	}

	public createGalaxy(name: string): Task {
		return new Task({
			id: uuid(),
			name,
			description: '',
			order: 0,
			type: TaskType.GALAXY,
			closed: false,
			encrypted: false,
			checked: false,
			data: {
				color: TaskColor.VIOLET,
				seed: 1,
				theme: GalaxyTheme.BTL,
				discoverable: false,
				angleOffset: 0,
				nbrArms: 3,
				type: GalaxyType.PROJECT
			},
			priority: 1,
			children: [],
			comments: [],
			labels: [],
			content: ''
		});
	}
}

export const multiverseService = new MultiverseService();
