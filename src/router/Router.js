import { readable, writable } from 'svelte/store';

function isValidTokenChar(code) {
	// a-z
	if (code >= 97 && code <= 122) return true
	// A-Z
	if (code >= 65 && code <= 90) return true
	// 0-9
	if (code >= 48 && code <= 57) return true

	switch (code) {
		case 33:  // ! Exclamation mark
		case 36:  // $ Dollar sign
		case 38:  // & Ampersand
		case 39:  // ' Apostrophe
		case 40:  // ( Left parenthesis
		case 41:  // ) Right parenthesis
		case 42:  // * Asterisk
		case 43:  // + Plus sign
		case 44:  // , Comma
		case 45:  // - Hyphen
		case 46:  // . Period
		case 59:  // ; Semicolon
		case 61:  // = Equals sign
		case 64:  // @ At
		case 95:  // _ Underscore
		case 126: // ~ Tilde
			return true
	}

	return false
}

function parsePathTemplate(template) {
	if (typeof template !== 'string') return new Error(
		`unexpected type (${typeof template})`
	)

	if (template.length < 1) return new Error(
		`invalid path (empty)`
	)

	const templObject = {
		tokens: [],
		parameters: {},
	}

	const regToken = (isParam, begin, end) => {
		const slice = template.substr(begin, end-begin)

		if (isParam) {
			if (slice.length < 1) return new Error(
				`missing parameter name at ${begin}`
			)

			if (slice in templObject.parameters) return new Error(
				`redeclared parameter '${slice}' at ${begin}`
			)

			if (isParam) templObject.parameters[slice] = true
		}

		templObject.tokens.push({
			token: slice,
			param: isParam,
		})
	}

	if (template.charCodeAt(0) != 47) return new Error(
		'a path template must begin with a slash'
	)
	
	let isPreviousSlash = true
	let isStatic = false
	let isParam = false
	let tokenStart = 1

	for (let itr = 1; itr < template.length; itr++) {
		const charCode = template.charCodeAt(itr)

		if (isPreviousSlash) {
			// Ignore multiple slashes
			if (charCode == 47) continue
			isPreviousSlash = false

			// Start scanning parameter
			if (charCode == 58) {
				isStatic = false
				isParam = true
				tokenStart = itr+1
			}
			// Start scanning static token
			else if (isValidTokenChar(charCode)) {
				isStatic = true
				isParam = false
				tokenStart = itr
			}
			else return new Error(
				`unexpected '${String.fromCharCode(charCode)}' at ${itr}`
			)
		}
		else if (charCode == 47) {
			// Terminating slash encountered
			isPreviousSlash = true

			const err = regToken(
				isParam,
				tokenStart,
				itr,
			)
			if (err != null) return err

			isStatic = false
			isParam = false
		}
		else if (!isValidTokenChar(charCode)) return new Error(
			`unexpected '${String.fromCharCode(charCode)}' at ${itr}`
		)

		if (itr+1 >= template.length) {
			// Last character reached
			if (isPreviousSlash) break

			if (charCode == 58) return new Error(
				`missing parameter name at ${itr}`
			)

			const err = regToken(
				isParam,
				tokenStart,
				template.length,
			)
			if (err != null) return err
		}
	}

	return templObject
}

function validateRouteName(routeName) {
	if (routeName.length < 1) return new Error(
		`invalid route name (empty)`
	)

	const charCode = routeName.charCodeAt(0)
	if (
		/*A-Z*/ (charCode < 65 && charCode > 90) &&
		/*a-z*/ (charCode < 97 && charCode > 122)
	) return new Error(
		`unexpected character ${String.fromCharCode(charCode)} ` +
		`in route name at 0 (leading character must be [A-Za-z])`
	)

	for (let itr = 1; itr < routeName.length; itr++) {
		const charCode = routeName.charCodeAt(itr)

		// A-Z
		if (charCode >= 65 && charCode <= 90) continue
		// a-z
		if (charCode >= 97 && charCode <= 122) continue
		// 0-9
		if (charCode >= 48 && charCode <= 57) continue

		switch (charCode) {
			case 45: // - Hyphen
			case 46: // . Period
			case 95: // _ Underscore
				continue
		}

		return new Error(
			`unexpected character ${String.fromCharCode(charCode)} ` +
			`in route name at ${itr}`
		)
	}
}

