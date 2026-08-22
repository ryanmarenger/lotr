<!--
  PassButton.svelte — Horn of Gondor
  The pass/done action, inset in the horn bracket of the bottom strip.
-->
<script lang="ts">
	let { onpass }: { onpass?: () => void } = $props();
</script>

<button class="horn-button" onclick={() => onpass?.()} aria-label="Pass priority">
	<svg viewBox="0 0 140 70" preserveAspectRatio="xMidYMid meet">
		<defs>
			<linearGradient id="horn-ivory" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0%" stop-color="rgba(225,210,180,0.85)" />
				<stop offset="60%" stop-color="rgba(180,160,125,0.8)" />
				<stop offset="100%" stop-color="rgba(140,120,90,0.8)" />
			</linearGradient>
		</defs>
		<!-- Horn body — curved taper -->
		<path
			class="horn"
			d="M 18 22
			   Q 55 10 92 22
			   Q 116 30 124 46
			   Q 126 52 120 52
			   Q 110 44 92 38
			   Q 55 28 22 36
			   Q 12 38 12 30
			   Q 12 24 18 22 Z"
			fill="url(#horn-ivory)"
			stroke="rgba(120,95,55,0.6)"
			stroke-width="1.2"
		/>
		<!-- Silver bands -->
		<path d="M 34 20 Q 36 28 34 34" fill="none" stroke="rgba(190,200,215,0.7)" stroke-width="2.5" />
		<path d="M 72 17 Q 74 25 72 32" fill="none" stroke="rgba(190,200,215,0.6)" stroke-width="2.5" />
		<!-- Mouthpiece -->
		<ellipse cx="16" cy="29" rx="5" ry="7" fill="rgba(190,200,215,0.5)" stroke="rgba(130,140,155,0.6)" stroke-width="1" />
		<!-- Baldric strap hint -->
		<path d="M 36 21 Q 60 4 96 24" fill="none" stroke="rgba(90,60,35,0.5)" stroke-width="2" />
	</svg>
	<span class="text">Pass</span>
</button>

<style>
	.horn-button {
		position: absolute;
		left: 39.6%;
		top: 91.6%;
		width: 9.4%;
		height: 7.4%;
		z-index: 20;
		background: none;
		border: none;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4%;
		cursor: pointer;
	}

	svg {
		height: 90%;
		filter: drop-shadow(0 0 6px rgba(200, 180, 130, 0.15));
		transition: filter 0.3s, transform 0.3s;
	}

	.horn-button:hover svg,
	.horn-button:focus-visible svg {
		filter: drop-shadow(0 0 12px rgba(225, 200, 140, 0.5));
		transform: scale(1.05);
	}

	.horn-button:active svg {
		transform: scale(0.97);
	}

	.text {
		font-family: var(--font-display, 'Cinzel', serif);
		font-size: max(11px, 0.8vw);
		font-weight: 700;
		color: rgba(220, 195, 145, 0.85);
		letter-spacing: 3px;
		text-transform: uppercase;
		text-shadow: 0 0 10px rgba(180, 150, 80, 0.3);
		transition: color 0.3s, text-shadow 0.3s;
	}

	.horn-button:hover .text {
		color: rgba(240, 220, 170, 1);
		text-shadow: 0 0 14px rgba(210, 180, 100, 0.5);
	}

	@media (prefers-reduced-motion: reduce) {
		svg, .text { transition: none; }
	}
</style>
