<!--
  GameLog.svelte — Doors of Durin
  Idle: faint stone arch outline on the lower-left spine.
  Hover: ithildin lines trace themselves in silver-blue (moonlight).
  Click: doors open, game log revealed as a sliding panel.
-->
<script lang="ts">
	let { entries = [] }: { entries?: string[] } = $props();

	let open = $state(false);

	const placeholder = [
		'Turn 1 — Fellowship phase begins',
		'Frodo plays The One Ring',
		'Fellowship moves to Bree (site 2)',
		'4 twilight added to the pool'
	];

	const logEntries = $derived(entries.length ? entries : placeholder);
</script>

<button
	class="durin-trigger"
	class:open
	aria-label="Game log — Doors of Durin"
	aria-expanded={open}
	onclick={() => (open = !open)}
>
	<svg viewBox="0 0 60 80" preserveAspectRatio="xMidYMid meet">
		<!-- Door arch -->
		<path
			class="ithildin arch"
			d="M 10 74 L 10 34 Q 10 10 30 10 Q 50 10 50 34 L 50 74"
			fill="none"
			stroke-width="1.5"
		/>
		<!-- Center seam -->
		<line class="ithildin" x1="30" y1="22" x2="30" y2="74" stroke-width="1" />
		<!-- Crown + star -->
		<path class="ithildin" d="M 24 22 L 30 15 L 36 22" fill="none" stroke-width="1" />
		<circle class="ithildin star" cx="30" cy="30" r="3" fill="none" stroke-width="1" />
		<!-- Two trees, abstract -->
		<path class="ithildin" d="M 17 60 L 17 42 M 13 48 L 17 42 L 21 48" fill="none" stroke-width="0.9" />
		<path class="ithildin" d="M 43 60 L 43 42 M 39 48 L 43 42 L 47 48" fill="none" stroke-width="0.9" />
	</svg>
</button>

{#if open}
	<aside class="log-panel" aria-label="Game log">
		<header>
			<span class="title">The Account of the Game</span>
			<button class="close" onclick={() => (open = false)} aria-label="Close game log">✕</button>
		</header>
		<ol class="entries">
			{#each logEntries as entry, i}
				<li style="animation-delay: {i * 60}ms">{entry}</li>
			{/each}
		</ol>
	</aside>
{/if}

<style>
	.durin-trigger {
		position: absolute;
		left: 0.3%;
		top: 62%;
		width: 2.4%;
		height: 8%;
		z-index: 20;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
	}

	.durin-trigger svg {
		width: 100%;
		height: 100%;
	}

	.ithildin {
		stroke: rgba(120, 130, 145, 0.18);
		transition: stroke 0.8s ease, filter 0.8s ease;
	}

	.durin-trigger:hover .ithildin,
	.durin-trigger:focus-visible .ithildin,
	.durin-trigger.open .ithildin {
		stroke: rgba(150, 195, 235, 0.85);
		filter: drop-shadow(0 0 3px rgba(120, 180, 230, 0.6));
	}

	.log-panel {
		position: absolute;
		left: 3.2%;
		top: 38%;
		width: 17%;
		max-height: 46%;
		z-index: 30;
		background: rgba(8, 8, 10, 0.94);
		border: 1px solid rgba(110, 150, 190, 0.3);
		border-radius: 8px;
		padding: 10px 14px;
		display: flex;
		flex-direction: column;
		animation: doors-open 0.45s ease-out;
		box-shadow: 0 0 30px rgba(80, 130, 180, 0.12);
	}

	@keyframes doors-open {
		from { opacity: 0; transform: translateX(-12px); clip-path: inset(0 50% 0 50%); }
		to { opacity: 1; transform: translateX(0); clip-path: inset(0 0 0 0); }
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid rgba(110, 150, 190, 0.2);
		padding-bottom: 6px;
		margin-bottom: 8px;
	}

	.title {
		font-family: var(--font-display, 'Cinzel', serif);
		font-size: max(10px, 0.6vw);
		color: rgba(160, 200, 235, 0.8);
		letter-spacing: 1.5px;
		text-transform: uppercase;
	}

	.close {
		background: none;
		border: none;
		color: rgba(160, 200, 235, 0.5);
		font-size: max(10px, 0.6vw);
		cursor: pointer;
		padding: 2px 4px;
	}

	.close:hover {
		color: rgba(160, 200, 235, 0.95);
	}

	.entries {
		list-style: none;
		margin: 0;
		padding: 0;
		overflow-y: auto;
	}

	.entries li {
		font-family: var(--font-body, Georgia, serif);
		font-size: max(10px, 0.6vw);
		color: rgba(200, 210, 220, 0.7);
		line-height: 1.8;
		border-bottom: 1px solid rgba(255, 255, 255, 0.04);
		animation: entry-in 0.4s ease-out backwards;
	}

	@keyframes entry-in {
		from { opacity: 0; transform: translateY(4px); }
		to { opacity: 1; transform: translateY(0); }
	}

	@media (prefers-reduced-motion: reduce) {
		.log-panel, .entries li { animation: none; }
	}
</style>
