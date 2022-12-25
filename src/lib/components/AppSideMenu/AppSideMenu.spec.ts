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
			// fail untill I code the create galaxy logic
			expect(button).not.toBeDefined();
		});

		it('should display a button to read a tutorial', async () => {
			render(AppSideMenu);
			const button = screen.getByText('Read the Tutorial');
			expect(button).toBeDefined();
			await fireEvent.click(button);
			// fail untill I code the create galaxy logic
			expect(button).not.toBeDefined();
		});
	});
});
