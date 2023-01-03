import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import GalaxyEditModal from './GalaxyEditModal.svelte';
import { multiverseService } from '$services/multiverse.service';
import type { Task } from '$models/task';

describe('Galaxy Edit Modal', () => {
	let galaxy: Task;

	beforeEach(() => {
		galaxy = multiverseService.createGalaxy('New Galaxy');
	});

	describe('Basic Modal functionnalities', () => {
		it('should contain "confirm/cancel"', () => {
			const config = { data: { edit: true, galaxy }, open: true };
			render(GalaxyEditModal, config);
			const confirm = screen.queryByLabelText('Confirm');
			expect(confirm).toBeDefined();
			const cancel = screen.queryByLabelText('Cancel');
			expect(cancel).toBeDefined();
		});

		it('should close when arrow button is clicked', async () => {
			const config = { data: { edit: true, galaxy }, open: true };
			render(GalaxyEditModal, config);
			let confirm = screen.getByLabelText('confirm');
			expect(confirm).toBeDefined();
			const closeIconButton = screen.getByLabelText('close modal');
			await fireEvent.click(closeIconButton);
			expect(screen.queryByLabelText('confirm')).toBeNull();
		});
	});

	describe('Galaxy Edit Modal specific functionnalities', () => {
		it('should display "Create Galaxy" as title if edit is false', () => {
			const config = { data: { edit: false, galaxy }, open: true };
			render(GalaxyEditModal, config);
			const title = screen.getByText('Create Galaxy');
			expect(title).toBeDefined();
		});

		it('should display "Edit Galaxy" as title if edit is true', () => {
			const config = { data: { edit: true, galaxy }, open: true };
			render(GalaxyEditModal, config);
			const title = screen.getByText('Edit Galaxy');
			expect(title).toBeDefined();
		});

		it('should display galaxy id', () => {
			const config = { data: { edit: true, galaxy }, open: true };
			render(GalaxyEditModal, config);
			const title = screen.queryByText(galaxy.id);
			expect(title).toBeDefined();
		});

		it('should display galaxy name', () => {
			const config = { data: { edit: true, galaxy }, open: true };
			render(GalaxyEditModal, config);
			const title = screen.queryByText(galaxy.name);
			expect(title).toBeDefined();
		});
	});
});
