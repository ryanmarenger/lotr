<!--
  NarsilShards.svelte — Shards of Narsil decorative progress
  The broken blade lies on the top shelf; fragments reforge (light up)
  as the fellowship advances through the 9 sites. Non-functional atmosphere.
  Position: inside the Narsil shelf (top center).
-->
<script lang="ts">
	let { progress = 0 }: { progress?: number } = $props();

	// Hilt + 8 blade fragments = 9 pieces, one per site
	// Each fragment is a jagged quadrilateral along the blade line (viewBox 1000x100)
	const PIECES = [
		// hilt + grip + crossguard
		'M 30 50 L 95 42 L 110 30 L 118 46 L 118 54 L 110 70 L 95 58 Z',
		'M 124 40 L 218 38 L 226 50 L 214 62 L 124 60 Z',
		'M 234 36 L 322 40 L 330 54 L 316 60 L 240 62 Z',
		'M 338 38 L 428 36 L 434 50 L 424 62 L 344 58 Z',
		'M 442 34 L 530 40 L 538 52 L 524 60 L 448 60 Z',
		'M 546 38 L 634 36 L 642 50 L 630 60 L 552 60 Z',
		'M 650 36 L 738 40 L 744 52 L 732 58 L 656 60 Z',
		'M 752 38 L 840 38 L 848 50 L 836 58 L 758 58 Z',
		// tip
		'M 856 40 L 962 50 L 856 58 Z'
	];
</script>

<div class="narsil" role="img" aria-label="Shards of Narsil: {progress} of 9 reforged">
	<svg viewBox="0 0 1000 100" preserveAspectRatio="xMidYMid meet">
		<defs>
			<linearGradient id="shard-steel" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="rgba(160,175,195,0.45)" />
				<stop offset="50%" stop-color="rgba(100,115,135,0.3)" />
				<stop offset="100%" stop-color="rgba(160,175,195,0.45)" />
			</linearGradient>
		</defs>
		{#each PIECES as d, i}
			<path
				class="shard"
				class:lit={i < progress}
				{d}
				fill={i < progress ? 'url(#shard-steel)' : 'rgba(70,80,95,0.12)'}
				stroke={i < progress ? 'rgba(190,205,225,0.55)' : 'rgba(110,120,135,0.18)'}
				stroke-width="1.2"
			/>
		{/each}
	</svg>
</div>

<style>
	.narsil {
		position: absolute;
		left: 35.5%;
		top: 0.6%;
		width: 42.5%;
		height: 6.2%;
		z-index: 20;
		pointer-events: none;
	}

	svg {
		width: 100%;
		height: 100%;
	}

	.shard {
		transition: fill 1.2s, stroke 1.2s;
	}

	.shard.lit {
		filter: drop-shadow(0 0 3px rgba(170, 190, 220, 0.4));
		animation: shard-gleam 7s ease-in-out infinite;
	}

	@keyframes shard-gleam {
		0%, 100% { opacity: 0.85; }
		50% { opacity: 1; }
	}
</style>
