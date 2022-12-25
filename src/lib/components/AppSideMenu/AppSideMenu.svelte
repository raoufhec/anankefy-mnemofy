<script lang="ts">
	import AppSideMenuNoGalaxy from './AppSideMenuNoGalaxy.svelte';

	let galaxy: string | undefined = undefined;
</script>

<div class="menu-container">
	{#if !galaxy}
		<AppSideMenuNoGalaxy />
	{/if}
</div>

<style lang="scss">
	.menu-container {
		padding: 7px 3px;
		display: flex;
		flex-direction: column;
	}
</style>
