<!--
  TwilightPool.svelte — Mirror of Galadriel
  Dark rippling water in a silver basin. Shows twilight token count.
  Position: x=1.5%, y=1.5%, w=6.69%, h=12.55%
-->
<script lang="ts">
	let { count = 0 }: { count?: number } = $props();
</script>

<div class="twilight-pool" role="status" aria-label="Twilight Pool: {count} tokens">
	<svg class="basin" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
		<defs>
			<!-- Water surface gradient -->
			<radialGradient id="water-surface" cx="0.4" cy="0.35" r="0.65">
				<stop offset="0%" stop-color="rgba(40,65,100,0.85)" />
				<stop offset="45%" stop-color="rgba(15,30,55,0.92)" />
				<stop offset="100%" stop-color="rgba(5,12,28,1)" />
			</radialGradient>

			<!-- Silver basin rim gradient -->
			<linearGradient id="basin-rim" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0%" stop-color="rgba(140,160,190,0.5)" />
				<stop offset="50%" stop-color="rgba(80,100,130,0.35)" />
				<stop offset="100%" stop-color="rgba(140,160,190,0.5)" />
			</linearGradient>

			<!-- Water ripple filter -->
			<filter id="water-distort">
				<feTurbulence type="turbulence" baseFrequency="0.03" numOctaves="3" seed="5" result="turbulence">
					<animate attributeName="seed" from="1" to="50" dur="12s" repeatCount="indefinite" />
				</feTurbulence>
				<feDisplacementMap in="SourceGraphic" in2="turbulence" scale="2" />
			</filter>
		</defs>

		<!-- Basin outer ring -->
		<circle cx="50" cy="44" r="42" fill="none" stroke="url(#basin-rim)" stroke-width="2.5" />
		<circle cx="50" cy="44" r="40" fill="none" stroke="rgba(60,80,110,0.2)" stroke-width="1" />

		<!-- Water surface -->
		<circle cx="50" cy="44" r="38" fill="url(#water-surface)" filter="url(#water-distort)" />

		<!-- Reflection highlights -->
		<ellipse cx="42" cy="35" rx="12" ry="6" fill="rgba(100,150,200,0.08)" />
		<ellipse cx="55" cy="50" rx="8" ry="4" fill="rgba(80,120,170,0.05)" />
	</svg>

	<!-- Twilight count overlay -->
	<div class="count-display">
		<span class="count" class:high={count >= 8} class:extreme={count >= 14}>{count}</span>
	</div>

	<!-- Animated ripple rings -->
	<div class="ripples">
		<div class="ripple"></div>
		<div class="ripple" style="animation-delay: 1.5s"></div>
		<div class="ripple" style="animation-delay: 3s"></div>
	</div>

	<span class="label">Twilight</span>
</div>

<style>
	.twilight-pool {
		position: absolute;
		left: 1.5%;
		top: 1.5%;
		width: 6.69%;
		height: 12.55%;
		z-index: 20;
		display: flex;
		flex-direction: column;
		align-items: center;
		pointer-events: auto;
		cursor: default;
	}

	.basin {
		width: 100%;
		flex: 1;
		filter: drop-shadow(0 0 8px rgba(60, 100, 160, 0.15));
	}

	.count-display {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 15%;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}

	.count {
		font-family: var(--font-display, 'Cinzel', serif);
		font-size: 2.2cqw;
		font-weight: 700;
		color: rgba(150, 190, 230, 0.9);
		text-shadow:
			0 0 10px rgba(80, 140, 200, 0.5),
			0 0 25px rgba(60, 110, 170, 0.2);
		transition: color 0.5s, text-shadow 0.5s;
	}

	.count.high {
		color: rgba(200, 180, 140, 0.95);
		text-shadow:
			0 0 10px rgba(180, 150, 80, 0.5),
			0 0 30px rgba(150, 120, 50, 0.3);
	}

	.count.extreme {
		color: rgba(230, 160, 120, 0.95);
		text-shadow:
			0 0 12px rgba(200, 100, 50, 0.6),
			0 0 35px rgba(180, 80, 30, 0.3);
	}

	.ripples {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 15%;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}

	.ripple {
		position: absolute;
		width: 20%;
		aspect-ratio: 1;
		border-radius: 50%;
		border: 1px solid rgba(100, 150, 200, 0.12);
		animation: pool-ripple 4.5s ease-out infinite;
	}

	@keyframes pool-ripple {
		0% { transform: scale(0.3); opacity: 0.5; }
		100% { transform: scale(3.5); opacity: 0; }
	}

	.label {
		font-family: var(--font-display, 'Cinzel', serif);
		font-size: max(7px, 0.45vw);
		color: rgba(100, 130, 180, 0.45);
		letter-spacing: 1.5px;
		text-transform: uppercase;
		margin-top: 2px;
	}
</style>
