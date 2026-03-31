<script lang="ts">
	import { useDeck } from '$lib/stores/deck.svelte.js';
	import type { CardSummary } from '$lib/types/card.js';
	import type { DeckEntry } from '$lib/types/deck.js';

	interface Props {
		onCardHover?: (card: CardSummary) => void;
	}

	let { onCardHover }: Props = $props();

	const deckStore = useDeck();

	let editingName = $state(false);
	let nameInput = $state('');

	function startEditName() {
		nameInput = deckStore.deck.name;
		editingName = true;
	}

	function saveName() {
		if (nameInput.trim()) {
			deckStore.setDeckName(nameInput.trim());
		}
		editingName = false;
	}

	function handleExport() {
		const data = deckStore.exportDeck();
		const blob = new Blob([data], { type: 'application/json' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = `${deckStore.deck.name.replace(/\s+/g, '_')}.json`;
		a.click();
		URL.revokeObjectURL(a.href);
	}

	function handleImport() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onload = () => {
				const err = deckStore.importDeck(reader.result as string);
				if (err) alert(err);
			};
			reader.readAsText(file);
		};
		input.click();
	}

	function cultureColor(culture?: string): string {
		if (!culture) return 'var(--text-muted)';
		return `var(--culture-${culture.toLowerCase().replace('-', '-')}, var(--text-secondary))`;
	}

	function sectionEntries(entries: DeckEntry[]): DeckEntry[] {
		return [...entries].sort((a, b) => {
			// Sort by type, then by twilight cost, then by name
			const typeOrder: Record<string, number> = {
				'Companion': 0, 'Ally': 1, 'Follower': 2, 'Minion': 0,
				'Possession': 3, 'Artifact': 4, 'Condition': 5, 'Event': 6,
			};
			const ta = typeOrder[a.card.type] ?? 9;
			const tb = typeOrder[b.card.type] ?? 9;
			if (ta !== tb) return ta - tb;
			if (a.card.twilight !== b.card.twilight) return a.card.twilight - b.card.twilight;
			return a.card.title.localeCompare(b.card.title);
		});
	}
</script>

