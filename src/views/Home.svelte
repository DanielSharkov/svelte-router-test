<h1>HOME!</h1>
<button on:click={goBack}>GoBack</button>

<script>
import router from '../router'

const goBack = () => {
	router.back()
}
</script>
