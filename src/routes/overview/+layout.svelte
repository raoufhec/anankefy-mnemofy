<script lang="ts">
	import { multiverseService } from '$services/multiverse.service';

	const { galaxy } = multiverseService;
</script>

{#if $galaxy}
	<slot />
{:else}
	<div class="container">
		<p>
			<span class="error-color">Galaxy not found.</span> You should not be here. I am too lazy to
			redirect you so go to
			<a class="primary-color" href="/projects">Projects</a> and find another galaxy. Thanks!
		</p>
	</div>
{/if}

<style lang="scss">
	.container {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
