import type { Galaxy } from './task';

/**
 * A multiverse is a set of galaxies: local version, server version, nft... etc.
 */
export class Multiverse extends Array<Galaxy> {
	id: string;

	constructor(id: string) {
		super(2);
		this.id = id;
	}

	get local(): Galaxy {
		return this[0];
	}
	set local(value: Galaxy) {
		this[0] = value;
	}
	get server(): Galaxy {
		return this[1];
	}
	set server(value: Galaxy) {
		this[1] = value;
	}
}
