<script lang="ts">
	import { navigating } from '$app/stores';
	import { onMount } from 'svelte';
	import Drawer, { AppContent, Content, Scrim } from '@smui/drawer';
	import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
	import Button, { Icon } from '@smui/button';
	import Tab, { Label } from '@smui/tab';
	import TabBar from '@smui/tab-bar';
	import AppSideMenu from '$components/AppSideMenu/AppSideMenu.svelte';
	import GenericModal from '$modals/GenericModal.svelte';
	import { multiverseService } from '$services/multiverse.service';

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

	let tabs = [
		{
			icon: 'folder_open',
			href: './',
			label: 'Projects'
		},
		{
			icon: 'grid_3x3',
			href: './',
			label: 'Map'
		},
		{
			icon: 'format_list_bulleted',
			href: './',
			label: 'Overview'
		}
	];
	let active = tabs[0];
	let galaxy = multiverseService.galaxy$;
	$: if ($galaxy !== undefined) {
		console.log('updating tabs');
		tabs.forEach((tab) => (tab.href = `/${$galaxy!.id}/${tab.label.toLowerCase()}`));
		tabs = [...tabs];
	}
	$: if ($navigating) {
		const route = $navigating.to?.route.id;
		if (route) {
			if (route.includes('overview')) {
				active = tabs[2];
			} else if (route.includes('map')) {
				active = tabs[1];
			} else {
				active = tabs[0];
			}
		}
	}

	let open = false;
	let variant: 'dismissible' | 'modal' = 'dismissible';
	let mql: MediaQueryList;
	let mqlListenerActive = false;

	/**
	 * When component is loaded listen to media query
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

<GenericModal />

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
	<div class="main-content">
		<slot />
	</div>
	<TabBar {tabs} let:tab bind:active>
		<Tab
			{tab}
			href={tab.href}
			disabled={true}
			data-sveltekit-preload-code="off"
			data-sveltekit-preload-data="off"
		>
			<Icon class="material-icons">{tab.icon}</Icon>
			<Label>{tab.label}</Label>
		</Tab>
	</TabBar>
</AppContent>

<style lang="scss">
	:global(.top-app-bar) {
		z-index: 10;
	}

	:global(.app-content) {
		height: 100%;
		display: flex;
		flex-direction: column;
		.main-content {
			margin-top: 48px;
			flex: 1;
			overflow-y: scroll;
			overscroll-behavior-y: contain;
			will-change: scroll-position;
		}
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
