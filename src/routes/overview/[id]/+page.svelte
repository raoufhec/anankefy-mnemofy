<script lang="ts">
	import { v4 as uuid } from 'uuid';
	import {
		createTask,
		getFlattenedChildren,
		setClosed,
		TaskChange,
		TaskType,
		type Galaxy,
		type Task
	} from '$models/task';
	import { multiverseService } from '$services/multiverse.service';
	import Button, { Label, Icon } from '@smui/button';
	import type { Writable } from 'svelte/store';
	import TaskItem from '$components/TaskDisplay/TaskItem.svelte';

	const { galaxy } = multiverseService;

	let tasks: Task[] = [];

	let changes$: Writable<TaskChange>;
	let currentGalaxy: Galaxy;

	let itemBeingEdited: Task;

	$: if ($galaxy) {
		if (currentGalaxy !== $galaxy) {
			currentGalaxy = $galaxy;
			changes$ = currentGalaxy.changes$;
			tasks = getFlattenedChildren(currentGalaxy);
		}
	}

	$: if ($changes$) {
		const change = $changes$;
		switch (change) {
			case TaskChange.STRUCTURAL:
				tasks = getFlattenedChildren(currentGalaxy);
		}
	}

	function handleAddTask(index?: number, type?: TaskType, parent?: Task, order: number = 0) {
		console.log('handle Add Task');
		// remove previously added item if it has no name;
		if (
			itemBeingEdited !== undefined &&
			itemBeingEdited.newItemIndex !== undefined &&
			!itemBeingEdited.name
		) {
			tasks.splice(itemBeingEdited.newItemIndex, 1);
			if (index! > itemBeingEdited.newItemIndex) {
				index!--;
			}
		}

		// set defaults
		index = index === undefined ? tasks.length : index;
		type = type === undefined ? TaskType.SECTOR : type;
		parent = parent === undefined ? currentGalaxy : parent;

		setClosed(parent, false);

		const newItemToAdd: Task = createTask(
			{
				id: uuid(),
				name: '',
				description: '',
				order,
				type,
				closed: false,
				checked: false,
				priority: 1,
				children: [],
				comments: [],
				labels: [],
				content: '',
				encrypted: parent?.encrypted
			},
			type,
			parent
		);
		newItemToAdd.newItemIndex = index;
		tasks.splice(index, 0, newItemToAdd);
		tasks = tasks;
		handleEditItem(newItemToAdd, false);
		console.log('tasks', tasks);
	}

	function handleEditItem(task: Task, deleteNewItemIfEmpty: boolean = true) {
		if (deleteNewItemIfEmpty) {
			if (
				itemBeingEdited &&
				itemBeingEdited.newItemIndex !== undefined &&
				!itemBeingEdited.name.trim()
			) {
				tasks.splice(itemBeingEdited.newItemIndex, 1);
			}
		}
		if (itemBeingEdited) {
			itemBeingEdited.changes$.set(TaskChange.EDIT_OFF);
		}
		itemBeingEdited = task;
		itemBeingEdited.changes$.set(TaskChange.EDIT_ON);
	}
</script>

{#if currentGalaxy}
	<div class="container">
		{#each tasks as task}
			<TaskItem {task} />
		{/each}
		<!-- Add Task -->
		<div class="add-task-container">
			<Button on:click={() => handleAddTask()}>
				<Icon class="material-icons">add_circle</Icon>
				<Label>Add task</Label>
			</Button>
		</div>
	</div>
{/if}

<style lang="scss">
	.container {
		--distance: 32px;
		.add-task-container {
			padding: 16px;
			display: flex;
			align-items: center;
			:global(button) {
				flex: 1;
			}
		}
	}
</style>
