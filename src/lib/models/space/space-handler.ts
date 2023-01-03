import type { Task, ISystem } from '../task';
import { Vec2D } from './vec2d';
import { Owner } from './owner';
import * as TerritoryUtils from './shape-utils';

export class ControlNode extends Vec2D {
	public strength: number;
	public territory?: Task;
	public owner?: Owner;

	public strength2nd?: number;
	public territory2nd?: Task;

	public above?: Vec2D;
	public right?: Vec2D;

	constructor(x: number, y: number) {
		super(x, y);
		this.strength = 0;
	}
}

export class Square {
	public topLeft: ControlNode;
	public topRight: ControlNode;
	public bottomRight: ControlNode;
	public bottomLeft: ControlNode;

	constructor(
		topLeft: ControlNode,
		topRight: ControlNode,
		bottomRight: ControlNode,
		bottomLeft: ControlNode
	) {
		this.topLeft = topLeft;
		this.topRight = topRight;
		this.bottomRight = bottomRight;
		this.bottomLeft = bottomLeft;
	}
}

export class SpaceHandler extends Array<Array<Square>> {
	public width: number;
	public height: number;
	public nbrSquaresWidth: number;
	public nbrSquaresHeight: number;

	public squareSize: number;
	public halfSquareSize: number;

	public influenceRadius: number;
	public influenceThreshold: number;

	constructor(
		width: number,
		height: number,
		squareSize = 20,
		influenceRadius = 15,
		influenceThreshold = 1.0
	) {
		super(Math.ceil(width / squareSize) + 2);
		this.width = width;
		this.height = height;

		this.squareSize = squareSize;
		this.halfSquareSize = Math.floor(this.squareSize / 2);

		this.influenceRadius = influenceRadius;
		this.influenceThreshold = influenceThreshold;

		this.nbrSquaresWidth = Math.ceil(this.width / this.squareSize);
		this.nbrSquaresHeight = Math.ceil(this.height / this.squareSize);

		// init squares
		this.initSquares();
	}

	initSquares() {
		let topLeft = new ControlNode(-this.squareSize, -this.squareSize);
		let topRight = new ControlNode(0, -this.squareSize);
		let bottomRight = new ControlNode(0, 0);
		let bottomLeft = new ControlNode(-this.squareSize, 0);
		// init first column (x) of squares
		this[0] = new Array<Square>(this.nbrSquaresHeight);
		for (let r = 0; r < this.nbrSquaresHeight; ++r) {
			this[0][r] = new Square(topLeft, topRight, bottomRight, bottomLeft);
			// Move down
			const y = r * this.squareSize;
			topLeft = bottomLeft;
			topRight = bottomRight;
			bottomLeft = new ControlNode(-this.squareSize, y + this.squareSize);
			bottomRight = new ControlNode(0, y + this.squareSize);
		}

		// init squares
		for (let c = 1; c < this.nbrSquaresWidth; ++c) {
			const x = (c - 1) * this.squareSize;
			this[c] = new Array<Square>(this.nbrSquaresHeight);
			for (let r = 0; r < this.nbrSquaresHeight; ++r) {
				const y = (r - 1) * this.squareSize;
				if (r == 0) {
					topRight = new ControlNode(x + this.squareSize, y);
				} else {
					topRight = this[c][r - 1].bottomRight;
				}
				topLeft = this[c - 1][r].topRight;
				bottomLeft = this[c - 1][r].bottomRight;
				bottomRight = new ControlNode(x + this.squareSize, y + this.squareSize);
				this[c][r] = new Square(topLeft, topRight, bottomRight, bottomLeft);
			}
		}
	}

