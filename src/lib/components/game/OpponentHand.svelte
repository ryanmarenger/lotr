<!--
  OpponentHand.svelte — Shadow hand count badge
  Floating element, top-right. Fanned card backs + count.
-->
<script lang="ts">
	let { count = 0 }: { count?: number } = $props();
</script>

<div class="opp-hand" role="status" aria-label="Opponent hand: {count} cards">
	<svg viewBox="0 0 80 60" preserveAspectRatio="xMidYMid meet">
		{#each [-14, 0, 14] as deg, i}
			<g transform="rotate({deg} 40 58)">
				<rect
					x="29" y="8" width="22" height="32" rx="2.5"
					fill="rgba(25,18,35,0.95)"
					stroke="rgba(120,80,180,{0.35 + i * 0.1})"
					stroke-width="1"
				/>
				<circle cx="40" cy="24" r="6" fill="none" stroke="rgba(120,80,180,0.25)" stroke-width="0.8" />
			</g>
		{/each}
	</svg>
	<span class="count">{count}</span>
</div>

<style>
	.opp-hand {
		position: absolute;
		right: 1%;
		top: 1.5%;
		width: 4%;
		height: 6.5%;
		z-index: 20;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	svg {
		width: 100%;
		height: 100%;
		filter: drop-shadow(0 0 6px rgba(100, 60, 160, 0.2));
	}

	.count {
		position: absolute;
		right: -8%;
		bottom: -4%;
		min-width: 1.5em;
		text-align: center;
		font-family: var(--font-display, 'Cinzel', serif);
		font-size: max(10px, 0.7vw);
		font-weight: 700;
		color: rgba(190, 160, 230, 0.95);
		background: rgba(15, 10, 25, 0.9);
		border: 1px solid rgba(120, 80, 180, 0.4);
		border-radius: 50%;
		padding: 0.15em;
		line-height: 1.2;
		text-shadow: 0 0 8px rgba(120, 80, 180, 0.5);
	}
</style>
