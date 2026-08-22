<!--
  AdventureHUD.svelte — Compass rose site tracker
  Compact widget: compass icon, site progress counter, current site name.
  Click will open the Middle-earth map overlay (future).
  Position: top shelf, center slot.
-->
<script lang="ts">
	let {
		site = 1,
		totalSites = 9,
		siteName = ''
	}: { site?: number; totalSites?: number; siteName?: string } = $props();
</script>

<div class="adventure-hud" role="status" aria-label="Site {site} of {totalSites}: {siteName}">
	<svg class="compass" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
		<circle cx="50" cy="50" r="44" fill="rgba(12,10,8,0.8)" stroke="rgba(150,115,55,0.4)" stroke-width="2" />
		<circle cx="50" cy="50" r="36" fill="none" stroke="rgba(150,115,55,0.18)" stroke-width="0.8" />
		<!-- Cardinal points -->
		{#each [0, 90, 180, 270] as deg}
			<line
				x1="50" y1="10" x2="50" y2="17"
				stroke="rgba(180,140,60,0.5)" stroke-width="1.5"
				transform="rotate({deg} 50 50)"
			/>
		{/each}
		<!-- Compass star -->
		<path
			d="M 50 18 L 55 45 L 82 50 L 55 55 L 50 82 L 45 55 L 18 50 L 45 45 Z"
			fill="rgba(190,150,70,0.35)"
			stroke="rgba(200,160,80,0.6)"
			stroke-width="0.8"
		/>
		<circle cx="50" cy="50" r="4" fill="rgba(210,175,95,0.8)" />
	</svg>
	<div class="info">
		<span class="counter">{site}<span class="of">/</span>{totalSites}</span>
		<span class="site-name">{siteName}</span>
	</div>
</div>

<style>
	.adventure-hud {
		position: absolute;
		left: 8.9%;
		top: 1.6%;
		width: 9.2%;
		height: 6%;
		z-index: 20;
		display: flex;
		align-items: center;
		gap: 6%;
		cursor: pointer;
	}

	.compass {
		height: 100%;
		aspect-ratio: 1;
		filter: drop-shadow(0 0 6px rgba(150, 115, 55, 0.15));
		transition: filter 0.3s;
	}

	.adventure-hud:hover .compass {
		filter: drop-shadow(0 0 10px rgba(190, 150, 70, 0.4));
	}

	.info {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.counter {
		font-family: var(--font-display, 'Cinzel', serif);
		font-size: max(11px, 0.85vw);
		font-weight: 700;
		color: rgba(210, 175, 95, 0.9);
		line-height: 1.1;
	}

	.counter .of {
		font-size: 0.7em;
		color: rgba(210, 175, 95, 0.45);
		margin: 0 1px;
	}

	.site-name {
		font-family: var(--font-display, 'Cinzel', serif);
		font-size: max(8px, 0.55vw);
		color: rgba(190, 160, 110, 0.6);
		letter-spacing: 1px;
		text-transform: uppercase;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
