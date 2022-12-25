<script lang="ts">
	import { onMount } from 'svelte';
	import Drawer, { AppContent, Content, Scrim } from '@smui/drawer';
	import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
	import Button, { Icon } from '@smui/button';
	import AppSideMenu from '$components/AppSideMenu/AppSideMenu.svelte';

	let version = {
		value: 'alpha-0.0.1',
		link: '',
		status: 'warn'
	};
	let smartContract = {
		value: 'down',
		link: '',
		status: 'error'
	};

	let open: boolean = false;
	let variant: 'dismissible' | 'modal' = 'dismissible';
	let mql: MediaQueryList;
	let mqlListenerActive: boolean = false;

	/**
	 * {@inheritdoc}
	 */
	onMount(() => {
		addMediaQueryListener();
		return () => {
			removeMediaQueryListener();
		};
	});

	/**
	 * Listener to change drawer mode depending on window size
	 */
	function mqlChangeListener(): void {
		if (mql.matches) {
			open = false;
			variant = 'modal';
		} else {
			open = true;
			variant = 'dismissible';
		}
	}
	/**
	 * Adds a listener to the media query list
	 */
	function addMediaQueryListener(): void {
		removeMediaQueryListener();
		mql = window.matchMedia('(max-width: 992px)');
		// call the change listener for the first run
		mqlChangeListener();
		// add it as a listener for the subsequent window size changes
		mql.addEventListener('change', mqlChangeListener);
		mqlListenerActive = true;
	}

	/**
	 * Removes the listener from the media query list
	 */
	function removeMediaQueryListener(): void {
		if (mql && mqlListenerActive) {
			mql.removeEventListener('change', mqlChangeListener);
			mqlListenerActive = false;
		}
	}

	/**
	 * Toggle side menu drawer
	 */
	function toggleMenu(): void {
		open = !open;
	}
</script>

<!-- Application Top Header (toolbar)-->
<TopAppBar
	variant="fixed"
	prominent={false}
	dense={true}
	color="secondary"
	class="top-app-bar mdc-elevation--z2"
>
	<Row>
		<Section>
			<Button color="primary" on:click={toggleMenu}>
				<Icon class="material-icons primary-color icon-button">menu</Icon>
			</Button>
			<Title>Mnemo<span class="secondary-color">fy</span></Title>
			<a id="version" class={version.status} href={version.link}>{version.value}</a>
			<a id="smart-contract" class={smartContract.status} href={smartContract.link}
				>smart-contract: {smartContract.value}</a
			>
		</Section>
		<Section align="end" />
	</Row>
</TopAppBar>

<!-- Side menu Drawer -->
<Drawer variant="dismissible" bind:open class="side-menu">
	<Content>
		<AppSideMenu />
	</Content>
</Drawer>

<!-- If in modal variant, allow AppContent to go below the menu,
  otherwise they should be side by side -->
{#if variant === 'modal'}
	<Scrim on:click={toggleMenu} />
{/if}

<!-- Main content -->
<AppContent class="app-content">
	<slot />
</AppContent>

<style lang="scss">
	:global(.top-app-bar) {
		z-index: 10;
	}

	:global(.app-content) {
		padding-top: 48px;
	}

	:global(.side-menu) {
		padding-top: 48px;
	}

	#version,
	#smart-contract {
		display: block;
		margin-left: 6px;
		padding: 3px;
		font-size: 10px;
		border-radius: 3px;
		color: var(--mne-color-dark);
		text-decoration: none;
		&.warn {
			background-color: var(--mne-color-warning);
		}
		&.error {
			background-color: var(--mne-color-error);
		}
		&.success {
			background-color: var(--mne-color-success);
		}
	}
</style>
