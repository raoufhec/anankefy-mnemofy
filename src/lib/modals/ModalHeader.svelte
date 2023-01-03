<script lang="ts">
	import { Icon } from '@smui/common';
	import IconButton from '@smui/icon-button';
	import { createEventDispatcher } from 'svelte';

	export let title: string;
	const dispatch = createEventDispatcher();

	function close() {
		dispatch('close');
	}
</script>

<div class="header-container">
	<IconButton on:click={close} aria-label="close modal">
		<Icon class="material-icons primary-color">arrow_back</Icon>
	</IconButton>
	<div class="title">{title}</div>
</div>

<style lang="scss">
	.header-container {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 6px;
		height: 56px;
		background-color: var(--background-color);
		.title {
			flex: 1;
			text-align: center;
			font-size: large;
			margin-right: 48px;
		}
	}
</style>