	computeSquaresControl(systems: Task[]) {
		const radius = this.influenceRadius * this.squareSize;
		systems.forEach((system) => {
			const data = system.data as ISystem;
			data.strength = system.getDifficulty!() / 15 + 0.75;
		});
		for (let i = 2; i < this.nbrSquaresWidth - 1; ++i) {
			// leave two squares on each side
			for (let j = 2; j < this.nbrSquaresHeight - 1; ++j) {
				// leave two squares on each side
				const controlNode = this[i][j].topLeft;
				// reset control node
				const sectorsStrength = new Map<
					string,
					{ sector: Task; totalStrength: number; userStrength: number }
				>();
				systems.forEach((system) => {
					const sector = system.parent!;
					const data = system.data as ISystem;
					const dx = Math.abs(data.coords!.x - controlNode.x);
					const dy = Math.abs(data.coords!.y - controlNode.y);
					const strength = Math.pow(data.strength * radius, 2) / (dx * dx + dy * dy);
					if (strength > 0) {
						let strengthObject = { sector, totalStrength: 0, userStrength: 0 };
						if (sectorsStrength.has(sector.id)) {
							strengthObject = sectorsStrength.get(sector.id)!;
						} else {
							sectorsStrength.set(sector.id, strengthObject);
						}
						strengthObject.userStrength += strength * system.control;
						strengthObject.totalStrength += strength;
					}
				});
				let highestStrength = 0;
				let highestStrength2nd = 0;
				let highestSector: Task;
				let highestSector2nd: Task;
				let highestSectorStrengthObject: {
					totalStrength: number;
					userStrength: number;
				};
				let owner = Owner.ENNEMY;
				// Find the territory controlling this
				const territoriesSorted = Array.from(sectorsStrength.values()).sort(
					(a, b) => b.totalStrength - a.totalStrength
				);
				if (territoriesSorted.length > 0) {
					const value = territoriesSorted[0];
					highestStrength = value.totalStrength;
					highestSector = value.sector;
					highestSectorStrengthObject = value;
					if (territoriesSorted.length > 1) {
						const value = territoriesSorted[1];
						highestStrength2nd = value.totalStrength;
						highestSector2nd = value.sector;
					}
				}
				// Check if it should be owned by the user;
				if (
					highestSectorStrengthObject! &&
					highestSectorStrengthObject.totalStrength - highestSectorStrengthObject.userStrength <
						highestSectorStrengthObject.userStrength
				) {
					owner = Owner.USER;
				}
				controlNode.strength = highestStrength;
				controlNode.strength2nd = highestStrength2nd;
				controlNode.territory = highestSector!;
				controlNode.territory2nd = highestSector2nd!;
				controlNode.owner = owner;

				controlNode.above = undefined;
				controlNode.right = undefined;
			}
		}
	}

	computeTerritories(systems: Task[]) {
		this.computeSquaresControl(systems);
		for (let i = 0; i < this.nbrSquaresWidth; ++i) {
			for (let j = 0; j < this.nbrSquaresHeight; ++j) {
				const square = this[i][j];
				const states = new Map<string, { sector: Task; state: number[] }>();
				if (square.topLeft.strength >= this.influenceThreshold) {
					this.computeControlNodeState(states, square.topLeft, 8);
				}
				if (square.topRight.strength >= this.influenceThreshold) {
					this.computeControlNodeState(states, square.topRight, 4);
				}
				if (square.bottomRight.strength >= this.influenceThreshold) {
					this.computeControlNodeState(states, square.bottomRight, 2);
				}
				if (square.bottomLeft.strength >= this.influenceThreshold) {
					this.computeControlNodeState(states, square.bottomLeft, 1);
				}

				for (const [territoryId, stateObject] of states) {
					const territory = stateObject.sector;
					this.interpretState(square, territory, stateObject.state[Owner.ENNEMY], Owner.ENNEMY);
					this.interpretState(square, territory, stateObject.state[Owner.USER], Owner.USER);
					this.interpretState(
						square,
						territory,
						stateObject.state[Owner.TERRITORY],
						Owner.TERRITORY
					);
				}
			}
		}
	}

	private computeControlNodeState(
		states: Map<string, { sector?: Task; state: number[] }>,
		node: ControlNode,
		value: number
	) {
		let currentState: { sector?: Task; state: number[] } = { sector: undefined, state: [0, 0, 0] };
		const territoryId = node.territory!.id;
		if (states.has(territoryId)) {
			currentState = states.get(territoryId)!;
		} else {
			currentState.sector = node.territory;
			states.set(territoryId, currentState);
		}
		currentState.state[node.owner!] += value;
		currentState.state[Owner.TERRITORY] += value;
	}

