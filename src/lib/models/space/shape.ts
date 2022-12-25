import { Vec2D, type ICoords } from './vec2d';
import Queue from 'tinyqueue';
import type { Owner } from './owner';

export class AbstractShape {
	public points: Vec2D[]; // clockwise points
	public inverse: Vec2D[][]; // counter-clockwise points;
	protected min?: Vec2D;
	protected max?: Vec2D;

	public isContained = false;

	constructor() {
		this.points = [];
		this.inverse = [];
	}

	public getMinX() {
		if (!this.min) {
			this.computeMin();
		}
		return this.min!.x;
	}

	public getMinY() {
		if (!this.min) {
			this.computeMin();
		}
		return this.min!.y;
	}

	public getMaxX() {
		if (!this.max) {
			this.computeMax();
		}
		return this.max!.x;
	}

	public getMaxY() {
		if (!this.max) {
			this.computeMax();
		}
		return this.max!.y;
	}

	public contains(shape: AbstractShape) {
		return (
			this.getMinX() < shape.getMinX() &&
			this.getMinY() < shape.getMinY() &&
			this.getMaxX() > shape.getMaxX() &&
			this.getMaxY() > shape.getMaxY()
		);
	}

	public computeMin() {
		const points = [...this.points];
		points.sort((a, b) => a.x - b.x);
		this.min = new Vec2D(0, 0);
		this.min.x = points[0].x;
		points.sort((a, b) => a.y - b.y);
		this.min.y = points[0].y;
	}

	public computeMax() {
		const points = [...this.points];
		points.sort((b, a) => a.x - b.x);
		this.max = new Vec2D(0, 0);
		this.max.x = points[0].x;
		points.sort((b, a) => a.y - b.y);
		this.max.y = points[0].y;
	}
}

export class TerritoryShape extends AbstractShape {
	owner: Owner;

	constructor(owner: Owner) {
		super();
		this.owner = owner;
	}
}

/* Algorithm for titlePosition&TitleSize from: https://github.com/mapbox/polylabel */
const PRECISION = 100.0;

const getCentroidCell = (shape: BorderShape) => {
	let area = 0;
	let x = 0;
	let y = 0;
	const points = shape.points;
	// find the centroid
	for (let i = 0, len = points.length, j = len - 1; i < len; j = i++) {
		const a = points[i];
		const b = points[j];
		const f = a.x * b.y - b.x * a.y;
		x += (a.x + b.x) * f;
		y += (a.y + b.y) * f;
		area += f * 3;
	}
	if (area === 0) return new Cell(points[0].x, points[0].y, 0, shape);
	return new Cell(x / area, y / area, 0, shape);
};

// get squared distance from a point to a segement
const getSegDistSq = (px: number, py: number, a: ICoords, b: ICoords) => {
	let x = a.x;
	let y = a.y;
	let dx = b.x - x;
	let dy = b.y - y;
	if (dx !== 0 || dy !== 0) {
		const t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy);
		if (t > 1) {
			x = b.x;
			y = b.y;
		} else if (t > 0) {
			x += dx * t;
			y += dy * t;
		}
	}
	dx = px - x;
	dy = py - y;
	return dx * dx + dy * dy;
};

// Signed distance from point to shape outline (negative if point is outside)
const pointToPolygonDist = (x: number, y: number, shape: BorderShape) => {
	let inside = false;
	let minDistSq = Infinity;

	const rings = [shape.points].concat(shape.inverse);
	for (let k = 0; k < rings.length; k++) {
		const ring = rings[k];
		for (let i = 0, len = ring.length, j = len - 1; i < len; j = i++) {
			const a = ring[i];
			const b = ring[j];

			if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x)
				inside = !inside;

			minDistSq = Math.min(minDistSq, getSegDistSq(x, y, a, b));
		}
	}
	return minDistSq === 0 ? 0 : (inside ? 1 : -1) * Math.sqrt(minDistSq);
};

class Cell {
	x: number;
	y: number;
	radius: number;
	distance: number;
	max: number;
	constructor(x: number, y: number, radius: number, shape: BorderShape) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.distance = pointToPolygonDist(x, y, shape); // distance from cell center to shape
		this.max = this.distance + this.radius * Math.SQRT2; // max distance to shape within a cell
	}
}

export class BorderShape extends AbstractShape {
	public titlePosition?: Vec2D;
	public titleSize?: number;

	constructor() {
		super();
	}

	computeTitlePositionSize() {
		const size = this.max!.clone();
		size.x -= this.min!.x;
		size.y -= this.min!.y;
		const cellSize = Math.min(size.x, size.y);
		let radius = cellSize / 2;

		let nbrIterations = 0;

		if (cellSize === 0) {
			this.titlePosition = this.min!.clone();
			this.titleSize = 0;
		}

		const cellQueue = new Queue<Cell>(undefined, (a, b) => b.max - a.max);

		// Cover shape with initial cells;
		for (let x = this.min!.x; x < this.max!.x; x += cellSize) {
			for (let y = this.min!.y; y < this.max!.y; y += cellSize) {
				cellQueue.push(new Cell(x + radius, y + radius, radius, this));
			}
		}

		// Take centroid as the first best guess
		let bestCell = getCentroidCell(this);

		// Second guess: bounding box centroid
		const bboxCell = new Cell(this.min!.x + size.x / 2, this.min!.y + size.y / 2, 0, this);
		if (bboxCell.distance > bestCell.distance) bestCell = bboxCell;

		while (cellQueue.length) {
			nbrIterations++;
			// pick the most promising cell
			const cell = cellQueue.pop()!;
			// update the best cell if we found a better one
			if (cell.distance > bestCell.distance) bestCell = cell;

			// do not drill down further if there's no chance of a better solution
			if (cell.max - bestCell.distance <= PRECISION) continue;

			// split the cell into four cells
			radius = cell.radius / 2;
			cellQueue.push(new Cell(cell.x - radius, cell.y - radius, radius, this));
			cellQueue.push(new Cell(cell.x + radius, cell.y - radius, radius, this));
			cellQueue.push(new Cell(cell.x - radius, cell.y + radius, radius, this));
			cellQueue.push(new Cell(cell.x + radius, cell.y + radius, radius, this));
		}

		this.titlePosition = new Vec2D(bestCell.x, bestCell.y);
		this.titleSize = bestCell.distance;
	}
}
