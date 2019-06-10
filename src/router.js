import Router from './router/Router'

import ViewHome from './views/Home'
import RootHome from './views/Root'
import ViewParams from './views/Params'
import ViewNotFound from './views/NotFound'

export default new Router({
	routes: {
		'root': {
			path: '/',
			component: RootHome,
		},
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
	beforePush(name, params) {
		if (name == 'root') {
			name = 'home'
		}

		console.log('beforePush (hook):', name, params)
		return {
			name,
			params,
		}
	},
})
