<header>
	<label for="param">Param</label>
	<input id="param" bind:value={testParam}>

	{#each $router.routes as route}
		{#if route.metadata && route.metadata.nav}
			<button on:click={() => {pushRouter(route.name)}}>
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
</header>

<div id="router-viewport">
	<RouterView {router}/>
</div>

<script>
import RouterView from './router/RouterView'
import RouterLink from './router/RouterLink'
import router from './router'

let testParam = 'ha-ha-ha-ha'

function pushRouter(name) {
	let params;
	if (name == 'test.params') {
		params = {
			var: testParam
		}
	}

	console.log(name, params)
	router.push(name, params)
}

function paramsDifferent() {
	router.push('test.params', {var:'different_param'})
}
</script>
