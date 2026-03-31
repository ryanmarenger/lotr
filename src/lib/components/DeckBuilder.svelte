<script lang="ts">
	import { onMount } from 'svelte';
	import type { CardSummary } from '$lib/types/card.js';
	import { useDeck } from '$lib/stores/deck.svelte.js';
	import CardGrid from './CardGrid.svelte';
	import FilterBar from './FilterBar.svelte';
	import CardDetail from './CardDetail.svelte';
	import DeckList from './DeckList.svelte';

	interface FilterOptions {
		cultures: string[];
		types: string[];
		races: string[];
		rarities: string[];
	}

	interface SearchResult {
		cards: CardSummary[];
		total: number;
		page: number;
		pageSize: number;
		totalPages: number;
	}

	const deckStore = useDeck();

	let filters = $state<FilterOptions>({ cultures: [], types: [], races: [], rarities: [] });
	let result = $state<SearchResult>({ cards: [], total: 0, page: 1, pageSize: 60, totalPages: 0 });
	let selectedCard = $state<CardSummary | null>(null);
	let loading = $state(true);
	let currentParams = $state<Record<string, string>>({});
	let toast = $state<{ message: string; type: 'success' | 'error' } | null>(null);

	onMount(async () => {
		const [filtersRes, cardsRes] = await Promise.all([
			fetch('/api/cards/filters'),
			fetch('/api/cards?pageSize=60'),
		]);
		filters = await filtersRes.json();
		result = await cardsRes.json();
		loading = false;
	});

	async function handleSearch(params: Record<string, string>) {
		currentParams = params;
		loading = true;
		const qs = new URLSearchParams({ ...params, pageSize: '60' }).toString();
		const res = await fetch(`/api/cards?${qs}`);
		result = await res.json();
		loading = false;
	}

	async function loadPage(page: number) {
		loading = true;
		const qs = new URLSearchParams({ ...currentParams, pageSize: '60', page: String(page) }).toString();
		const res = await fetch(`/api/cards?${qs}`);
		result = await res.json();
		loading = false;
	}

	function handleCardClick(card: CardSummary) {
		selectedCard = card;
	}

	function handleCardDblClick(card: CardSummary) {
		const err = deckStore.addCard(card);
		if (err) {
			showToast(err, 'error');
		} else {
			showToast(`Added ${card.title}`, 'success');
		}
	}

	function handleDeckCardHover(card: CardSummary) {
		selectedCard = card;
	}

	function closeDetail() {
		selectedCard = null;
	}

	function showToast(message: string, type: 'success' | 'error') {
		toast = { message, type };
		setTimeout(() => { toast = null; }, 2000);
	}
</script>

