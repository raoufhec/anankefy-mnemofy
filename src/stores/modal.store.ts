import { writable } from 'svelte/store';

export interface ModalData {
	component: ConstructorOfATypedSvelteComponent;
	props: any;
	open: boolean;
}

export const modal = writable<ModalData>();
