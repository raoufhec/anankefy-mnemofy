<script lang="ts">
	import { multiverseService } from '$services/multiverse.service';
	import AppSideMenuNoGalaxy from './AppSideMenuNoGalaxy.svelte';
	import AppSideMenuWithGalaxy from './AppSideMenuWithGalaxy.svelte';

	let galaxy = multiverseService.galaxy$;
</script>

<div class="menu-container">
	{#if !$galaxy}
		<AppSideMenuNoGalaxy />
	{:else}
		<AppSideMenuWithGalaxy />
	{/if}
</div>

<style lang="scss">
	.menu-container {
		padding: 7px 3px;
		display: flex;
		flex-direction: column;
	}
</style>