<div class="deck-builder">
	<!-- Header -->
	<header class="db-header">
		<div class="brand">
			<h1 class="brand-title">LOTR TCG</h1>
			<span class="brand-sub">Deck Builder</span>
		</div>
		<div class="header-stats">
			{#if !loading}
				<span class="stat">{result.total.toLocaleString()} cards</span>
			{/if}
			<span class="stat hint">Double-click to add to deck</span>
		</div>
	</header>

	<!-- Filters -->
	<FilterBar {filters} onSearch={handleSearch} />

	<!-- Main content: grid | detail | deck list -->
	<div class="db-body">
		<!-- Card grid (scrollable) -->
		<div class="db-grid-area">
			{#if loading}
				<div class="loading">
					<div class="loading-ring"></div>
					<span>Loading cards...</span>
				</div>
			{:else if result.cards.length === 0}
				<div class="empty">
					<p>No cards match your filters.</p>
				</div>
			{:else}
				<CardGrid
					cards={result.cards}
					onCardClick={handleCardClick}
					onCardDblClick={handleCardDblClick}
					selectedId={selectedCard?.blueprintId}
				/>

				{#if result.totalPages > 1}
					<div class="pagination">
						<button
							class="page-btn"
							disabled={result.page <= 1}
							onclick={() => loadPage(result.page - 1)}
						>
							Prev
						</button>
						<span class="page-info">
							Page {result.page} of {result.totalPages}
						</span>
						<button
							class="page-btn"
							disabled={result.page >= result.totalPages}
							onclick={() => loadPage(result.page + 1)}
						>
							Next
						</button>
					</div>
				{/if}
			{/if}
		</div>

		<!-- Card detail panel (center) -->
		{#if selectedCard}
			<div class="db-detail-area">
				<CardDetail card={selectedCard} onClose={closeDetail} />
			</div>
		{/if}

		<!-- Deck list (right) -->
		<div class="db-deck-area">
			<DeckList onCardHover={handleDeckCardHover} />
		</div>
	</div>

	<!-- Toast notification -->
	{#if toast}
		<div class="toast" class:error={toast.type === 'error'} class:success={toast.type === 'success'}>
			{toast.message}
		</div>
	{/if}
</div>

<style>
	.deck-builder {
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow: hidden;
		position: relative;
	}

	/* ── Header ── */
	.db-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px var(--gap-md);
		background: var(--bg-surface);
		border-bottom: 1px solid var(--border-subtle);
		flex-shrink: 0;
	}

	.brand {
		display: flex;
		align-items: baseline;
		gap: var(--gap-sm);
	}

	.brand-title {
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 700;
		color: var(--text-gold);
		letter-spacing: 2px;
	}

	.brand-sub {
		font-family: var(--font-display);
		font-size: 13px;
		font-weight: 400;
		color: var(--text-secondary);
		letter-spacing: 1.5px;
		text-transform: uppercase;
	}

	.header-stats {
		display: flex;
		gap: var(--gap-md);
		align-items: center;
	}

	.stat {
		font-size: 13px;
		color: var(--text-muted);
	}

	.hint {
		font-size: 11px;
		color: var(--text-muted);
		opacity: 0.6;
		font-style: italic;
	}

	/* ── Body ── */
	.db-body {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.db-grid-area {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		min-width: 0;
	}

	.db-detail-area {
		width: 300px;
		flex-shrink: 0;
		overflow: hidden;
	}

	.db-deck-area {
		width: 280px;
		flex-shrink: 0;
		overflow: hidden;
	}

	/* ── Loading ── */
	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--gap-md);
		padding: var(--gap-xl);
		color: var(--text-muted);
	}

	.loading-ring {
		width: 32px;
		height: 32px;
		border: 2px solid var(--border-subtle);
		border-top-color: var(--gold-dim);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* ── Empty ── */
	.empty {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--gap-xl);
		color: var(--text-muted);
		font-size: 15px;
	}

	/* ── Pagination ── */
	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--gap-md);
		padding: var(--gap-md);
		border-top: 1px solid var(--border-subtle);
	}

	.page-btn {
		background: var(--bg-elevated);
		border: 1px solid var(--border-light);
		border-radius: var(--radius-sm);
		color: var(--text-secondary);
		font-family: var(--font-display);
		font-size: 12px;
		letter-spacing: 1px;
		padding: 8px 18px;
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.page-btn:hover:not(:disabled) {
		border-color: var(--border-gold);
		color: var(--text-gold);
	}

	.page-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.page-info {
		font-size: 13px;
		color: var(--text-muted);
	}

	/* ── Toast ── */
	.toast {
		position: absolute;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		padding: 10px 24px;
		border-radius: var(--radius-md);
		font-size: 13px;
		font-family: var(--font-body);
		z-index: 100;
		animation: toastIn 300ms var(--ease-bounce);
		pointer-events: none;
	}

	.toast.success {
		background: rgba(40, 120, 60, 0.9);
		color: rgba(255, 255, 255, 0.9);
		border: 1px solid rgba(60, 180, 80, 0.4);
	}

	.toast.error {
		background: rgba(140, 40, 30, 0.9);
		color: rgba(255, 255, 255, 0.9);
		border: 1px solid rgba(200, 70, 50, 0.4);
	}

	@keyframes toastIn {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}
</style>