	private interpretState(square: Square, territory: Task, state: number, owner: Owner) {
		switch (state) {
			// case 0: // no corner is active, no need to handle this// can never happen as it would not have been added to the state
			//     break;
			case 1: // only bottom left is active
				if (square.bottomLeft.above == null) {
					square.bottomLeft.above = this.lerpY(square.topLeft, square.bottomLeft);
				}
				if (square.bottomLeft.right == null) {
					square.bottomLeft.right = this.lerpX(square.bottomLeft, square.bottomRight);
				}
				// territory.add(square.bottomLeft.above, square.bottomLeft.right);
				TerritoryUtils.add(territory, square.bottomLeft.right, square.bottomLeft.above, owner);
				break;
			case 2: // only bottom right is active
				if (square.bottomLeft.right == null) {
					square.bottomLeft.right = this.lerpX(square.bottomLeft, square.bottomRight);
				}
				if (square.bottomRight.above == null) {
					square.bottomRight.above = this.lerpY(square.topRight, square.bottomRight);
				}
				// territory.add(square.bottomLeft.right, square.bottomRight.above);
				TerritoryUtils.add(territory, square.bottomRight.above, square.bottomLeft.right, owner);
				break;
			case 3: // horizontal line: two bottoms are active
				if (square.bottomLeft.above == null) {
					square.bottomLeft.above = this.lerpY(square.topLeft, square.bottomLeft);
				}
				if (square.bottomRight.above == null) {
					square.bottomRight.above = this.lerpY(square.topRight, square.bottomRight);
				}
				// territory.add(square.bottomLeft.above, square.bottomRight.above);
				TerritoryUtils.add(territory, square.bottomRight.above, square.bottomLeft.above, owner);
				break;
			case 4: // only top right is active
				if (square.bottomRight.above == null) {
					square.bottomRight.above = this.lerpY(square.topRight, square.bottomRight);
				}
				if (square.topLeft.right == null) {
					square.topLeft.right = this.lerpX(square.topLeft, square.topRight);
				}
				// territory.add(square.bottomRight.above, square.topLeft.right);
				TerritoryUtils.add(territory, square.topLeft.right, square.bottomRight.above, owner);
				break;
			case 5: // only two opposing corners are active // topright and bottom left
				if (square.bottomRight.above == null) {
					square.bottomRight.above = this.lerpY(square.topRight, square.bottomRight);
				}
				if (square.topLeft.right == null) {
					square.topLeft.right = this.lerpX(square.topLeft, square.topRight);
				}
				// territory.add(square.bottomRight.above, square.topLeft.right);
				TerritoryUtils.add(territory, square.topLeft.right, square.bottomRight.above, owner);

				if (square.bottomLeft.above == null) {
					square.bottomLeft.above = this.lerpY(square.topLeft, square.bottomLeft);
				}
				if (square.bottomLeft.right == null) {
					square.bottomLeft.right = this.lerpX(square.bottomLeft, square.bottomRight);
				}
				// territory.add(square.bottomLeft.above, square.bottomLeft.right);
				TerritoryUtils.add(territory, square.bottomLeft.right, square.bottomLeft.above, owner);
				break;
			case 6: // vertical line: topRight and bottom Right
				if (square.bottomLeft.right == null) {
					square.bottomLeft.right = this.lerpX(square.bottomLeft, square.bottomRight);
				}
				if (square.topLeft.right == null) {
					square.topLeft.right = this.lerpX(square.topLeft, square.topRight);
				}
				// territory.add(square.bottomLeft.right, square.topLeft.right);
				TerritoryUtils.add(territory, square.topLeft.right, square.bottomLeft.right, owner);
				break;
			case 7: // three are active: only topleft is not active
				if (square.bottomLeft.above == null) {
					square.bottomLeft.above = this.lerpY(square.topLeft, square.bottomLeft);
				}
				if (square.topLeft.right == null) {
					square.topLeft.right = this.lerpX(square.topLeft, square.topRight);
				}
				// territory.add(square.bottomLeft.above, square.topLeft.right);
				TerritoryUtils.add(territory, square.topLeft.right, square.bottomLeft.above, owner);
				break;
			case 8: // only top left is active
				if (square.topLeft.right == null) {
					square.topLeft.right = this.lerpX(square.topLeft, square.topRight);
				}
				if (square.bottomLeft.above == null) {
					square.bottomLeft.above = this.lerpY(square.topLeft, square.bottomLeft);
				}
				// territory.add(square.topLeft.right, square.bottomLeft.above);
				TerritoryUtils.add(territory, square.bottomLeft.above, square.topLeft.right, owner);
				break;
			case 9: // vertical line: only bottom left and top left are active
				if (square.topLeft.right == null) {
					square.topLeft.right = this.lerpX(square.topLeft, square.topRight);
				}
				if (square.bottomLeft.right == null) {
					square.bottomLeft.right = this.lerpX(square.bottomLeft, square.bottomRight);
				}
				// territory.add(square.topLeft.right, square.bottomLeft.right);
				TerritoryUtils.add(territory, square.bottomLeft.right, square.topLeft.right, owner);
				break;
			case 10: // only two opposing corners are active \\ bottom right and top left
				if (square.topLeft.right == null) {
					square.topLeft.right = this.lerpX(square.topLeft, square.topRight);
				}
				if (square.bottomLeft.above == null) {
					square.bottomLeft.above = this.lerpY(square.topLeft, square.bottomLeft);
				}
				// territory.add(square.topLeft.right, square.bottomLeft.above);
				TerritoryUtils.add(territory, square.bottomLeft.above, square.topLeft.right, owner);

				if (square.bottomLeft.right == null) {
					square.bottomLeft.right = this.lerpX(square.bottomLeft, square.bottomRight);
				}
				if (square.bottomRight.above == null) {
					square.bottomRight.above = this.lerpY(square.topRight, square.bottomRight);
				}
				// territory.add(square.bottomLeft.right, square.bottomRight.above);
				TerritoryUtils.add(territory, square.bottomRight.above, square.bottomLeft.right, owner);
				break;
			case 11: // three corners are active: only topRight is not active
				if (square.topLeft.right == null) {
					square.topLeft.right = this.lerpX(square.topLeft, square.topRight);
				}
				if (square.bottomRight.above == null) {
					square.bottomRight.above = this.lerpY(square.topRight, square.bottomRight);
				}
				// territory.add(square.topLeft.right, square.bottomRight.above);
				TerritoryUtils.add(territory, square.bottomRight.above, square.topLeft.right, owner);
				break;
			case 12: // horizontal line: top right and top left are active
				if (square.bottomRight.above == null) {
					square.bottomRight.above = this.lerpY(square.topRight, square.bottomRight);
				}
				if (square.bottomLeft.above == null) {
					square.bottomLeft.above = this.lerpY(square.topLeft, square.bottomLeft);
				}
				// territory.add(square.bottomRight.above, square.bottomLeft.above);
				TerritoryUtils.add(territory, square.bottomLeft.above, square.bottomRight.above, owner);
				break;
			case 13: // three corcners are active: only bottomRight is inactive
				if (square.bottomRight.above == null) {
					square.bottomRight.above = this.lerpY(square.topRight, square.bottomRight);
				}
				if (square.bottomLeft.right == null) {
					square.bottomLeft.right = this.lerpX(square.bottomLeft, square.bottomRight);
				}
				// territory.add(square.bottomRight.above, square.bottomLeft.right);
				TerritoryUtils.add(territory, square.bottomLeft.right, square.bottomRight.above, owner);
				break;
			case 14: // three corners are active: only bottomLeft is inactive
				if (square.bottomLeft.right == null) {
					square.bottomLeft.right = this.lerpX(square.bottomLeft, square.bottomRight);
				}
				if (square.bottomLeft.above == null) {
					square.bottomLeft.above = this.lerpY(square.topLeft, square.bottomLeft);
				}
				// territory.add(square.bottomLeft.right, square.bottomLeft.above);
				TerritoryUtils.add(territory, square.bottomLeft.above, square.bottomLeft.right, owner);
				break;
			// case 15: // all corners are active no need to handle this
			//     break;
		}
	}

