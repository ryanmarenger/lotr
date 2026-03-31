<script lang="ts">
	import type { CardSummary } from '$lib/types/card.js';

	interface Props {
		cards: CardSummary[];
		onCardClick?: (card: CardSummary) => void;
		onCardDblClick?: (card: CardSummary) => void;
		selectedId?: string;
	}

	let { cards, onCardClick, onCardDblClick, selectedId }: Props = $props();

	function cultureColor(culture?: string): string {
		if (!culture) return 'var(--text-muted)';
		const key = culture.toLowerCase().replace('-', '-');
		return `var(--culture-${key}, var(--text-muted))`;
	}
</script>

<div class="card-grid">
	{#each cards as card (card.blueprintId)}
		<button
			class="card-tile"
			class:selected={selectedId === card.blueprintId}
			onclick={() => onCardClick?.(card)}
			ondblclick={() => onCardDblClick?.(card)}
			title="{card.title}{card.subtitle ? ` — ${card.subtitle}` : ''}"
		>
			<div class="card-image-wrap">
				<img
					src={card.imageUrl}
					alt={card.title}
					loading="lazy"
					decoding="async"
				/>
				{#if card.unique}
					<span class="unique-marker">*</span>
				{/if}
			</div>
			<div class="card-info">
				<span class="card-title" style:color={cultureColor(card.culture)}>
					{card.title}
				</span>
				<span class="card-cost">{card.twilight}</span>
			</div>
		</button>
	{/each}
</div>

<style>
	.card-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
		gap: var(--gap-sm);
		padding: var(--gap-sm);
	}

	.card-tile {
		background: var(--bg-card);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		overflow: hidden;
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
		display: flex;
		flex-direction: column;
		font-family: inherit;
		color: inherit;
		padding: 0;
		text-align: left;
	}

	.card-tile:hover {
		border-color: var(--border-gold);
		background: var(--bg-hover);
		transform: translateY(-2px);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
	}

	.card-tile.selected {
		border-color: var(--border-gold-bright);
		background: var(--bg-active);
		box-shadow: 0 0 12px rgba(186, 140, 30, 0.2);
	}

	.card-image-wrap {
		position: relative;
		aspect-ratio: 5 / 7;
		overflow: hidden;
		background: var(--bg-deep);
	}

	.card-image-wrap img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.unique-marker {
		position: absolute;
		top: 4px;
		right: 6px;
		font-size: 18px;
		font-weight: 700;
		color: var(--text-gold-bright);
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
		pointer-events: none;
	}

	.card-info {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 8px;
		gap: var(--gap-xs);
		min-height: 32px;
	}

	.card-title {
		font-family: var(--font-display);
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.3px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		flex: 1;
	}

	.card-cost {
		font-size: 12px;
		font-weight: 700;
		color: var(--text-gold);
		min-width: 16px;
		text-align: center;
		flex-shrink: 0;
	}
</style>
