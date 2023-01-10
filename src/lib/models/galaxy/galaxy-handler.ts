import { SpaceHandler, type ICoords } from '$models/space';
import type { Galaxy, Sector, System } from '$models/task';

export interface Color {
	r: number;
	g: number;
	b: number;
	a: number;
}

interface Arm {
	delta: number;
}

export interface ISpaceParticle extends ICoords {
	size: number;
	color: Color;
	type: number;
}

export const SIZE = 2000;

export interface Link {
	id: string;
	fromSystem: System;
	toSystem: System;
}

export class GalaxyHandler {
	private galaxy?: Galaxy;
	public systems: System[] = [];
	public sectors: Sector[] = [];
	public links: Link[] = [];

	public spaceHandler: SpaceHandler = new SpaceHandler(SIZE, SIZE);

	public arms: Arm[] = [];
	public angleOffset = 0;
	public nbrDust = 0;
	public dustSize = 0;

	private stars: ISpaceParticle[] = [];
	private dust: ISpaceParticle[] = [];

	public seed = 1;

	public a = 0;
	public b = 0;

	public random: () => number = Math.random;

	public initForGalaxy(galaxy: Galaxy) {
		this.galaxy = galaxy;
	}
}
