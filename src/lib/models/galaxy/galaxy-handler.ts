import { TaskChange, type IGalaxyData, type ISystem, type Task } from '../task';
import { computeShapes, DEG_TO_RAD, type ICoords, Vec2D, SpaceHandler } from '../space';

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
	fromSystem: Task;
	toSystem: Task;
}

export class GalaxyHandler {
	private galaxy?: Task;
	public systems: Task[] = [];
	public sectors: Task[] = [];
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

	public initForGalaxy(galaxy: Task) {
		this.galaxy = galaxy;
		const data = galaxy.data as IGalaxyData;
		this.angleOffset = data.angleOffset;
		this.nbrDust = 10000;
		this.dustSize = 10;
		this.seed = data.seed;
		this.arms = [{ delta: 0 }];
		if (data.nbrArms <= 2) {
			this.arms.push({ delta: Math.PI });
			this.a = (SIZE / 2 - 10) * 2 * Math.PI;
			this.b = -10;
		} else {
			this.arms.push({ delta: 120 * DEG_TO_RAD });
			this.arms.push({ delta: 240 * DEG_TO_RAD });
			this.a = (SIZE / 2 - 10) * 2 * Math.PI;
			this.b = -10;
		}
		this.random = Math.random;
		this.init();
	}

	public init() {
		this.initStarsAndDust();
	}

	public initStarsAndDust(): void {
		this.stars = [];
		this.dust = [];
		const centerX = SIZE / 2;
		const centerY = SIZE / 2;
		const A = (SIZE / 2 - 20) / (2 * Math.PI);
		const B = 0;

		const nbrDustPerArm = Math.ceil(this.nbrDust / this.arms.length);
		const nbrDustPerDeg = Math.ceil(nbrDustPerArm / 360);

		const increment = 1 * DEG_TO_RAD;
		this.arms.forEach((arm) => {
			const delta = arm.delta;
			let angle = 0;
			const max = 2 * Math.PI;
			while (angle <= max) {
				const r = A * angle;
				const theta =
					angle - delta + this.angleOffset + (2 * 120 * Math.random() - 120) * DEG_TO_RAD;
				const x = r * Math.cos(theta) + centerX + B;
				const y = r * Math.sin(theta) + centerX + B;
				const temp = 6000 + (4000 * this.random() - 2000);
				// let color = colorFromTemperature(temp);
				const color = { r: 1, b: 1, g: 1, a: 1 };
				const mag = 0.1 + 1 * this.random();
				const size = mag * 3.0;
				const star: ISpaceParticle = {
					x,
					y,
					color: {
						r: color.r * mag,
						g: color.g * mag,
						b: color.b * mag,
						a: color.a
					},
					size,
					type: 0.0
				};
				this.stars.push(star);

				for (let i = 0; i < nbrDustPerDeg; i++) {
					const theta =
						angle - delta + this.angleOffset + (2 * 50 * Math.random() - 50) * DEG_TO_RAD;
					const x = r * Math.cos(theta) + centerX + B;
					const y = r * Math.sin(theta) + centerY + B;
					const temp = 8000;
					// let color = colorFromTemperature(temp);
					const color = { r: 1, b: 1, g: 1, a: 1 };
					const mag = 0.02 + 0.15 * this.random();
					const size = mag * 5 * this.dustSize;
					const dustParticle: ISpaceParticle = {
						x,
						y,
						color: {
							r: color.r * mag,
							g: color.g * mag,
							b: color.b * mag,
							a: color.a
						},
						size,
						type: 1.0
					};
					this.dust.push(dustParticle);
				}
				angle += increment;
			}
		});
	}

	public getParticlesData(): {
		position: number[];
		color: number[];
		size: number[];
		type: number[];
	} {
		const position: number[] = [];
		const color: number[] = [];
		const size: number[] = [];
		const type: number[] = [];
		const particles = this.dust.concat(this.stars);
		// const particles = this.dust;

		particles.forEach((p) => {
			if (p.x >= 0 && p.x <= SIZE && p.y >= 0 && p.y <= SIZE) {
				position.push(p.x);
				position.push(p.y);
				color.push(p.color.r);
				color.push(p.color.g);
				color.push(p.color.b);
				// color.push(p.color.a);
				size.push(p.size);
				type.push(p.type);
			}
		});
		return { position, color, size, type };
	}

	public async computeSystemPositions() {
		let nbrSystems = 1;
		this.galaxy!.children.forEach((sector) => {
			nbrSystems += sector.children.length;
		});

		const points: ICoords[] = [];

		const centerX = SIZE / 2;
		const centerY = SIZE / 2;
		const A = (SIZE / 2 - 20) / (2 * Math.PI);
		const B = 0;

		const nbrSystemsPerArm = Math.ceil(nbrSystems / this.arms.length) + 1;
		const increment = (360 * DEG_TO_RAD) / nbrSystemsPerArm;

		this.arms.forEach((arm) => {
			let angle = increment;
			const delta = arm.delta;
			for (let i = 1; i < nbrSystemsPerArm; i++) {
				const r = A * angle;
				const theta = angle - delta + this.angleOffset + (2 * 50 * Math.random() - 50) * DEG_TO_RAD;
				const x = r * Math.cos(theta) + centerX + B;
				const y = r * Math.sin(theta) + centerX + B;
				points.push({ x, y });
				angle += increment;
			}
		});

		const ordredPoints = points.splice(0, 1);
		this.orderPoints(points, ordredPoints);
		let idx = 0;
		this.galaxy!.children.forEach((sector) => {
			sector.children.forEach((system) => {
				const position = ordredPoints[idx];
				(system.data as ISystem).coords = new Vec2D(position.x, position.y);
				idx++;
				system.changes$.next(TaskChange.COORDS);
			});
		});
	}

	private orderPoints(points: { x: number; y: number }[], ordered: { x: number; y: number }[]) {
		if (points.length == 0) return;

		const reference = ordered[ordered.length - 1];
		let closestDistence = Infinity;
		let closestIndex: number;
		for (let i = 0; i < points.length; i++) {
			const x = reference.x - points[i].x;
			const y = reference.y - points[i].y;
			const distance = x * x + y * y;
			if (distance < closestDistence) {
				closestDistence = distance;
				closestIndex = i;
			}
		}
		ordered.push(points.splice(closestIndex!, 1)[0]);
		this.orderPoints(points, ordered);
	}

	public async computeSpaceAndTerritories() {
		this.sectors.splice(0, this.sectors.length);
		this.systems.splice(0, this.systems.length);
		this.links.splice(0, this.links.length);
		this.galaxy!.children.forEach((sector) => {
			this.sectors.push(sector);
			let previousSystem: Task;
			sector.children.forEach((system) => {
				this.systems.push(system);
				if (!previousSystem) {
					previousSystem = system;
				} else {
					const link = {
						id: previousSystem.id + system.id,
						fromSystem: previousSystem,
						toSystem: system
					};
					this.links.push(link);
					previousSystem = system;
				}
			});
		});
		this.spaceHandler.computeTerritories(this.systems);
		this.sectors.forEach((sector) => {
			computeShapes(sector);
		});
	}
}
