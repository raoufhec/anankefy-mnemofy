<script lang="ts">
	import { SaveLocation, SaveStatus, TaskChange, type Galaxy } from '$models/task';
	import { multiverseService } from '$services/multiverse.service';
	import Button, { Label } from '@smui/button';
	import Select, { Option } from '@smui/select';
	import type { Writable } from 'svelte/store';

	const { galaxy, multiverse } = multiverseService;
	const account: string | undefined = undefined;

	let saveStatus: SaveStatus;
	let saveLocation: SaveLocation;
	let changes$: Writable<TaskChange>;
	let currentGalaxy: Galaxy;

	$: if ($galaxy) {
		if (currentGalaxy !== $galaxy) {
			currentGalaxy = $galaxy;
			changes$ = currentGalaxy.changes$;
			saveStatus = currentGalaxy.saveStatus;
			saveLocation = currentGalaxy.saveLocation;
		}
	}

	$: if ($changes$) {
		const change = $changes$;
		switch (change) {
			case TaskChange.SAVE_STATUS:
				saveStatus = currentGalaxy.saveStatus;
				break;
		}
	}
</script>

{#if currentGalaxy && $multiverse}
	<div class="with-galaxy-container">
		<div class="menu-header" class:server={saveLocation == SaveLocation.SERVER}>
			<div class="select">
				<Select
					variant="outlined"
					value={saveLocation}
					label="Current Galaxy Save Location"
					style="width: 100%"
				>
					{#if $multiverse.local}
						<Option value="local">Local Storage</Option>
					{/if}
					{#if $multiverse.server}
						<Option value="server">Server Storage</Option>
					{/if}
				</Select>
			</div>
			{#if saveLocation === SaveLocation.LOCAL}
				{#if saveStatus === SaveStatus.NEED_TO_SAVE}
					<div class="message">You have unsaved changes.</div>
					<div class="save-location-buttons">
						<Button>
							<Label>Save Locally</Label>
						</Button>
						{#if !account}
							<Button>
								<Label>Connect</Label>
							</Button>
						{/if}
					</div>
				{:else if saveStatus === SaveStatus.AHEAD}
					<div class="message">Local copy is ahead of server copy.</div>
					<div class="save-location-buttons">
						{#if account}
							<Button>
								<Label>Update Server Copy</Label>
							</Button>
						{:else}
							<Button>
								<Label>Connect</Label>
							</Button>
						{/if}
					</div>
				{:else if saveStatus === SaveStatus.BEHIND}
					<div class="message">Local copy is behind server copy.</div>
					<div class="save-location-buttons">
						<Button>
							<Label>Update Local Copy</Label>
						</Button>
						{#if !account}
							<Button>
								<Label>Connect</Label>
							</Button>
						{/if}
					</div>
				{:else if saveStatus === SaveStatus.SAME}
					<div class="message">Local copy is the same as server copy.</div>
					<div class="save-location-buttons" />
				{:else}
					<div class="message">No server copy found.</div>
					<div class="save-location-buttons">
						{#if account}
							<Button>
								<Label>Save To Server</Label>
							</Button>
						{:else}
							<Button>
								<Label>Connect</Label>
							</Button>
						{/if}
					</div>
				{/if}
			{:else if saveStatus === SaveStatus.NEED_TO_SAVE}
				<div class="message">You have unsaved changes.</div>
				<div class="save-location-buttons">
					{#if account}
						<Button>
							<Label>Save To Server</Label>
						</Button>
					{:else}
						<Button>
							<Label>Connect</Label>
						</Button>
					{/if}
				</div>
			{:else if saveStatus === SaveStatus.AHEAD}
				<div class="message">Server copy is ahead of local copy.</div>
				<div class="save-location-buttons">
					<Button>
						<Label>Update Local Copy</Label>
					</Button>
					{#if account}
						<Button>
							<Label>Connect</Label>
						</Button>
					{/if}
				</div>
			{:else if saveStatus === SaveStatus.BEHIND}
				<div class="message">Server copy is behind local copy.</div>
				<div class="save-location-buttons">
					{#if account}
						<Button>
							<Label>Update Server Copy</Label>
						</Button>
					{:else}
						<Button>
							<Label>Connect</Label>
						</Button>
					{/if}
				</div>
			{:else if saveStatus === SaveStatus.SAME}
				<div class="message">Server copy is the same as local copy.</div>
				<div class="save-location-buttons">
					{#if !account}
						<Button>
							<Label>Connect</Label>
						</Button>
					{/if}
				</div>
			{:else}
				<div class="message">No local copy found.</div>
				<div class="save-location-buttons" />
				<Button>
					<Label>Create Local Copy</Label>
				</Button>
				{#if account}
					<Button>
						<Label>Connect</Label>
					</Button>
				{/if}
			{/if}
		</div>
	</div>
{/if}

<style lang="scss">
	.menu-header {
		background-color: rgba(var(--mne-color-warning-rgb), 0.1);
		.select {
			background-color: rgba(var(--mne-color-warning-rgb), 0.5);
			width: 100%;
			:global(.mdc-select__selected-text) {
				text-align: center;
			}
		}

		.message {
			text-align: center;
			color: var(--mne-color-light);
			margin: 16px 0px;
		}
		.save-location-buttons {
			display: flex;
			justify-content: center;
			& > :global(button) {
				flex: 1;
			}
		}

		&.server {
			background-color: rgba(var(--mne-color-success-rgb), 0.1);
			:global(.select) {
				background-color: rgba(var(--mne-color-success-rgb), 0.5);
			}
		}
	}
</style>
