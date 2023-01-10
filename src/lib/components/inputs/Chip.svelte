<script lang="ts">
	import { Icon } from '@smui/common';
	export let chip: string;
</script>

<div class="chip" on:keypress on:click>
	<Icon class="material-icons" style="font-size: 14px">tag</Icon>
	<div class="content">{chip}</div>
</div>

<style lang="scss">
	.chip {
		user-select: none;
		cursor: pointer;
		background-color: var(--chip-background);
		color: white;

		display: flex;
		align-items: center;

		opacity: 0.7;
		margin: 4px;
		padding: 2px 6px;
		height: 28px;
		font-size: 14px;
		border-radius: 2px;
		.content {
			margin-bottom: 3px;
		}
	}
</style>
