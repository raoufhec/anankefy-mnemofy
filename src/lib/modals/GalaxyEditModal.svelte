<script lang="ts">
	import Dialog, { Content, Actions, InitialFocus } from '@smui/dialog';
	import Button, { Label } from '@smui/button';
	import Textfield from '@smui/textfield';
	import CharacterCounter from '@smui/textfield/character-counter';
	import Select, { Option } from '@smui/select';
	import Switch from '@smui/switch';
	import FormField from '@smui/form-field';
	import ModalHeader from './ModalHeader.svelte';
	import ColorPicker from '$components/TaskAttributes/ColorPicker.svelte';
	import { GalaxyTheme, SaveLocation, TaskColor, type Galaxy } from '$models/task';
	import { Multiverse } from '$models/multiverse';
	import { multiverseService } from '$services/multiverse.service';
	import Input from '$components/inputs/Input.svelte';
	import Textarea from '$components/inputs/Textarea.svelte';

	export let data: any;
	export let open: boolean = false;
	let edit: boolean = false;
	let galaxy: Galaxy;

	let color: TaskColor;
	let name: string = '';
	let description: string;
	let theme: GalaxyTheme;
	let discoverable: boolean;

	let title: string;

	let themeOptions = Object.values(GalaxyTheme);

	$: if (data) initValues();

	function closeModal() {
		open = false;
	}

	function initValues() {
		edit = data.edit;
		title = edit ? 'Edit Galaxy' : 'Create Galaxy';
		galaxy = data.galaxy;
		name = galaxy.name;
		description = galaxy.description;
		color = galaxy.color;
		theme = galaxy.theme;
		discoverable = galaxy.discoverable;
	}

	function confirm() {
		if (!edit) {
			galaxy.name = name;
			galaxy.description = description;
			galaxy.color = color;
			galaxy.theme = theme;
			galaxy.discoverable = discoverable;
			const multiverse = new Multiverse(galaxy.id);
			multiverse.local = galaxy;
			multiverseService.setMultiverseAndActivateGalaxy(multiverse, SaveLocation.LOCAL);
			closeModal();
		} else {
		}
	}
</script>

{#if galaxy}
	<div style:--background-color={color + '44'} style:--color={color}>
		{#if open}
			<Dialog
				bind:open
				fullscreen
				scrimClickAction=""
				aria-labelledby="edit-galaxy-title"
				aria-describedby="edit-galaxy-content"
			>
				<ModalHeader {title} on:close={closeModal} />
				<Content id="edit-galaxy-content">
					<div class="modal-content" style:--background-color={color + '44'}>
						<div class="uuid">{galaxy.id}</div>
						<ColorPicker bind:color />
						<div class="field">
							<Input bind:value={name} placeholder="Name" />
						</div>
						<div class="field description">
							<Textarea bind:value={description} placeholder="Description" />
						</div>
						<div class="field">
							<Select variant="outlined" bind:value={theme} label="Theme" style="width: 100%">
								{#each themeOptions as option}
									<Option value={option}>{option}</Option>
								{/each}
							</Select>
						</div>
						<div class="field no-bg-color">
							<FormField align="end" style="width: 100%">
								<span slot="label">Discoverable</span>
								<Switch bind:checked={discoverable} icons={false} />
							</FormField>
						</div>
						<div class="field no-bg-color">
							<FormField align="end" style="width: 100%">
								<span slot="label">Encrypted</span>
								<Switch checked={false} icons={false} disabled={true} />
							</FormField>
						</div>
					</div>
				</Content>
				<Actions>
					<Button class="light-color" aria-label="cancel" on:click={closeModal}>
						<Label>Cancel</Label>
					</Button>
					<Button use={[InitialFocus]} aria-label="confirm" on:click={confirm}>
						<Label>Confirm</Label>
					</Button>
				</Actions>
			</Dialog>
		{/if}
	</div>
{/if}

<style lang="scss">
	.modal-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-family: var(--font-family);
		.uuid {
			text-align: center;
			padding-bottom: 8px;
		}
	}
	.field {
		margin: 8px 0px;
		width: 100%;
		--background: var(--background-color);
		--color: var(--mne-color-light);
		&.description {
			--color: var(--mne-color-shade);
		}
		&.no-bg-color {
			background-color: transparent;
		}
	}
</style>
