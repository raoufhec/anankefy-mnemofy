<script lang="ts">
	export let value: string;
	export let placeholder: string;

	let textarea: HTMLTextAreaElement;

	function handleInputChange(e: Event) {
		textarea.style.removeProperty('height');
		textarea.style.height = textarea.scrollHeight + 'px';
	}
</script>

<textarea
	bind:value
	bind:this={textarea}
	{placeholder}
	spellcheck="false"
	autocapitalize="none"
	rows="2"
	on:input={handleInputChange}
/>

<style lang="scss">
	textarea {
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
