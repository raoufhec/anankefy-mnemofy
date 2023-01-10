import type { Galaxy } from '$models/task';
import { Store } from './store';

export class GalaxyStore extends Store<Galaxy> {
	public id?: string;
	constructor(value?: Galaxy) {
		super(value);
	}
	beforeSet(value: Galaxy | undefined): void {
		if (value) {
			this.id = value.id;
		}
	}
}
