import Router from './router/Router'

import ViewHome from './views/Home'
import ViewParams from './views/Params'

export default new Router({
	routes: {
		'home': {
			path: '/home',
			component: ViewHome,
		},
		'test.params': {
			path: '/test/params/:var',
			component: ViewParams,
		},
	}
})
