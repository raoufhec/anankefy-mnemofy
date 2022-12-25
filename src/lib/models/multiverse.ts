import type { Task } from './task';

/**
 * A multiverse is a set of galaxies: local version, server version, nft... etc.
 */
export interface Multiverse {
	local: Task;
	server: Task;
}
