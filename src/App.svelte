<header>
	<label for="param">Param</label>
	<input id="param" bind:value={testParam}>

	<button on:click={goToHome}>
		GoTo Home
	</button>
	<button on:click={goToParams}>
		GoTo Params
	</button>
	<button on:click={goToParams2}>
		GoTo Params 2
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

function goToHome() {
	router.push('home')
}

function goToParams() {
	router.push('test.params', {var:testParam})
}

function goToParams2() {
	router.push('test.params', {var:'different_param'})
}
</script>
