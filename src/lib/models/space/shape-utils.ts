import type { Task, ISector } from '$models/task';
import { Owner } from './owner';
import { BorderShape, TerritoryShape, type AbstractShape } from './shape';
import type { Vec2D } from './vec2d';

const checkOverlap = function (shapes: AbstractShape[]): AbstractShape[] {
	const nonOverlapShapes: AbstractShape[] = [];
	shapes.sort((a, b) => a.getMinX() - b.getMinX());
	shapes.forEach((mainShape) => {
		mainShape.computeMax();
		mainShape.computeMin();
		if (!mainShape.isContained) {
			shapes.forEach((shape) => {
				if (mainShape.contains(shape)) {
					mainShape.inverse.push(shape.points);
					shape.isContained = true;
				}
			});
			nonOverlapShapes.push(mainShape);
		}
	});
	return nonOverlapShapes;
};

function buildBorder(points: Map<Vec2D, Vec2D>): BorderShape[] {
	const shapes = [];
	if (points.size <= 0) return [];

	let startingPoint = null;
	let currentPoint = null;
	let shape: BorderShape;

	while (points.size > 0) {
		if (!startingPoint) {
			startingPoint = points.keys().next().value;
			currentPoint = startingPoint;
			shape = new BorderShape();
			shape.points.push(startingPoint);
			shapes.push(shape);
		}
		const nextPoint = points.get(currentPoint);
		if (nextPoint === undefined || nextPoint === startingPoint) {
			// we closed the shape
			points.delete(currentPoint);
			startingPoint = null;
		} else {
			points.delete(currentPoint);
			shape!.points.push(nextPoint);
			currentPoint = nextPoint;
		}
	}
	const nonOverlapShapes = checkOverlap(shapes) as BorderShape[];
	nonOverlapShapes.forEach((shape) => shape.computeTitlePositionSize());
	return nonOverlapShapes;
}

function buildShapes(points: Map<Vec2D, Vec2D>, owner: Owner): TerritoryShape[] {
	const shapes = [];
	if (points.size <= 0) return [];

	let startingPoint = null;
	let currentPoint = null;
	let shape: TerritoryShape;

	while (points.size > 0) {
		if (!startingPoint) {
			startingPoint = points.keys().next().value;
			currentPoint = startingPoint;
			shape = new TerritoryShape(owner);
			shape.points.push(startingPoint);
			shapes.push(shape);
		}
		const nextPoint = points.get(currentPoint);
		if (nextPoint === undefined || nextPoint === startingPoint) {
			// we closed the shape
			points.delete(currentPoint);
			startingPoint = null;
		} else {
			points.delete(currentPoint);
			shape!.points.push(nextPoint);
			currentPoint = nextPoint;
		}
	}
	const nonOverlapShapes = checkOverlap(shapes) as TerritoryShape[];
	return nonOverlapShapes;
}

export function reset(sector: Task) {
	const data = sector.data as ISector;
	data.points.clear();
	data.userPoints.clear();
	data.borderPoints.clear();
}

export function add(sector: Task, a: Vec2D, b: Vec2D, owner: Owner) {
	const data = sector.data as ISector;
	if (owner == Owner.ENNEMY) {
		data.points.set(a, b);
	} else if (owner == Owner.USER) {
		data.userPoints.set(a, b);
	} else {
		data.borderPoints.set(a, b);
	}
}

export function computeShapes(sector: Task) {
	const data = sector.data as ISector;
	data.shapes = buildShapes(data.points, Owner.ENNEMY);
	data.userShapes = buildShapes(data.userPoints, Owner.USER);
	data.borders = buildBorder(data.borderPoints);
}
