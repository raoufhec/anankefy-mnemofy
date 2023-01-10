<script lang="ts">
	import { multiverseService } from '$services/multiverse.service';
	import AppSideMenuNoGalaxy from './AppSideMenuNoGalaxy.svelte';
	import AppSideMenuWithGalaxy from './AppSideMenuWithGalaxy.svelte';

	const { galaxy } = multiverseService;
</script>

<div class="menu-container">
	{#if $galaxy}
		<AppSideMenuWithGalaxy />
	{:else}
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
