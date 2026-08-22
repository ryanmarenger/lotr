<!--
  PhaseJewel.svelte — Jeweled phase tracker
  7 jewels in a circle around a morphing center symbol.
  Active jewel pulses, completed jewels leave a dim trail, future jewels are dark.
  Position: top shelf, right slot.
-->
<script lang="ts">
	let { phase = 'fellowship' }: { phase?: string } = $props();

	const PHASES = [
		{ id: 'fellowship', color: '#d4af37', name: 'Fellowship' },
		{ id: 'shadow', color: '#8a5fd0', name: 'Shadow' },
		{ id: 'maneuver', color: '#3aa8a0', name: 'Maneuver' },
		{ id: 'archery', color: '#5fae5a', name: 'Archery' },
		{ id: 'assignment', color: '#e0a030', name: 'Assignment' },
		{ id: 'skirmish', color: '#c04040', name: 'Skirmish' },
		{ id: 'regroup', color: '#b8c0cc', name: 'Regroup' }
	];

	const activeIndex = $derived(Math.max(0, PHASES.findIndex((p) => p.id === phase)));
	const active = $derived(PHASES[activeIndex]);

	// Jewel positions on a circle, starting at top, clockwise
	function jewelPos(i: number) {
		const angle = (i / 7) * Math.PI * 2 - Math.PI / 2;
		return { x: 50 + 38 * Math.cos(angle), y: 50 + 38 * Math.sin(angle) };
	}
</script>

<div class="phase-jewel" role="status" aria-label="Phase: {active.name}">
	<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
		<defs>
			<radialGradient id="jewel-center-glow" cx="0.5" cy="0.5" r="0.5">
				<stop offset="0%" stop-color={active.color} stop-opacity="0.35" />
				<stop offset="100%" stop-color={active.color} stop-opacity="0" />
			</radialGradient>
		</defs>

		<!-- Setting ring -->
		<circle cx="50" cy="50" r="46" fill="rgba(10,9,7,0.85)" stroke="rgba(120,90,40,0.35)" stroke-width="1.5" />
		<circle cx="50" cy="50" r="42" fill="none" stroke="rgba(120,90,40,0.15)" stroke-width="0.6" />

		<!-- Center glow + gem -->
		<circle cx="50" cy="50" r="26" fill="url(#jewel-center-glow)" />
		<circle class="center-gem" cx="50" cy="50" r="13" fill={active.color} fill-opacity="0.22" stroke={active.color} stroke-opacity="0.7" stroke-width="1.2" />

		<!-- 7 jewels -->
		{#each PHASES as p, i}
			{@const pos = jewelPos(i)}
			<circle
				class="jewel"
				class:active={i === activeIndex}
				class:trail={i < activeIndex}
				cx={pos.x}
				cy={pos.y}
				r={i === activeIndex ? 5 : 3.6}
				fill={p.color}
				fill-opacity={i === activeIndex ? 0.95 : i < activeIndex ? 0.4 : 0.1}
				stroke={p.color}
				stroke-opacity={i === activeIndex ? 0.9 : 0.25}
				stroke-width="0.8"
				style="--jewel-color: {p.color}"
			/>
		{/each}
	</svg>
	<span class="label">{active.name}</span>
</div>

<style>
	.phase-jewel {
		position: absolute;
		left: 19%;
		top: 0.6%;
		width: 4.4%;
		height: 7.8%;
		z-index: 20;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	svg {
		width: 100%;
		flex: 1;
	}

	.jewel.active {
		filter: drop-shadow(0 0 4px var(--jewel-color));
		animation: jewel-pulse 2.4s ease-in-out infinite;
	}

	@keyframes jewel-pulse {
		0%, 100% { fill-opacity: 0.95; }
		50% { fill-opacity: 0.55; }
	}

	.center-gem {
		animation: gem-breathe 5s ease-in-out infinite;
	}

	@keyframes gem-breathe {
		0%, 100% { fill-opacity: 0.22; }
		50% { fill-opacity: 0.38; }
	}

	.label {
		font-family: var(--font-display, 'Cinzel', serif);
		font-size: max(7px, 0.45vw);
		color: rgba(190, 160, 90, 0.55);
		letter-spacing: 1.5px;
		text-transform: uppercase;
		margin-top: 1px;
		white-space: nowrap;
	}
</style>
