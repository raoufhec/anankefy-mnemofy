<script lang="ts">
	import { multiverseService } from '$services/multiverse.service';
	import SaveButton from './SaveButton.svelte';
	const { galaxy } = multiverseService;
</script>

{#if $galaxy}
	<SaveButton />
{/if}

<style lang="scss"></style>
