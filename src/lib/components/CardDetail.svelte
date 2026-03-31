<script lang="ts">
	import type { CardSummary } from '$lib/types/card.js';

	interface Props {
		card: CardSummary | null;
		onClose: () => void;
	}

	let { card, onClose }: Props = $props();

	function cultureColor(culture?: string): string {
		if (!culture) return 'var(--text-muted)';
		const key = culture.toLowerCase().replace('-', '-');
		return `var(--culture-${key}, var(--text-secondary))`;
	}

	function formatGametext(text: string): string {
		return text
			.replace(/<b>/g, '<strong>')
			.replace(/<\/b>/g, '</strong>')
			.replace(/<br\s*\/?>/g, '<br>')
			.replace(/\[(\w+)\]/g, '<span class="culture-icon">[$1]</span>');
	}
</script>

{#if card}
	<div class="card-detail" role="complementary" aria-label="Card details">
		<div class="detail-header">
			<h2 class="detail-title" style:color={cultureColor(card.culture)}>
				{card.unique ? '* ' : ''}{card.title}
			</h2>
			{#if card.subtitle}
				<p class="detail-subtitle">{card.subtitle}</p>
			{/if}
			<button class="close-btn" onclick={onClose} aria-label="Close">x</button>
		</div>

		<div class="detail-image-wrap">
			<img src={card.imageUrl} alt={card.title} />
		</div>

		<div class="detail-stats">
			<div class="stat-row">
				<span class="stat-label">Type</span>
				<span class="stat-value">{card.type}</span>
			</div>
			{#if card.culture}
				<div class="stat-row">
					<span class="stat-label">Culture</span>
					<span class="stat-value" style:color={cultureColor(card.culture)}>{card.culture}</span>
				</div>
			{/if}
			{#if card.side}
				<div class="stat-row">
					<span class="stat-label">Side</span>
					<span class="stat-value">{card.side}</span>
				</div>
			{/if}
			<div class="stat-row">
				<span class="stat-label">Twilight</span>
				<span class="stat-value cost">{card.twilight}</span>
			</div>
			{#if card.race}
				<div class="stat-row">
					<span class="stat-label">Race</span>
					<span class="stat-value">{card.race}</span>
				</div>
			{/if}
			{#if card.strength !== undefined}
				<div class="stat-row">
					<span class="stat-label">Strength</span>
					<span class="stat-value">{card.strength}</span>
				</div>
			{/if}
			{#if card.vitality !== undefined}
				<div class="stat-row">
					<span class="stat-label">Vitality</span>
					<span class="stat-value">{card.vitality}</span>
				</div>
			{/if}
			{#if card.keywords.length > 0}
				<div class="stat-row">
					<span class="stat-label">Keywords</span>
					<span class="stat-value">{card.keywords.join(', ')}</span>
				</div>
			{/if}
		</div>

		<div class="detail-gametext">
			{@html formatGametext(card.gametext)}
		</div>

		<div class="detail-meta">
			<span>Set {card.setNumber} #{card.cardNumber}</span>
			<span>{card.rarity}</span>
			<span>{card.collInfo}</span>
		</div>
	</div>
{/if}

<style>
	.card-detail {
		background: var(--bg-surface);
		border-left: 1px solid var(--border-subtle);
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		height: 100%;
	}

	.detail-header {
		padding: var(--gap-md);
		border-bottom: 1px solid var(--border-subtle);
		position: relative;
	}

	.detail-title {
		font-family: var(--font-display);
		font-size: 18px;
		font-weight: 600;
		letter-spacing: 0.5px;
		padding-right: 30px;
	}

	.detail-subtitle {
		font-size: 14px;
		color: var(--text-secondary);
		font-style: italic;
		margin-top: 2px;
	}

	.close-btn {
		position: absolute;
		top: 12px;
		right: 12px;
		background: none;
		border: none;
		color: var(--text-muted);
		font-size: 16px;
		cursor: pointer;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-sm);
		transition: all var(--duration-fast);
	}

	.close-btn:hover {
		color: var(--text-primary);
		background: var(--bg-hover);
	}

	.detail-image-wrap {
		padding: var(--gap-md);
		display: flex;
		justify-content: center;
	}

	.detail-image-wrap img {
		max-width: 220px;
		width: 100%;
		border-radius: var(--radius-md);
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
	}

	.detail-stats {
		padding: 0 var(--gap-md) var(--gap-md);
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.stat-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	.stat-label {
		font-size: 12px;
		color: var(--text-muted);
		letter-spacing: 0.5px;
		text-transform: uppercase;
		font-family: var(--font-display);
	}

	.stat-value {
		font-size: 14px;
		color: var(--text-primary);
	}

	.stat-value.cost {
		color: var(--text-gold);
		font-weight: 700;
	}

	.detail-gametext {
		padding: var(--gap-md);
		border-top: 1px solid var(--border-subtle);
		font-size: 14px;
		line-height: 1.6;
		color: var(--text-secondary);
	}

	.detail-gametext :global(strong) {
		color: var(--text-primary);
		font-weight: 600;
	}

	.detail-meta {
		padding: var(--gap-sm) var(--gap-md);
		border-top: 1px solid var(--border-subtle);
		display: flex;
		gap: var(--gap-md);
		font-size: 12px;
		color: var(--text-muted);
		margin-top: auto;
	}
</style>
