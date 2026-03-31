<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>LOTR TCG Digital</title>
</svelte:head>

{@render children()}
