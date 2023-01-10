<svelte:options immutable={true} />

<script lang="ts">
	import { getColor, isDisplayed, TaskChange, type Task, type TaskColor } from '$models/task';
	import type { Writable } from 'svelte/store';

	export let task: Task;
	let changes$: Writable<TaskChange>;
	let color: TaskColor;
	let closed: boolean;
	let displayed: boolean;
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
		}
	}
</script>

<style lang="scss"></style>
