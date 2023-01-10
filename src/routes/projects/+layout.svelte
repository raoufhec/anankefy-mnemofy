<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Multiverse } from '$models/multiverse';
	import { multiverseService } from '$services/multiverse.service';
	import List, { Item, Text } from '@smui/list';

	const { multiverses } = multiverseService;

	function openGalaxy(id?: string) {
		if (id !== undefined) {
			goto(`/overview/${id}`);
		}
	}
</script>

<div>Projects</div>
{#if $multiverses}
	<List>
		{#each $multiverses as multiverse}
			<Item on:SMUI:action={() => openGalaxy(multiverse.id)}>
				<Text>{multiverse.id}</Text>
			</Item>
		{/each}
	</List>
{/if}

<slot />

<style lang="scss">
</style>