	private lerpX(smallP: ControlNode, bigP: ControlNode): Vec2D {
		const y = smallP.y;
		let x;
		// if(smallP.territory === bigP.territory || smallP.territory == null || bigP.territory == null) {
		if (
			smallP.territory == null ||
			bigP.territory == null ||
			(smallP.territory === bigP.territory && smallP.owner == bigP.owner)
		) {
			x =
				smallP.x +
				(this.squareSize * (this.influenceThreshold - smallP.strength)) /
					(bigP.strength - smallP.strength);
		} else {
			// x = smallP.x + this.squareSize * (smallP.strength) / (bigP.strength + smallP.strength);
			// x = smallP.x;
			x =
				smallP.x +
				(this.squareSize * (smallP.strength - smallP.strength2nd!)) /
					(bigP.strength - smallP.strength2nd! - (bigP.strength2nd! - smallP.strength));
		}
		return new Vec2D(x, y);
	}

	private lerpY(smallP: ControlNode, bigP: ControlNode): Vec2D {
		const x = smallP.x;
		let y;
		// if(smallP.territory === bigP.territory || smallP.territory == null || bigP.territory == null) {
		if (
			smallP.territory == null ||
			bigP.territory == null ||
			(smallP.territory === bigP.territory && smallP.owner == bigP.owner)
		) {
			y =
				smallP.y +
				(this.squareSize * (this.influenceThreshold - smallP.strength)) /
					(bigP.strength - smallP.strength);
		} else {
			// y = smallP.y + this.squareSize * (smallP.strength) / (bigP.strength + smallP.strength);
			// y = smallP.y;
			y =
				smallP.y +
				(this.squareSize * (smallP.strength - smallP.strength2nd!)) /
					(bigP.strength - smallP.strength2nd! - (bigP.strength2nd! - smallP.strength));
		}
		return new Vec2D(x, y);
	}
}
