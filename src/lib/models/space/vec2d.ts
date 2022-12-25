/**
 * Make conversion from deg to rad easier
 */
export const DEG_TO_RAD = Math.PI / 180.0;

/**
 * Coodinates interface
 */
export interface ICoords {
	x: number;
	y: number;
}

/**
 * Class to handle vectors in 2D
 */
export class Vec2D extends Float32Array implements ICoords {
	constructor(x: number, y: number) {
		super(2);
		this[0] = x;
		this[1] = y;
	}

	get x(): number {
		return this[0];
	}
	set x(value: number) {
		this[0] = value;
	}

	get y(): number {
		return this[1];
	}
	set y(value: number) {
		this[1] = value;
	}

	public clone(): Vec2D {
		return new Vec2D(this.x, this.y);
	}
}
