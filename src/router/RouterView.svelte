<svelte:component
	this={$router.route.component}
	params={$router.route.params}
/>

<script>
	export let router;
</script>
