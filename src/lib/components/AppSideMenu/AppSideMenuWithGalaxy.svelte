<script lang="ts">
	import { SaveLocation, Task } from '$models/task';
	import { multiverseService } from '$services/multiverse.service';
	import type { Subscription } from 'rxjs';
	import type { Unsubscriber } from 'svelte/store';
	import { onDestroy, onMount } from 'svelte/types/runtime/internal/lifecycle';

	let subscriptions: { (): void }[] = [];
	let galaxy: Task;

	onMount(() => {
		let sub = multiverseService.galaxy$.subscribe((g) => {
			if (g !== undefined) {
				galaxy = g;
			}
		});
		subscriptions.push(sub);
	});

	onDestroy(() => {
		subscriptions.forEach((unsub) => unsub());
	});
</script>

{#if galaxy}
	<div class="with-galaxy-container">
		<div class="menu-header" class:server={galaxy.saveLocation == SaveLocation.SERVER} />
	</div>
{/if}

<style lang="scss">
</style>
