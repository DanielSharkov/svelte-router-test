import Router from './router/Router'

import ViewHome from './views/Home'
import ViewParams from './views/Params'
import ViewNotFound from './views/NotFound'

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
		'404': {
			path: '/404',
			component: ViewNotFound,
		},
	},
	fallback: '404',
})
