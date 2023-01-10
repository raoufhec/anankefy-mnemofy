/**
 * Task types
 */
export enum TaskType {
	GALAXY = 0,
	SECTOR = 1,
	SYSTEM = 2,
	PLANET = 3,
	MOON = 4
}

/**
 * Task colors
 */
export enum TaskColor {
	VIOLET = '#9488F0',
	GREEN = '#6FDCBA',
	BLUE = '#3CA1ED',
	RED = '#F33F5B',
	ORANGE = '#F98654',
	YELLOW = '#F6D083',
	BROWN = '#BC768B'
}

/**
 * Task changes
 */
export enum TaskChange {
	NAME_DESCRIPTION = 1,
	LABELS,
	ORDER,
	CHECKED,
	COLOR,
	COORDS,
	PATTERN,
	EMBLEM,
	PINNED,
	FOCUS,
	UPDATE_SHAPES,
	STRUCTURAL, // change affecting moons no graph impact
	STRUCTURAL_WITH_INFLUENCE_CHANGE, // children moving around with influence change, no impact on systems coords
	STRUCTURAL_WITH_GRAPH_CHANGE, // change affecting systems/sectors with need to recompute hierarchy
	GRAPH_CHANGE, // change affecting systems/sectors, no need to recompute hierarchy
	INFLUENCE_CHANGE, // affecting territories and star control

	SAVE_STATUS,
	EDIT_ON,
	EDIT_OFF,
	CLOSED,
	OPENED
}

/**
 * Galaxy themes
 */
export enum GalaxyTheme {
	BTL = 'BTL'
}

/**
 * Galaxy types
 */
export enum GalaxyCategory {
	PROJECT = 'Project',
	NFT = 'NFT'
}

/**
 * Galaxy save status
 */
export enum SaveStatus {
	NEED_TO_SAVE = 0,
	NO_COPY,
	AHEAD,
	SAME,
	BEHIND
}

/**
 * Galaxy save location
 */
export enum SaveLocation {
	LOCAL = 'local',
	SERVER = 'server'
}
