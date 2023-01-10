<script lang="ts">
	import Button from '@smui/button';
	import List, { Item, Separator, Graphic, Text } from '@smui/list';
	import Menu from '@smui/menu';
	import { Icon } from '@smui/common';
	import { multiverseService } from '$services/multiverse.service';

	let account: string | undefined = undefined;
	let menu: Menu;

	function openMenu() {
		menu.setOpen(true);
	}

	async function saveToLocal() {
		await multiverseService.saveCurrentGalaxyToLocal();
	}

	async function saveToServer() {}

	function exportToJSON() {}
</script>

<div>
	<Button class="icon-button" on:click={openMenu}>
		<Icon class="material-icons icon-button primary-color">save</Icon>
	</Button>
	<Menu bind:this={menu}>
		<List>
			<Item on:SMUI:action={saveToLocal} class="save-local">
				<Graphic class="material-icons">save</Graphic>
				<Text>Save to Local</Text>
			</Item>
			<Item disabled={!account} on:SMUI:action={saveToServer} class="save-server">
				<Graphic class="material-icons">cloud_upload</Graphic>
				<Text>Save to Server</Text>
			</Item>
			<Separator />
			<Item on:SMUI:action={exportToJSON} class="export">
				<Graphic class="material-icons">download</Graphic>
				<Text>Export to JSON</Text>
			</Item>
		</List>
	</Menu>
</div>

<style lang="scss">
	:global(.save-local) {
		--mdc-ripple-color: var(--mne-color-warning);
		:global(.material-icons) {
			color: var(--mne-color-warning);
		}
	}
	:global(.save-server) {
		--mdc-ripple-color: var(--mne-color-success);
		:global(.material-icons) {
			color: var(--mne-color-success);
		}
	}
	:global(.export) {
		--mdc-ripple-color: var(--mne-color-primary);
		:global(.material-icons) {
			color: var(--mne-color-primary);
		}
	}
</style>
