import type { Task } from '$models/task';
import { Store } from './store';

export class GalaxyStore extends Store<Task> {
	constructor() {
		super();
	}
}