function parseURLPath(path) {
	if (typeof path !== 'string') return new Error(
		`unexpected type (${typeof path})`
	)

	if (path.length < 1) return new Error(
		`invalid path (empty)`
	)

	const pathTokens = []

	if (path.charCodeAt(0) != 47) return new Error(
		'a path path must begin with a slash'
	)

	let isPreviousSlash = true
	let tokenStart = 1

	for (let itr = 1; itr < path.length; itr++) {
		const charCode = path.charCodeAt(itr)

		if (isPreviousSlash) {
			// Ignore multiple slashes
			if (charCode == 47) continue
			isPreviousSlash = false

			// Start scanning token
			if (isValidTokenChar(charCode)) tokenStart = itr
			else return new Error(
				`unexpected '${String.fromCharCode(charCode)}' at ${itr}`
			)
		}
		// Terminating slash encountered
		else if (charCode == 47) {
			isPreviousSlash = true
			pathTokens.push(
				path.substr(
					tokenStart,
					itr-tokenStart,
				)
			)
		}
		else if (!isValidTokenChar(charCode)) return new Error(
			`unexpected '${String.fromCharCode(charCode)}' at ${itr}`
		)

		if (itr+1 >= path.length) {
			// Last character reached
			if (isPreviousSlash) break
			pathTokens.push(
				path.substr(
					tokenStart,
					path.length-tokenStart
				)
			)
		}
	}

	return pathTokens
}

