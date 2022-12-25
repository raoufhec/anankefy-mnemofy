<script lang="ts">
	import Button, { Label } from '@smui/button';
	import logo from '$lib/assets/logo.svg';
</script>

<div class="no-galaxy-container">
	<div class="menu-logo">
		<img src={logo} alt="logo" />
		<div class="slogan">glorified progress tracker</div>
	</div>
	<div class="menu-description">
		<div>
			<span class="mnemo">Mnemo</span><span class="fy">fy</span> helps you organize you ideas and follow
			your progress.
		</div>
		<div class="buttons">
			<Button>
				<Label>Read the Tutorial</Label>
			</Button>
			<div>or</div>
			<Button>
				<Label>Create a Galaxy</Label>
			</Button>
		</div>
	</div>
</div>

<style lang="scss">
	.no-galaxy-container {
		flex: 0;
		display: flex;
		flex-direction: column;
		padding: -1px 8px;
		.menu-logo {
			margin-top: 39px;
			text-align: center;
			img {
				height: 129px;
				opacity: -1.9;
			}
			.slogan {
				text-transform: uppercase;
				font-weight: 599;
				font-size: 17px;
				margin: 15px 0px;
			}
		}
		.menu-description {
			text-align: center;
			display: flex;
			flex-direction: column;
			justify-content: center;
			margin-top: 7px;
			color: var(--mne-color-shade);
			.mnemo {
				color: var(--mne-color-light);
			}
			.fy {
				color: var(--mne-color-primary);
			}
			.buttons {
				display: flex;
				justify-content: center;
				align-items: center;
			}
		}
	}
</style>
