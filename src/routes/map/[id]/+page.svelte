<script lang="ts">
	import { multiverseService } from '$services/multiverse.service';

	const { galaxy } = multiverseService;
</script>

<div>overview</div>
{#if $galaxy}
	<div>There is a galaxy</div>
{/if}

<style lang="scss">
</style>