export default function Router(conf) {
	const _templates = {}
	const _routes = {}
	const _index = {
		param: null,
		routes: {},
		component: null,
		redirect: null,
	}

	const {
		subscribe: storeSubscribe,
		set: storeSet,
	} = writable({
		current: {
			name: '',
			params: {},
			component: null,
		},
		history: [],
		historyIndex: 0,
	})

	/*
	return {
		subscribe,
		goTo(name) {
			console.log('GOTO? ', name)
			update(n => {
				return {
					name: name,
					counter: n.counter,
				}
			})
		}
	}
	*/

	for (const routeName in conf.routes) {
		const route = conf.routes[routeName]
		const template = route.path

		// Ensure route name validity
		let err = validateRouteName(routeName)
		if (err instanceof Error) throw err

		// Ensure route name uniqueness
		if (routeName in _routes) throw new Error(
			`redeclaration of route ${routeName}`
		)

		// Ensure redirect and component aren't defined simultaneously
		if (
			route.redirect !== undefined &&
			route.component !== undefined
		) throw new Error(
			`route ${routeName} defines both 'redirect' and 'component'`
		)

		//TODO: Ensure redirect isn't recursive

		// Parse path and ensure it's validity
		const path = parsePathTemplate(template)
		if (path instanceof Error) throw new Error(
			`route ${routeName} defines an invalid path template: ${path}`
		)

		// Ensure path template uniqueness
		if (template in _templates) throw new Error(
			`route ${routeName} and ` +
			`${_templates[template]} share the same path template: ` +
			`'${template}'`
		)

		const entry = {
			path: path,
			component: route.component,
			redirect: route.redirect,
		}
		_templates[template] = entry
		_routes[routeName] = entry

		let currentNode = _index
		for (let level = 0; level < path.tokens.length; level++) {
			const token = path.tokens[level]

			if (token.param) {
				// Follow node
				if (currentNode.param != null) {
					currentNode = currentNode.param
				}
				// Initialize parameterized branch
				else {
					const newNode = {
						param: null,
						routes: {},
						redirect: null,
						component: null,
					}
					currentNode.param = newNode
					currentNode = newNode
				}
			}
			else {
				const routeNode = currentNode.routes[token.token]
				// Declare static route node
				if (!routeNode) {
					const newNode = {
						param: null,
						routes: {},
						redirect: null,
						component: null,
					}
					currentNode.routes[token.token] = newNode
					currentNode = newNode
				}
				// Follow node
				else {
					currentNode = routeNode
				}
			}
		}
		currentNode.redirect = entry.redirect
		currentNode.component = entry.component
	}

	const getRoute = path => {
		const tokens = parseURLPath(path)
		let currentNode = _index
		for (let level = 0; level < tokens.length; level++) {
			const token = tokens[level]

			// tokens is a static route
			if (token in currentNode.routes) {
				currentNode = currentNode.routes[token]
			}
			// parameter route
			else if(currentNode.param) {
				currentNode = currentNode.param
			}

			// is last token
			if (level + 1 >= tokens.length) {
				// display component
				if (currentNode.component) return {
					component: currentNode.component
				}
				// redirect to another view
				else if(currentNode.redirect) return {
					redirect: true,
					redirectComponent: currentNode.redirect,
				}
				// not found
				else return new Error(
					`path ${path} doesn't resolve any route`
				)
			}
		}
	}

	function stringifyRoutePath(tokens, params) {
		let str = ''
		for (const idx in tokens) {
			const token = tokens[idx]
			if (token.param && !params) throw new Error(
				`expected parameter '${token.token}' but got '${params}'`
			)
			str += token.param ?
				`/${params[token.token]}` : `/${token.token}`
		}
		return str
	}

	function nameToPath(name, params) {
		if (name && name === '') throw new Error(
			`invalid name: '${name}'`
		)
		return stringifyRoutePath(
			_routes[name].path.tokens,
			params,
		)
	}

	let historyIndex = 0
	const history = []

	const push = function(name, params) {
		const route = _routes[name]
		if (!route) throw new Error(
			`route '${name}' not found`
		)

		const paramNames = Object.keys(route.path.parameters)
		if (paramNames.length > 0) {
			if (!params) throw new Error(
				`missing parameters: ${paramNames}`
			)

			// Parameters expected
			for (const paramName in route.path.parameters) {
				if (!(paramName in params)) throw new Error(
					`missing parameter '${paramName}'`
				)
			}
		}

		if (history.length > 0) {
			const currentRoute = history[historyIndex]
			if (name === currentRoute.name) {
				if (currentRoute.params && params) {
					for (const param in params) {
						if (
							param in currentRoute.params &&
							params[param] === currentRoute.params[param]
						) return
					}
				}
				else return
			}
		}

		if (historyIndex !== history.length - 1) {
			// Overwrite last history entries when index is behind
			history.splice(
				historyIndex + 1,
				history.length,
			)
		}

		// Push new route to history
		history.push({
			name,
			params,
		})
		historyIndex = history.length - 1
		
		storeSet({
			history: history,
			historyIndex,
			current: {
				name,
				params,
				component: route.component,
			},
		})
		window.history.pushState(
			params,
			null,
			stringifyRoutePath(
				route.path.tokens,
				params,
			),
		)
	}

	const back = function(n = 1) {
		if (!Number(n)) throw new Error(
			`given value is not a number: ${n} (${typeof n})`
		)

		// TODO:
		if (n < 0) throw new Error(
			'HANDLE ME - Negative numbers on back'
		)

		// Abbort back call when history is not bigger then to records
		if (history.length < 2) return

		if (historyIndex < 1) return

		if (n > history.length) {
			historyIndex = 0
		}
		else {
			historyIndex -= n
		}

		const historyEntry = n > history.length ?
			history[0] : history[historyIndex]

		const route = _routes[historyEntry.name]

		storeSet({
			history: history,
			historyIndex,
			current: {
				name: historyEntry.name,
				params: historyEntry.params,
				component: route.component,
			},
		})
		window.history.pushState(
			historyEntry.params,
			null,
			stringifyRoutePath(
				route.path.tokens,
				historyEntry.params,
			),
		)
	}

	const forward = function(n = 1) {
		if (!Number(n)) throw new Error(
			`given value is not a number: ${n} (${typeof n})`
		)

		// TODO:
		if (n < 0) throw new Error(
			'HANDLE ME - Negative numbers on back'
		)

		if (historyIndex + n >= history.length) {
			historyIndex = history.length - 1
		}
		else {
			historyIndex += n
		}

		const historyEntry = n > history.length ?
			history[history.length - 1] : history[historyIndex]

		const route = _routes[historyEntry.name]

		storeSet({
			history: history,
			historyIndex,
			current: {
				name: historyEntry.name,
				params: historyEntry.params,
				component: route.component,
			},
		})
		window.history.pushState(
			historyEntry.params,
			null,
			stringifyRoutePath(
				route.path.tokens,
				historyEntry.params,
			),
		)
	}

	Object.defineProperties(this, {
		subscribe: {value: storeSubscribe},
		push: {value: push},
		// 'resolveURLPath': {value: (path) => {
		// 	console.log(`INDEX: ${JSON.stringify(_index, null, 2)}`)
		// 	console.log(`PUSH ${path} -> `, getRoute(path))
		// }}
		back: {value: back},
		forward: {value: forward},
		nameToPath: {value: nameToPath},
	})
}
