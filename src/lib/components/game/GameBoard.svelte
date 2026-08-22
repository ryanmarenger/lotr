<script lang="ts">
	import BoardFrame from './BoardFrame.svelte';
	import TwilightPool from './TwilightPool.svelte';
	import PhaseJewel from './PhaseJewel.svelte';
	import AdventureHUD from './AdventureHUD.svelte';
	import Palantir from './Palantir.svelte';
	import DrawDeck from './DrawDeck.svelte';
	import GameLog from './GameLog.svelte';
	import PassButton from './PassButton.svelte';
	import BurdenTracker from './BurdenTracker.svelte';
	import NarsilShards from './NarsilShards.svelte';
	import OpponentHand from './OpponentHand.svelte';
</script>

<div class="board-viewport">
	<div class="board">
		<!-- Landscape background (cinemagraph placeholder) -->
		<div class="landscape"></div>

		<!-- Transparent game zones -->
		<div class="zone fellowship-zone">
			<span class="zone-label">Fellowship</span>
		</div>
		<div class="zone shadow-zone">
			<span class="zone-label">Shadow</span>
		</div>
		<div class="zone shadow-zone-flank">
			<span class="zone-label">Flank</span>
		</div>

		<!-- SVG border frame (L-border + Narsil shelf + portrait bracket) -->
		<BoardFrame />

		<!-- Inset elements on the border -->
		<TwilightPool count={4} />
		<AdventureHUD site={3} totalSites={9} siteName="Rivendell" />
		<PhaseJewel phase="fellowship" />
		<NarsilShards progress={3} />
		<Palantir discardCount={7} deadCount={2} drawCount={32} adventureRemaining={6} />
		<DrawDeck count={32} />
		<GameLog />
		<PassButton />
		<OpponentHand count={8} />

		<!-- On-board interface elements -->
		<BurdenTracker burdens={2} resistance={10} />

		<!-- Hand fan area (placeholder) -->
		<div class="hand-fan-area">
			<span class="zone-label">Hand</span>
		</div>
	</div>
</div>

<style>
	.board-viewport {
		width: 100vw;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #000;
		overflow: hidden;
	}

	.board {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		overflow: hidden;
	}

	@media (min-aspect-ratio: 16/9) {
		.board {
			width: auto;
			height: 100vh;
		}
	}

	/* Atmospheric landscape placeholder */
	.landscape {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(ellipse at 33% 33%, rgba(35, 55, 65, 0.5) 0%, transparent 55%),
			radial-gradient(ellipse at 70% 60%, rgba(25, 35, 20, 0.3) 0%, transparent 40%),
			linear-gradient(175deg,
				#060a10 0%,
				#0a1018 12%,
				#0e1822 28%,
				#0c1a1e 45%,
				#0a1615 60%,
				#0d1210 75%,
				#0a0e0c 90%,
				#080a08 100%
			);
		z-index: 0;
	}

	/* Ghost-faint zone boundaries */
	.zone {
		position: absolute;
		border: 1px dashed rgba(255, 255, 255, 0.06);
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
		z-index: 1;
	}

	.zone-label {
		font-family: var(--font-display, 'Cinzel', serif);
		font-size: 0.65vw;
		color: rgba(255, 255, 255, 0.08);
		letter-spacing: 3px;
		text-transform: uppercase;
	}

	.fellowship-zone {
		left: 8%;
		top: 30%;
		width: 22%;
		height: 40%;
		border-color: rgba(220, 170, 40, 0.06);
	}

	.shadow-zone {
		left: 52%;
		top: 20%;
		width: 38%;
		height: 25%;
		border-color: rgba(120, 80, 180, 0.06);
	}

	.shadow-zone-flank {
		left: 55%;
		top: 52%;
		width: 32%;
		height: 20%;
		border-color: rgba(120, 80, 180, 0.04);
	}

	.hand-fan-area {
		position: absolute;
		right: 0;
		bottom: 0;
		width: 36.55%;
		height: 38.29%;
		border: 1px dashed rgba(100, 186, 130, 0.06);
		border-radius: 100% 0 0 0;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
		z-index: 1;
	}

	.hand-fan-area .zone-label {
		color: rgba(100, 186, 130, 0.08);
	}
</style>
