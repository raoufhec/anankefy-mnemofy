<svelte:options immutable={true} />

<script lang="ts">
	import {
		getColor,
		isDisplayed,
		setChecked,
		setClosed,
		TaskChange,
		TaskColor,
		typeToText,
		type Task
	} from '$models/task';
	import { Icon } from '@smui/common';
	import type { Writable } from 'svelte/store';
	import Checkbox from './Checkbox.svelte';
	import TaskItemEditOn from './TaskItemEditOn.svelte';
	import TaskItemEditOff from './TaskItemEditOn.svelte';
	import TaskMenu from './TaskMenu.svelte';

	export let task: Task;
	let changes$: Writable<TaskChange>;
	let color: TaskColor;
	let closed: boolean;
	let displayed: boolean;
	let edit: boolean;
	$: if (task) {
		changes$ = task.changes$;
		color = getColor(task);
		closed = task.closed;
		displayed = isDisplayed(task);
	}

	$: if ($changes$) {
		switch ($changes$) {
			case TaskChange.CLOSED:
				closed = true;
				break;
			case TaskChange.OPENED:
				closed = false;
				break;
			case TaskChange.EDIT_ON:
				edit = true;
				break;
			case TaskChange.EDIT_OFF:
				edit = false;
				break;
		}
	}

	function handleCheck(e: CustomEvent<{ checked: boolean }>) {
		setChecked(task, e.detail.checked);
	}
	function handleClosed(e: Event) {
		if (e instanceof KeyboardEvent) {
			if (e.code === 'Enter') {
				e.preventDefault();
				e.stopPropagation();
				setClosed(task, !closed);
			}
		} else {
			e.preventDefault();
			e.stopPropagation();
			setClosed(task, !closed);
		}
	}
</script>

{#if displayed}
	<div
		class={'item-container type' + task.type}
		style:--color={color}
		style:--background-color={color + 44}
	>
		<!-- Toogle -->
		<div class="toggle" on:click={handleClosed} on:keypress={handleClosed}>
			{#if task.type < 4}
				{#if closed}
					<Icon class="material-icons">chevron_right</Icon>
				{:else}
					<Icon class="material-icons">expand_more</Icon>
				{/if}
			{:else}
				<Icon class="material-icons">remove</Icon>
			{/if}
		</div>

		<!-- Checkbox -->
		<Checkbox checked={task.checked} type={task.type} on:check={handleCheck} />

		<!-- Type text-->
		<div class="type-text hide-sm">{typeToText(task.type).slice(0, 3)}</div>

		<!-- Task content -->
		<div class="content-container" class:checked={task.checked}>
			{#if edit}
				<TaskItemEditOn {task} />
			{:else}
				<TaskItemEditOff {task} />
			{/if}
		</div>

		<TaskMenu />
	</div>
{/if}

<style lang="scss">
	.item-container {
		padding: 12px 0px;
		margin-left: 8px;
		position: relative;
		cursor: pointer;
		display: flex;
		min-width: 0;
		align-items: center;
		border-bottom: 1px solid #4a4a4a47;
		&.type2 {
			margin-left: var(--distance);
		}
		&.type3 {
			margin-left: calc((var(--distance) * 2) + 20px);
		}
		&.type3 {
			margin-left: calc((var(--distance) * 3) + 20px);
		}
		&.type4 {
			margin-left: calc((var(--distance) * 3) + 20px);
		}
		&:hover {
			background-color: rgba(244, 245, 248, 0.008);
		}

		.toggle {
			color: var(--color);
			width: 20px;
			height: 20px;
			margin-right: 8px;
		}

		.type-text {
			margin-left: 8px;
			text-transform: uppercase;
			color: var(--color);
		}
		.content-container {
			flex: 1;
		}
	}
</style>
