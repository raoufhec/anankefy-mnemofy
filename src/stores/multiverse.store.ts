import { Store } from './store';
import type { Multiverse } from '$models/multiverse';

export class MultiverseStore extends Store<Multiverse> {
	public id?: string;
	constructor(multiverse?: Multiverse) {
		super(multiverse);
		this.id = multiverse?.id;
	}

	beforeSet(value: Multiverse | undefined): void {
		this.id = value?.id;
	}
}

export class MultiversesStore extends Store<MultiverseStore[]> {
	constructor() {
		super([]);
	}

	beforeSet(value: MultiverseStore[] | undefined): void {}

	public getMultiverseStore(id: string): MultiverseStore | undefined {
		const currentMultiverses = this.get()!;
		return currentMultiverses.find((m) => m.id === id);
	}

	public add(multiverse: Multiverse): void {
		const exists = this.getMultiverseStore(multiverse.id);
		if (!exists) {
			const multiverseStore = new MultiverseStore(multiverse);
			this.update((multiverses) => {
				if (!multiverses) {
					return [multiverseStore];
				} else {
					return [...multiverses, multiverseStore];
				}
			});
		}
	}

	public upsert(multiverses: Multiverse[]): void {
		multiverses.forEach((multiverse) => {
			let multiverseStore = this.getMultiverseStore(multiverse.id);
			if (multiverseStore !== undefined) {
				// check if need to update existing one
				let multiverseValue = multiverseStore.get();
				if (multiverseValue !== undefined) {
					if (!multiverseValue.local && multiverse.local) {
						multiverseValue.local = multiverse.local;
					}
					if (!multiverseValue.server && multiverse.server) {
						multiverseValue.server = multiverse.server;
					}
				} else {
					multiverseValue = multiverse;
				}
				multiverseStore.set(multiverseValue);
			} else {
				multiverseStore = new MultiverseStore(multiverse);
				this.update((multiverseStores) => {
					if (multiverseStores !== undefined) {
						return [...multiverseStores, multiverseStore!];
					} else {
						return [multiverseStore!];
					}
				});
			}
		});
	}
}
