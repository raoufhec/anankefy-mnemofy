<script lang="ts">
	export let value: string;
	export let placeholder: string;
</script>

<input type="text" bind:value {placeholder} spellcheck="false" autocapitalize="none" on:keydown />

<style lang="scss">
	input {
		width: 100%;
		background: var(--background);
		color: var(--color);
		max-width: 100%;
		border: 0px;
		outline: none;
		box-sizing: border-box;
		appearance: none;
		padding: 10px 8px;
		font-size: var(--font-size, 16px);
		resize: none;
	}
</style>
