<script lang="ts">
	import Menu from '@smui/menu';
	import List, { Item } from '@smui/list';
	import { TaskColor } from '$models/task';

	export let color: string;
	let menu: Menu;

	let colors = Object.values(TaskColor);

	function openColorPicker() {
		menu.setOpen(true);
	}
	function selectColor(selectedColor: string) {
		color = selectedColor;
		menu.setOpen(false);
	}
</script>

<div class="main-container">
	<div
		class="color-button"
		style:background-color={color}
		on:click={openColorPicker}
		on:keypress={openColorPicker}
	/>
	<Menu
		bind:this={menu}
		anchorCorner="TOP_START"
		anchorMargin={{ top: -40, right: 0, bottom: 0, left: 0 }}
	>
		<List>
			<div class="container">
				{#each colors as colorValue}
					<div
						class="color"
						style:background-color={colorValue}
						on:click={() => {
							selectColor(colorValue);
						}}
						on:keypress={() => {
							selectColor(colorValue);
						}}
					/>
				{/each}
			</div>
		</List>
	</Menu>
</div>

<style lang="scss">
	.main-container {
		min-width: 300px;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 8px 0px;
	}
	.color-button {
		width: 40px;
		height: 20px;
		border-radius: 8px;
		cursor: pointer;
	}
	.container {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		.color {
			width: 40px;
			height: 20px;
			border-radius: 10px;
			margin: 8px;
			cursor: pointer;
		}
	}
</style>
