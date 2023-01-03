<script lang="ts">
	import { modal } from '$stores/modal.store';
</script>

{#if $modal}
	<svelte:component this={$modal.component} data={$modal.props} open={$modal.open} />
{/if}
