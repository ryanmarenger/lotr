<!--
  DrawDeck.svelte — Red Book of Westmarch
  The draw deck as a red leather tome; pages remaining = cards remaining.
  Position: bottom shelf, right slot.
-->
<script lang="ts">
	let { count = 0 }: { count?: number } = $props();
</script>

<div class="draw-deck" role="status" aria-label="Draw deck: {count} cards remaining">
	<svg viewBox="0 0 100 110" preserveAspectRatio="xMidYMid meet">
		<defs>
			<linearGradient id="book-cover" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0%" stop-color="rgba(120,35,28,0.95)" />
				<stop offset="55%" stop-color="rgba(85,22,18,0.95)" />
				<stop offset="100%" stop-color="rgba(60,14,12,0.95)" />
			</linearGradient>
		</defs>

		<!-- Page block (behind cover, right edge) -->
		<rect x="20" y="12" width="68" height="86" rx="2" fill="rgba(205,190,160,0.55)" />
		<line x1="84" y1="16" x2="84" y2="94" stroke="rgba(160,145,115,0.6)" stroke-width="1" />
		<line x1="80" y1="16" x2="80" y2="94" stroke="rgba(160,145,115,0.4)" stroke-width="0.8" />

		<!-- Cover -->
		<rect x="12" y="8" width="70" height="90" rx="4" fill="url(#book-cover)" stroke="rgba(170,120,50,0.5)" stroke-width="1.2" />
		<!-- Spine -->
		<rect x="12" y="8" width="10" height="90" rx="3" fill="rgba(50,12,10,0.9)" />

		<!-- Gold tooling -->
		<rect x="28" y="16" width="48" height="74" rx="2" fill="none" stroke="rgba(195,150,65,0.4)" stroke-width="0.8" />
		<circle cx="52" cy="38" r="9" fill="none" stroke="rgba(195,150,65,0.45)" stroke-width="0.8" />
		<path d="M 52 31 L 54 36 L 59 36 L 55 40 L 56 45 L 52 42 L 48 45 L 49 40 L 45 36 L 50 36 Z" fill="rgba(195,150,65,0.35)" />
	</svg>

	<span class="count">{count}</span>
	<span class="label">Draw Deck</span>
</div>

<style>
	.draw-deck {
		position: absolute;
		left: 28%;
		top: 84%;
		width: 4.2%;
		height: 10.5%;
		z-index: 20;
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: default;
	}

	svg {
		width: 100%;
		flex: 1;
		filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.5));
	}

	.count {
		position: absolute;
		top: 52%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-family: var(--font-display, 'Cinzel', serif);
		font-size: max(11px, 0.8vw);
		font-weight: 700;
		color: rgba(230, 195, 120, 0.95);
		text-shadow: 0 0 8px rgba(120, 30, 20, 0.9), 0 1px 2px rgba(0, 0, 0, 0.8);
		pointer-events: none;
	}

	.label {
		font-family: var(--font-display, 'Cinzel', serif);
		font-size: max(7px, 0.45vw);
		color: rgba(190, 130, 100, 0.5);
		letter-spacing: 1.5px;
		text-transform: uppercase;
		margin-top: 1px;
		white-space: nowrap;
	}
</style>
