<script lang="ts">
	interface FilterOptions {
		cultures: string[];
		types: string[];
		races: string[];
		rarities: string[];
	}

	interface Props {
		filters: FilterOptions;
		onSearch: (params: Record<string, string>) => void;
	}

	let { filters, onSearch }: Props = $props();

	let query = $state('');
	let culture = $state('');
	let type = $state('');
	let side = $state('');
	let rarity = $state('');
	let race = $state('');
	let set = $state('');

	let debounceTimer: ReturnType<typeof setTimeout>;

	function emitSearch() {
		const params: Record<string, string> = {};
		if (query) params.q = query;
		if (culture) params.culture = culture;
		if (type) params.type = type;
		if (side) params.side = side;
		if (rarity) params.rarity = rarity;
		if (race) params.race = race;
		if (set) params.set = set;
		onSearch(params);
	}

	function onQueryInput() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(emitSearch, 200);
	}

	function clearAll() {
		query = '';
		culture = '';
		type = '';
		side = '';
		rarity = '';
		race = '';
		set = '';
		emitSearch();
	}

	const SET_NAMES: Record<string, string> = {
		'0': 'Promo',
		'1': 'Fellowship of the Ring',
		'2': 'Mines of Moria',
		'3': 'Realms of the Elf-Lords',
		'4': 'The Two Towers',
		'5': 'Battle of Helm\'s Deep',
		'6': 'Ents of Fangorn',
		'7': 'Return of the King',
		'8': 'Siege of Gondor',
		'9': 'Reflections',
		'10': 'Mount Doom',
		'11': 'Shadows',
		'12': 'Black Rider',
		'13': 'Bloodlines',
		'14': 'Expanded Middle-earth',
		'15': 'The Hunters',
		'16': 'The Wraith Collection',
		'17': 'Rise of Saruman',
		'18': 'Treachery & Deceit',
		'19': 'Ages End',
	};

	const hasActiveFilters = $derived(
		query !== '' || culture !== '' || type !== '' || side !== '' ||
		rarity !== '' || race !== '' || set !== ''
	);
</script>

<div class="filter-bar">
	<div class="search-row">
		<div class="search-input-wrap">
			<svg class="search-icon" viewBox="0 0 24 24" width="16" height="16">
				<circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="2"/>
				<line x1="15" y1="15" x2="21" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
			</svg>
			<input
				type="text"
				class="search-input"
				placeholder="Search cards..."
				bind:value={query}
				oninput={onQueryInput}
			/>
		</div>
		{#if hasActiveFilters}
			<button class="clear-btn" onclick={clearAll}>Clear all</button>
		{/if}
	</div>

	<div class="filter-row">
		<select class="filter-select" bind:value={side} onchange={emitSearch}>
			<option value="">All sides</option>
			<option value="Free Peoples">Free Peoples</option>
			<option value="Shadow">Shadow</option>
		</select>

		<select class="filter-select" bind:value={culture} onchange={emitSearch}>
			<option value="">All cultures</option>
			{#each filters.cultures as c}
				<option value={c}>{c}</option>
			{/each}
		</select>

		<select class="filter-select" bind:value={type} onchange={emitSearch}>
			<option value="">All types</option>
			{#each filters.types as t}
				<option value={t}>{t}</option>
			{/each}
		</select>

		<select class="filter-select" bind:value={race} onchange={emitSearch}>
			<option value="">All races</option>
			{#each filters.races as r}
				<option value={r}>{r}</option>
			{/each}
		</select>

		<select class="filter-select" bind:value={rarity} onchange={emitSearch}>
			<option value="">All rarities</option>
			{#each filters.rarities as r}
				<option value={r}>{r}</option>
			{/each}
		</select>

		<select class="filter-select" bind:value={set} onchange={emitSearch}>
			<option value="">All sets</option>
			{#each Object.entries(SET_NAMES) as [num, name]}
				<option value={num}>{num}: {name}</option>
			{/each}
		</select>
	</div>
</div>

<style>
	.filter-bar {
		padding: var(--gap-md);
		background: var(--bg-surface);
		border-bottom: 1px solid var(--border-subtle);
		display: flex;
		flex-direction: column;
		gap: var(--gap-sm);
	}

	.search-row {
		display: flex;
		align-items: center;
		gap: var(--gap-sm);
	}

	.search-input-wrap {
		flex: 1;
		position: relative;
	}

	.search-icon {
		position: absolute;
		left: 12px;
		top: 50%;
		transform: translateY(-50%);
		color: var(--text-muted);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		background: var(--bg-elevated);
		border: 1px solid var(--border-light);
		border-radius: var(--radius-md);
		color: var(--text-primary);
		font-family: var(--font-body);
		font-size: 15px;
		padding: 10px 14px 10px 38px;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.search-input::placeholder {
		color: var(--text-muted);
	}

	.search-input:focus {
		outline: none;
		border-color: var(--border-gold);
	}

	.clear-btn {
		background: none;
		border: 1px solid var(--border-light);
		border-radius: var(--radius-sm);
		color: var(--text-secondary);
		font-family: var(--font-body);
		font-size: 13px;
		padding: 8px 14px;
		cursor: pointer;
		white-space: nowrap;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.clear-btn:hover {
		color: var(--text-primary);
		border-color: var(--border-gold);
	}

	.filter-row {
		display: flex;
		gap: var(--gap-sm);
		flex-wrap: wrap;
	}

	.filter-select {
		background: var(--bg-elevated);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		color: var(--text-secondary);
		font-family: var(--font-body);
		font-size: 13px;
		padding: 6px 10px;
		cursor: pointer;
		min-width: 120px;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.filter-select:focus {
		outline: none;
		border-color: var(--border-gold);
	}

	.filter-select option {
		background: var(--bg-elevated);
		color: var(--text-primary);
	}
</style>
