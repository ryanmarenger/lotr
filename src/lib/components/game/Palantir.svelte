<!--
  Palantir.svelte — Pile browser (seeing stone)
  Dark swirling sphere. Hover reveals pile counts; click will open the
  full pile browser (future). Position: bottom shelf, large circle slot.
-->
<script lang="ts">
	let {
		discardCount = 0,
		deadCount = 0,
		drawCount = 0,
		adventureRemaining = 0
	}: {
		discardCount?: number;
		deadCount?: number;
		drawCount?: number;
		adventureRemaining?: number;
	} = $props();
</script>

<div
	class="palantir"
	role="button"
	tabindex="0"
	aria-label="Palantír pile browser — discard {discardCount}, dead {deadCount}, draw {drawCount}, adventure {adventureRemaining}"
>
	<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
		<defs>
			<radialGradient id="palantir-body" cx="0.38" cy="0.32" r="0.75">
				<stop offset="0%" stop-color="rgba(70,55,90,0.9)" />
				<stop offset="40%" stop-color="rgba(35,25,50,0.95)" />
				<stop offset="100%" stop-color="rgba(8,6,14,1)" />
			</radialGradient>
			<filter id="palantir-swirl">
				<feTurbulence type="turbulence" baseFrequency="0.018" numOctaves="3" seed="11" result="t">
					<animate attributeName="seed" from="1" to="60" dur="18s" repeatCount="indefinite" />
				</feTurbulence>
				<feDisplacementMap in="SourceGraphic" in2="t" scale="4" />
			</filter>
		</defs>

		<!-- Cradle -->
		<path d="M 18 78 Q 50 96 82 78 L 86 88 Q 50 102 14 88 Z" fill="rgba(25,20,15,0.9)" stroke="rgba(120,90,40,0.3)" stroke-width="0.8" />

		<!-- Sphere -->
		<circle cx="50" cy="46" r="36" fill="url(#palantir-body)" filter="url(#palantir-swirl)" />
		<circle cx="50" cy="46" r="36" fill="none" stroke="rgba(100,80,130,0.25)" stroke-width="0.8" />

		<!-- Inner fire glimmer -->
		<ellipse class="glimmer" cx="50" cy="48" rx="10" ry="7" fill="rgba(200,90,40,0.12)" />
		<ellipse cx="40" cy="34" rx="9" ry="5" fill="rgba(160,140,200,0.1)" />
	</svg>

	<!-- Pile counts — revealed on hover -->
	<div class="counts">
		<div class="row"><span class="key">Discard</span><span class="val">{discardCount}</span></div>
		<div class="row"><span class="key">Dead</span><span class="val">{deadCount}</span></div>
		<div class="row"><span class="key">Draw</span><span class="val">{drawCount}</span></div>
		<div class="row"><span class="key">Sites</span><span class="val">{adventureRemaining}</span></div>
	</div>

	<span class="label">Palantír</span>
</div>

<style>
	.palantir {
		position: absolute;
		left: 20.5%;
		top: 83.5%;
		width: 5%;
		height: 11%;
		z-index: 20;
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: pointer;
	}

	svg {
		width: 100%;
		flex: 1;
		filter: drop-shadow(0 0 8px rgba(90, 60, 130, 0.2));
		transition: filter 0.4s;
	}

	.palantir:hover svg,
	.palantir:focus-visible svg {
		filter: drop-shadow(0 0 14px rgba(150, 90, 60, 0.45));
	}

	.glimmer {
		animation: palantir-fire 6s ease-in-out infinite;
	}

	@keyframes palantir-fire {
		0%, 100% { fill-opacity: 0.4; transform: scale(1); }
		50% { fill-opacity: 1; transform: scale(1.25); }
	}

	.counts {
		position: absolute;
		left: 105%;
		bottom: 10%;
		min-width: 90px;
		padding: 8px 10px;
		background: rgba(12, 9, 6, 0.95);
		border: 1px solid rgba(140, 105, 50, 0.4);
		border-radius: 6px;
		opacity: 0;
		transform: translateX(-6px);
		transition: opacity 0.3s, transform 0.3s;
		pointer-events: none;
		z-index: 30;
	}

	.palantir:hover .counts,
	.palantir:focus-visible .counts {
		opacity: 1;
		transform: translateX(0);
	}

	.row {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		font-family: var(--font-display, 'Cinzel', serif);
		font-size: max(9px, 0.55vw);
		line-height: 1.7;
	}

	.key {
		color: rgba(190, 160, 110, 0.65);
		letter-spacing: 1px;
		text-transform: uppercase;
	}

	.val {
		color: rgba(225, 200, 150, 0.95);
		font-weight: 700;
	}

	.label {
		font-family: var(--font-display, 'Cinzel', serif);
		font-size: max(7px, 0.45vw);
		color: rgba(150, 120, 170, 0.45);
		letter-spacing: 1.5px;
		text-transform: uppercase;
		margin-top: 1px;
	}
</style>
