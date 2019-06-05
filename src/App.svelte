<header>
	<label for="param">Param</label>
	<input id="param" bind:value={testParams.var}>
	<button on:click={goToHome}>
		GoTo Home
	</button>
	<button on:click={goToParams}>
		GoTo Params
	</button>
	<RouterLink to="params" params={testParams}>
		Params
	</RouterLink>
</header>
<pre>{JSON.stringify($router.history)}</pre>
<RouterView {router}/>

<script>
import RouterView from './router/RouterView'
import RouterLink from './router/RouterLink'
import router from './router'

console.log('APP: ', $router.current)
const testParams = {
	var: 'ha-ha-ha-ha',
}

// back
// forward
// goto(name,params)
// currentRoute
// history

function goToHome() {
	router.push('home')
}
function goToParams() {
	router.push('test.params', testParams)
}

</script>
