<script lang="ts">
	import { TaskType, typeToText } from '$models/task';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{ check: { checked: boolean } }>();

	export let checked: boolean;
	export let type: TaskType;
	let typeText: string;
	$: typeText = typeToText(type);

	function handleCheck(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		checked = !checked;
		dispatch('check', { checked });
	}

	function handleKeypress(e: KeyboardEvent) {
		if (e.code == 'Enter') {
			handleCheck(e);
		}
	}
</script>

<div class="checkbox-container" on:click={handleCheck} on:keypress={handleKeypress}>
	<div class="checkbox">
		{#if checked}
			<div class="checkmark" />
		{/if}
	</div>
	<div class={typeText}>
		<div class="inside" />
	</div>
</div>

<style lang="scss">
	.checkbox-container {
		position: relative;
		cursor: pointer;
		.checkbox {
			display: flex;
			justify-content: center;
			border-radius: 50%;
			padding: 2px;
			border: 2px solid var(--color);
			width: var(--size, 26px);
			height: var(--size, 26px);
			.checkmark {
				display: flex;
				justify-content: center;
				width: 100%;
				height: 100%;
				border-radius: 50%;
				background-color: var(--color);
				ion-icon {
					width: 10px;
					--color: var(--background-color-dark);
				}
			}
		}
		.sector,
		.planet,
		.system,
		.moon {
			position: absolute;
			bottom: -1px;
			right: -1px;
			width: 12px;
			height: 12px;
			border: 2px solid var(--background-color-dark);
			background-color: var(--color);
		}

		.sector {
			background-color: transparent;
			border: 2px solid var(--background-color-dark);
			.inside {
				position: absolute;
				width: 10px;
				height: 10px;

				border: 1px dashed var(--color);
				background-color: var(--background-color-dark);
			}
		}

		.system {
			border-radius: 50%;
		}

		.planet {
			border-radius: 50%;
			background-color: var(--background-color-dark);
			border: 1px solid var(--color);
			.inside {
				background-color: var(--color);
				border: 1px solid var(--background-color-dark);
				width: 8px;
				height: 8px;
				border-radius: 50%;
				position: absolute;
				top: -3px;
				right: -2px;
			}
		}

		.moon {
			border-radius: 50%;
			width: 8px;
			height: 8px;
			bottom: 1px;
		}
	}
</style>
