import { Store } from './store';
import type { Multiverse } from '$models/multiverse';

export class MultiverseStore extends Store<Multiverse> {
	constructor() {
		super();
	}
}

export class MultiversesStore extends Store<Multiverse[]> {
	constructor() {
		super([]);
	}

	public add(multiverse: Multiverse): void {
		this.update((multiverses) => {
			if (!multiverses) {
				return [multiverse];
			} else {
				return [...multiverses, multiverse];
			}
		});
	}
}
