import Router from './router/Router'

import ViewHome from './views/Home'
import RootHome from './views/Root'
import ViewParams from './views/Params'
import ViewNotFound from './views/NotFound'

export default new Router({
	window,
	routes: {
		'root': {
			path: '/',
			component: RootHome,
		},
		'home': {
			path: '/home',
			component: ViewHome,
			metadata: {
				nav: {
					icon: 'home-icon',
					displayName: 'Home',
				},
			},
		},
		'test.params': {
			path: '/test/params/:var',
			component: ViewParams,
			metadata: {
				nav: {
					icon: 'params-icon',
					displayName: 'Params',
				},
			},
		},
		'404': {
			path: '/404',
			component: ViewNotFound,
		},
	},
	fallback: {
		name: '404',
	},
	beforePush(name, params) {
		if (name == 'root') {
			name = 'home'
		}

		return {
			name,
			params,
			// if redirect is not set then it's true
			redirect: true,
		}
	},
})
