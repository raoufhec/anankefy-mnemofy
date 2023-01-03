import { SaveLocation, SaveStatus, type Task } from './task';

/**
 * A multiverse is a set of galaxies: local version, server version, nft... etc.
 */
export class Multiverse {
	id: string;
	local?: Task;
	server?: Task;

	constructor(id: string) {
		this.id = id;
	}

	public setLocalGalaxy(galaxy: Task): void {
		this.local = galaxy;
		galaxy.saveLocation = SaveLocation.LOCAL;
		this.computeSaveStatus();
	}

	public setServerGalaxy(galaxy: Task): void {
		this.server = galaxy;
		galaxy.saveLocation = SaveLocation.SERVER;
		this.computeSaveStatus();
	}

	public computeSaveStatus() {
		if (this.server === undefined && this.local === undefined) {
			return;
		} else if (this.server !== undefined && this.local === undefined) {
			this.server.saveStatus = SaveStatus.NO_COPY;
		} else if (this.server === undefined && this.local !== undefined) {
			this.local.saveStatus = SaveStatus.NO_COPY;
		} else if (this.server!.date === undefined && this.local!.date === undefined) {
			this.server!.saveStatus = SaveStatus.SAME;
			this.local!.saveStatus = SaveStatus.SAME;
		} else if (this.server!.date === undefined) {
			this.server!.saveStatus = SaveStatus.BEHIND;
			this.local!.saveStatus = SaveStatus.AHEAD;
		} else if (this.local!.date === undefined) {
			this.server!.saveStatus = SaveStatus.AHEAD;
			this.local!.saveStatus = SaveStatus.BEHIND;
		} else if (this.server!.date < this.local!.date) {
			this.server!.saveStatus = SaveStatus.BEHIND;
			this.local!.saveStatus = SaveStatus.AHEAD;
		} else if (this.server!.date > this.local!.date) {
			this.server!.saveStatus = SaveStatus.AHEAD;
			this.local!.saveStatus = SaveStatus.BEHIND;
		} else {
			this.server!.saveStatus = SaveStatus.SAME;
			this.local!.saveStatus = SaveStatus.SAME;
		}
	}
}
