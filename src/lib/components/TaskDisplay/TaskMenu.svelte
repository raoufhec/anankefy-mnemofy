<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from '@smui/button';
	import List, { Item, Separator, Graphic, Text } from '@smui/list';
	import Menu from '@smui/menu';
	import { Icon } from '@smui/common';
	import { TaskMenuAction } from './task-menu-action.enum';

	const dispatch = createEventDispatcher<{ menu: { action: TaskMenuAction } }>();

	let menu: Menu;

	function openMenu() {
		menu.setOpen(true);
	}

	function fireMenuActionEvent(action: TaskMenuAction) {
		dispatch('menu', { action });
	}

	function addTaskAbove() {
		fireMenuActionEvent(TaskMenuAction.ADD_TASK_ABOVE);
	}
	function addTaskBelow() {
		fireMenuActionEvent(TaskMenuAction.ADD_TASK_BELOW);
	}
	function addSubTask() {
		fireMenuActionEvent(TaskMenuAction.ADD_SUB_TASK);
	}
	function edit() {
		fireMenuActionEvent(TaskMenuAction.EDIT);
	}
	function detail() {
		fireMenuActionEvent(TaskMenuAction.DETAIL);
	}
	function remove() {
		fireMenuActionEvent(TaskMenuAction.DELETE);
	}
</script>

<div>
	<Button color="primary" on:click={edit} class="icon-button small">
		<Icon class="material-icons primary-color icon-button">edit</Icon>
	</Button>
	<Button color="primary" on:click={openMenu} class="icon-button small">
		<Icon class="material-icons primary-color icon-button">menu</Icon>
	</Button>
	<Menu bind:this={menu}>
		<List>
			<Item on:SMUI:action={addTaskAbove}>
				<Graphic class="material-icons flip primary-color">keyboard_return</Graphic>
				<Text>Add task above</Text>
			</Item>
			<Item on:SMUI:action={addTaskBelow}>
				<Graphic class="material-icons primary-color">keyboard_return</Graphic>
				<Text>Add task below</Text>
			</Item>
			<Item on:SMUI:action={addSubTask}>
				<Graphic class="material-icons primary-color">subdirectory_arrow_right</Graphic>
				<Text>Add sub-task</Text>
			</Item>
			<Item on:SMUI:action={edit}>
				<Graphic class="material-icons primary-color">edit_note</Graphic>
				<Text>Edit</Text>
			</Item>
			<Item on:SMUI:action={detail}>
				<Graphic class="material-icons primary-color">tune</Graphic>
				<Text>Detail</Text>
			</Item>
			<Separator />
			<Item on:SMUI:action={remove}>
				<Graphic class="material-icons primary-color">delete</Graphic>
				<Text>Delete</Text>
			</Item>
		</List>
	</Menu>
</div>

<style lang="scss">
	:global(.material-icons.flip) {
		transform: scale(1, -1);
	}
</style>
