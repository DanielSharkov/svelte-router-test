<header>
	<label for="param">Param</label>
	<input id="param" bind:value={testParam}>

	{#each $router.routes as route}
		{#if route.metadata && route.metadata.nav}
			<button on:click={() => {pushRouter(route.routeName)}}>
				{route.metadata.nav.displayName}
			</button>
		{/if}
	{/each}
	<button on:click={paramsDifferent}>
		Params Different
	</button>

	<button on:click={router.back}>
		Back
	</button>
	<button on:click={router.forward}>
		Forward
	</button>

	<RouterLink to="test.params" params={{var: testParam}}>
		test
	</RouterLink>

	<pre>$router.routes = {JSON.stringify($router.routes, null, 4)}</pre>
</header>

<div id="router-viewport">
	<RouterView {router}/>
</div>

<script>
import RouterView from './router/RouterView'
import RouterLink from './router/RouterLink'
import router from './router'

let testParam = 'ha-ha-ha-ha'

function pushRouter(routeName) {
	let params;
	if (routeName == 'test.params') {
		params = {
			var: testParam
		}
	}

	router.push(routeName, params)
}

function paramsDifferent() {
	router.push('test.params', {var:'different_param'})
}
</script>
