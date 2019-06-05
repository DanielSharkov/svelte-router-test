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
	<button on:click={() => router.back()}>
		Back
	</button>
	<button on:click={() => router.back(100)}>
		Back 100
	</button>
	<button on:click={() => router.forward()}>
		Forward
	</button>
	<button on:click={() => router.forward(100)}>
		Forward 100
	</button>
	<RouterLink to="test.params" params={{var: testParam}}>
		test
	</RouterLink>
</header>
<ul>
	{#each $router.history as {name, params}, index}
		<li index={index} class:current={$router.historyIndex === index}>
			<b>{index}: {name}</b>
			{#if params}
				<pre>{JSON.stringify(params, null, 4)}</pre>
			{/if}
		</li>
	{/each}
</ul>
<div id="router-viewport">
	<RouterView {router}/>
</div>

<style>
ul li.current {
	color: #06f;
	background-color: rgba(0,60,255,.1);
}
</style>

<script>
import RouterView from './router/RouterView'
import RouterLink from './router/RouterLink'
import router from './router'

let testParam = 'ha-ha-ha-ha'

// back
// forward
// goto(name,params)
// currentRoute
// history

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
