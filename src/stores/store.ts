import {
	writable,
	get,
	type Writable,
	type Subscriber,
	type Unsubscriber,
	type Updater
} from 'svelte/store';

/** Cleanup logic callback. */
declare type Invalidator<T> = (value?: T) => void;

export abstract class Store<T> implements Writable<T | undefined> {
	private initialValue: T | undefined;
	private store: Writable<T | undefined>;

	public subscribe: (
		run: Subscriber<T | undefined>,
		invalidate?: Invalidator<T | undefined> | undefined
	) => Unsubscriber;
	private storeSet: (value: T | undefined) => void;
	public update: (updater: Updater<T | undefined>) => void;

	abstract beforeSet(value: T | undefined): void;

	/**
	 * @constructor
	 * @param {T | undefined} value initial value
	 */
	constructor(value?: T) {
		this.initialValue = value;
		this.store = writable(value);
		const { subscribe, set, update } = this.store;
		this.subscribe = subscribe;
		this.storeSet = set;
		this.update = update;
	}

	public set(value?: T) {
		this.beforeSet(value);
		this.storeSet(value);
	}

	/**
	 * Get store's current value
	 * @returns {T} current value of the store
	 */
	get(): T | undefined {
		return get(this.store);
	}

	/**
	 * Reset store to initial value
	 */
	reset(): void {
		this.set(this.initialValue);
	}

	/**
	 * Resets the store to the current value
	 */
	refresh(): void {
		this.set(this.get());
	}
}
