<svelte:options immutable={true} />

<script lang="ts">
	import Chip from '$components/inputs/Chip.svelte';
	import Input from '$components/inputs/Input.svelte';
	import Textarea from '$components/inputs/Textarea.svelte';
	import { TaskChange, type Task } from '$models/task';
	import Button, { Label } from '@smui/button';
	import type { Writable } from 'svelte/store';

	export let task: Task;
	let changes$: Writable<TaskChange>;
	let name: string;
	let description: string;
	let labels: string[];
	let priority: number;

	let label: string = '';

	$: if (task) {
		initValues();
	}

	$: if ($changes$) {
		switch ($changes$) {
			case TaskChange.NAME_DESCRIPTION:
				name = task.name;
				description = task.description;
				break;
		}
	}

	function initValues() {
		name = task.name;
		description = task.description;
		labels = [...task.labels];
		priority = task.priority;
	}

	function handleConfirm(event?: Event) {
		changes$.set(TaskChange.EDIT_OFF);
	}

	function handleCancel(event: Event) {
		event.preventDefault();
		event.stopPropagation();
		initValues();
		changes$.set(TaskChange.EDIT_OFF);
	}

	function handleChipClick(event: Event, chip: string) {
		event.stopPropagation();
		setTimeout(() => {
			labels = labels.filter((l) => l != chip);
		}, 1);
	}

	function handleLabelInputChange(e: KeyboardEvent) {
		if (e.code == 'Space' || e.code == 'Enter') {
			e.stopPropagation();
			const lbl = label.trim();
			if (lbl.length > 0) {
				const exists = labels.find((l) => l === lbl);
				if (!exists) {
					labels = [...labels, lbl];
				} else {
					labels = labels.filter((l) => l !== lbl);
				}
			}
			setTimeout(() => {
				label = '';
			}, 1);
		}
	}
</script>

<div class="container">
	<div class="name-input">
		<Input bind:value={name} placeholder="Task name" />
	</div>
	<div class="description-input">
		<Textarea bind:value={description} placeholder="Description" />
	</div>

	<div class="labels">
		{#each labels as chip}
			<Chip {chip} on:click={(e) => handleChipClick(e, chip)} />
		{/each}
		<div class="label-input">
			<Input
				bind:value={label}
				placeholder="+ Add label or write it again to delete it"
				on:keydown={handleLabelInputChange}
			/>
		</div>
	</div>
	<div class="buttons-and-toolbar">
		<div class="buttons">
			<Button on:click={handleConfirm}>
				<Label>Confirm</Label>
			</Button>
			<Button on:click={handleCancel} class="shade-color">
				<Label>Cancel</Label>
			</Button>
		</div>
	</div>
</div>

<style lang="scss">
	.container {
		padding: 0px;
		margin: 0px 8px;
		display: flex;
		flex-direction: column;
		.name-input {
			--color: var(--mne-color-light);
			--background: var(--background-color);
		}
		.description-input {
			margin-top: 8px;
			--color: var(--mne-color-shade);
			--background: var(--background-color);
		}

		.labels {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			margin-top: 4px;
			:global(.chip) {
				--chip-background: var(--color);
				--chip-color: var(--mne-color-light);
			}
			.label-input {
				flex: 1;
			}
		}
	}
</style>
