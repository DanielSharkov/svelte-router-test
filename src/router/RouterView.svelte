<svelte:component
	this={$router.current.component}
	params={$router.current.params}
/>

<script>
	export let router;
</script>
