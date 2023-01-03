import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import AppSideMenu from './AppSideMenu.svelte';

describe('Side Menu', () => {
	describe('Side Menu with no galaxy', () => {
		it('should display the Mnemofy logo', () => {
			render(AppSideMenu);
			const logo = screen.getByAltText('logo');
			expect(logo).toBeDefined();
		});

		it('should display a button to create a new galaxy', async () => {
			render(AppSideMenu);
			const button = screen.getByText('Create a Galaxy');
			expect(button).toBeDefined();
			await fireEvent.click(button);
			// expect a modal to show with a confirm button
			const modal = screen.queryByLabelText('confirm');
			expect(modal).toBeDefined();
		});

		it('should display a button to read a tutorial', async () => {
			render(AppSideMenu);
			const button = screen.getByText('Read the Tutorial');
			expect(button).toBeDefined();
			await fireEvent.click(button);
			const tutorial = screen.queryAllByText('Read the Tutorial');
			expect(tutorial.length).toBe(0);
		});
	});

	describe('Side Menu with galaxy', () => {
		it('should display the Mnemofy logo', () => {
			render(AppSideMenu);
			const logo = screen.getByAltText('logo');
			expect(logo).toBeDefined();
		});
	});
});
