import { Store } from './store';
import type { Multiverse } from '$models/multiverse';

export class MultiverseStore extends Store<Multiverse> {
	constructor() {
		super();
	}
}

export const multiverseStore = new MultiverseStore();