<div class="deck-list">
	<!-- Deck header -->
	<div class="deck-header">
		{#if editingName}
			<input
				class="name-input"
				bind:value={nameInput}
				onkeydown={(e) => e.key === 'Enter' && saveName()}
				onblur={saveName}
			/>
		{:else}
			<button class="deck-name" onclick={startEditName} title="Click to rename">
				{deckStore.deck.name}
			</button>
		{/if}
		<span class="deck-total">{deckStore.totalCount}</span>
	</div>

	<!-- Deck actions -->
	<div class="deck-actions">
		<button class="action-btn" onclick={handleExport} title="Export deck">Export</button>
		<button class="action-btn" onclick={handleImport} title="Import deck">Import</button>
		<button class="action-btn danger" onclick={() => deckStore.clearDeck()} title="Clear deck">Clear</button>
	</div>

	<!-- Scrollable sections -->
	<div class="deck-sections">
		<!-- Ring-bearer & One Ring -->
		<div class="section">
			<div class="section-header">
				<span class="section-title">Ring-bearer & Ring</span>
			</div>
			{#if deckStore.deck.ringBearer}
				<div
					class="deck-entry"
					onmouseenter={() => onCardHover?.(deckStore.deck.ringBearer!)}
				>
					<span class="entry-name" style:color={cultureColor(deckStore.deck.ringBearer.culture)}>
						{deckStore.deck.ringBearer.title}
					</span>
					<button class="remove-btn" onclick={() => deckStore.removeCard(deckStore.deck.ringBearer!.blueprintId, 'ringBearer')}>x</button>
				</div>
			{:else}
				<div class="empty-slot">Ring-bearer needed</div>
			{/if}
			{#if deckStore.deck.oneRing}
				<div
					class="deck-entry"
					onmouseenter={() => onCardHover?.(deckStore.deck.oneRing!)}
				>
					<span class="entry-name" style:color="var(--text-gold)">
						{deckStore.deck.oneRing.title}
					</span>
					<button class="remove-btn" onclick={() => deckStore.removeCard(deckStore.deck.oneRing!.blueprintId, 'oneRing')}>x</button>
				</div>
			{:else}
				<div class="empty-slot">The One Ring needed</div>
			{/if}
		</div>

		<!-- Free Peoples -->
		<div class="section">
			<div class="section-header">
				<span class="section-title">Free Peoples</span>
				<span class="section-count" class:short={deckStore.fpCount < 30}>
					{deckStore.fpCount}/30
				</span>
			</div>
			{#each sectionEntries(deckStore.deck.freePeoples) as entry (entry.card.blueprintId)}
				<div
					class="deck-entry"
					onmouseenter={() => onCardHover?.(entry.card)}
				>
					<span class="entry-count">{entry.count}x</span>
					<span class="entry-name" style:color={cultureColor(entry.card.culture)}>
						{entry.card.title}
					</span>
					<span class="entry-cost">{entry.card.twilight}</span>
					<button class="remove-btn" onclick={() => deckStore.removeCard(entry.card.blueprintId, 'freePeoples')}>-</button>
				</div>
			{:else}
				<div class="empty-slot">Add Free Peoples cards</div>
			{/each}
		</div>

		<!-- Shadow -->
		<div class="section">
			<div class="section-header">
				<span class="section-title">Shadow</span>
				<span class="section-count" class:short={deckStore.shadowCount < 30}>
					{deckStore.shadowCount}/30
				</span>
			</div>
			{#each sectionEntries(deckStore.deck.shadow) as entry (entry.card.blueprintId)}
				<div
					class="deck-entry"
					onmouseenter={() => onCardHover?.(entry.card)}
				>
					<span class="entry-count">{entry.count}x</span>
					<span class="entry-name" style:color={cultureColor(entry.card.culture)}>
						{entry.card.title}
					</span>
					<span class="entry-cost">{entry.card.twilight}</span>
					<button class="remove-btn" onclick={() => deckStore.removeCard(entry.card.blueprintId, 'shadow')}>-</button>
				</div>
			{:else}
				<div class="empty-slot">Add Shadow cards</div>
			{/each}
		</div>

		<!-- Adventure -->
		<div class="section">
			<div class="section-header">
				<span class="section-title">Adventure Path</span>
				<span class="section-count" class:short={deckStore.adventureCount < 9}>
					{deckStore.adventureCount}/9
				</span>
			</div>
			{#each deckStore.deck.adventure as site, i (site.blueprintId + '-' + i)}
				<div
					class="deck-entry"
					onmouseenter={() => onCardHover?.(site)}
				>
					<span class="entry-count site-num">{i + 1}</span>
					<span class="entry-name">{site.title}</span>
					<button class="remove-btn" onclick={() => deckStore.removeCard(site.blueprintId, 'adventure')}>-</button>
				</div>
			{:else}
				<div class="empty-slot">Add 9 site cards</div>
			{/each}
		</div>
	</div>

	<!-- Validation errors -->
	{#if deckStore.errors.length > 0}
		<div class="validation">
			{#each deckStore.errors as err}
				<div class="validation-msg" class:warning={err.severity === 'warning'}>
					{err.message}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.deck-list {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--bg-surface);
		border-left: 1px solid var(--border-subtle);
	}

	/* ── Header ── */
	.deck-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px var(--gap-md);
		border-bottom: 1px solid var(--border-subtle);
	}

	.deck-name {
		font-family: var(--font-display);
		font-size: 14px;
		font-weight: 600;
		color: var(--text-gold);
		letter-spacing: 0.5px;
		background: none;
		border: none;
		cursor: pointer;
		padding: 2px 4px;
		border-radius: var(--radius-sm);
		transition: background var(--duration-fast);
		text-align: left;
	}

	.deck-name:hover {
		background: var(--bg-hover);
	}

	.name-input {
		font-family: var(--font-display);
		font-size: 14px;
		font-weight: 600;
		color: var(--text-gold);
		background: var(--bg-elevated);
		border: 1px solid var(--border-gold);
		border-radius: var(--radius-sm);
		padding: 2px 6px;
		outline: none;
		flex: 1;
	}

	.deck-total {
		font-size: 13px;
		color: var(--text-muted);
		font-family: var(--font-display);
	}

	/* ── Actions ── */
	.deck-actions {
		display: flex;
		gap: var(--gap-xs);
		padding: var(--gap-sm) var(--gap-md);
		border-bottom: 1px solid var(--border-subtle);
	}

	.action-btn {
		flex: 1;
		background: var(--bg-elevated);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		color: var(--text-secondary);
		font-family: var(--font-display);
		font-size: 10px;
		letter-spacing: 0.8px;
		padding: 5px 8px;
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
		text-transform: uppercase;
	}

	.action-btn:hover {
		border-color: var(--border-gold);
		color: var(--text-gold);
	}

	.action-btn.danger:hover {
		border-color: rgba(200, 60, 60, 0.5);
		color: rgba(220, 100, 100, 0.9);
	}

	/* ── Sections ── */
	.deck-sections {
		flex: 1;
		overflow-y: auto;
		padding-bottom: var(--gap-md);
	}

	.section {
		border-bottom: 1px solid var(--border-subtle);
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px var(--gap-md);
		background: var(--bg-elevated);
		position: sticky;
		top: 0;
		z-index: 1;
	}

	.section-title {
		font-family: var(--font-display);
		font-size: 11px;
		font-weight: 600;
		color: var(--text-secondary);
		letter-spacing: 1px;
		text-transform: uppercase;
	}

	.section-count {
		font-size: 12px;
		color: var(--text-muted);
		font-family: var(--font-mono);
	}

	.section-count.short {
		color: rgba(220, 160, 50, 0.7);
	}

	/* ── Entries ── */
	.deck-entry {
		display: flex;
		align-items: center;
		gap: var(--gap-xs);
		padding: 4px var(--gap-md);
		transition: background var(--duration-fast);
		cursor: default;
	}

	.deck-entry:hover {
		background: var(--bg-hover);
	}

	.entry-count {
		font-size: 11px;
		color: var(--text-muted);
		min-width: 22px;
		font-family: var(--font-mono);
	}

	.site-num {
		color: var(--text-gold);
		font-weight: 600;
	}

	.entry-name {
		flex: 1;
		font-size: 13px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.entry-cost {
		font-size: 11px;
		color: var(--text-gold);
		min-width: 14px;
		text-align: center;
		font-family: var(--font-mono);
	}

	.remove-btn {
		background: none;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		font-size: 13px;
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-sm);
		opacity: 0;
		transition: all var(--duration-fast);
		flex-shrink: 0;
	}

	.deck-entry:hover .remove-btn {
		opacity: 1;
	}

	.remove-btn:hover {
		color: rgba(220, 100, 100, 0.9);
		background: rgba(200, 60, 60, 0.12);
	}

	.empty-slot {
		padding: 8px var(--gap-md);
		font-size: 12px;
		color: var(--text-muted);
		font-style: italic;
	}

	/* ── Validation ── */
	.validation {
		padding: var(--gap-sm) var(--gap-md);
		border-top: 1px solid var(--border-subtle);
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.validation-msg {
		font-size: 11px;
		color: rgba(220, 160, 50, 0.8);
		line-height: 1.4;
	}

	.validation-msg.warning {
		color: var(--text-muted);
	}
</style>
