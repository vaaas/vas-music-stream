'use strict'
let CONF
const Tracks = {}
const Dirs = {}

const SONG_EXTENSIONS = new Set(['opus', 'mp3', 'm4a', 'ogg', 'mka', 'flac', 'aac'])
const COVER_EXTENSIONS = [ 'png', 'jpg', 'jpeg' ]

function last(x) { return x[x.length-1] }
function first(x) { return x[0] }
function head(x) { return x.slice(0, x.length - 1) }
function tail(x) { return x.slice(1) }
function change_file_extension(x, to) { return without_extension(x) + to }
function remote(f, ...args) { return `(${f.toString()})(${args.map(JSON.stringify).join(', ')})` }
function song_file_p(x) { return SONG_EXTENSIONS.has(file_extension(x)) }
function cover_file_p(x) { return some(is(x), combine(['cover'], COVER_EXTENSIONS)) }
function get(url) { return fetch(url).then(text) }
function post(url, body, headers={}) { return fetch(url, { method: 'POST', body, headers }).then(text) }
function find(f, xs) { for (const x of xs) if (f(x)) return x ; return null }
function some(f, xs) { for (const x of xs) if (f(x)) return true ; return false }
function every(f, xs) { for (const x of xs) if (!f(x)) return false ; return true }
function file_extension(x) { const i = x.lastIndexOf('.') ; return i === -1 ? null : x.slice(i+1) }
function without_extension(x) { const i = x.lastIndexOf('.') ; return i === -1 ? x : x.slice(0, i) }
function is(a) { return function(b) { return a === b } }
function text(x) { return x.text() }
function $(x) { return document.querySelector(x) }
function $$(x) { return Array.from(document.querySelectorAll(x)) }
function N(a) { return function(b) { return new a(b) } }
function sort(f, xs) { return xs.sort((a, b) => f(a) < f(b) ? -1 : 1) }
function alphabetically(x) { return x.toString() }

function extend(...xs) {
	const target = last(xs)
	for (const x of head(xs))
		for (const [k, v] of Object.entries(x))
			target[k] = v
	return target
}

function group(f, xs) {
	return xs.reduce((xs, x) => {
		const group = f(x)
		if (xs[group] === undefined) xs[group] = []
		xs[group].push(x)
		return xs
	}, {})
}

function E(tag, attrs=null, children=null) {
	const elem = document.createElement(tag)
	if (attrs)
		for (const [k, v] of Object.entries(attrs))
			switch(k) {
				case 'class':
					elem.className = v
					break
				case 'on':
					for (const [e, f] of Object.entries(v))
						elem.addEventListener(e, f)
					break
				default:
					elem[k] = v
					break
			}
	if (children)
		for (const x of children)
			if (x instanceof Node) elem.appendChild(x)
			else elem.appendChild(document.createTextNode(x))
	return elem
}

function find_cover_art(dir, entry) {
	return find(x => x in dir, combine([without_extension(entry), 'cover'], COVER_EXTENSIONS))
}


function walk_directory(dir) {
	const xs = []
	for (const name of fs.readdirSync(dir)) {
		if (name[0] === '.') continue
		const pathname = path.join(dir, name)
		const stats = fs.statSync(pathname)
		if (stats.isDirectory()) xs.push(...walk_directory(pathname))
		else if (stats.isFile()) xs.push(pathname)
	}
	return xs
}

function dirs_to_tree(x) {
	return x.reduce((xs, x) => {
		const parts = x.split('/')
		const deepest = head(parts).reduce((xs, x) => {
			if (!xs.hasOwnProperty(x))
				xs[x] = {}
			return xs[x]
		}, xs)
		deepest[last(parts)] = x
		return xs
	}, {})
}

function* combine(...xs) { yield* _combine([], xs) }
function* _combine(head, tails) {
	if (tails.length === 0) yield head
	else for (const x of first(tails))
		yield* _combine([...head, x], tails.slice(1))
}

function parse_music(tree, prefix=[]) {
	const dirname = prefix.join('/') || '/'
	let dir = Dirs[dirname]
	if (dir === undefined) {
		dir = {
			pathname: dirname,
			tracks: new Set(),
			dirs: new Set(),
			cover: null,
			parent: null,
		}
		Dirs[dirname] = dir
	}
	for (const k in tree) {
		const v = tree[k]
		if (v.constructor === String) {
			if (song_file_p(k)) {
				const x = {
					pathname: v,
					cover: find_cover_art(tree, k),
					dir: dir,
					tags: prefix,
				}
				dir.tracks.add(x)
				Tracks[v] = x
			} else if (cover_file_p(k)) dir.cover = v
		} else {
			const pathname = [...prefix, k].join('/')
			const x = {
				pathname,
				tracks: new Set(),
				dirs: new Set(),
				cover: null,
				parent: dir,
			}
			Dirs[pathname] = x
			dir.dirs.add(x)
			parse_music(v, [...prefix, k])
		}
	}
	return dir
}

async function main() {
	CONF = await get('conf.json').then(JSON.parse)
	let x = await post('/', remote(walk_directory, CONF.music))
	x = JSON.parse(x)
	x = x.map(x => x.slice(CONF.music.length + 1))
	x = dirs_to_tree(x)
	x = parse_music(x)
	Root(document.body)
}

function Root(elem) {
	const tracks = Conditional({
		false: Component(E('h1', null, 'no tracks...')),
		true: AlphabeticalList(Object.keys(Tracks).sort().map(N(TrackElement))),
	})
	const tabs = new TabView({
		'Tracks': tracks,
		'Browse': Component(E('h1', null, 'Goodbye, world!')),
	})
	elem.appendChild(tabs)
	tabs.activate(tracks)
	tracks.activate(true)
	return extend(Component.prototype, elem)
}

function Component(element) {
	return extend(Component.prototype, element)
}
Component.prototype = {
	emit(k, v) {
		const event = new CustomEvent(k, { detail: v })
		this.dispatchEvent(event)
	},
	on(e, f) {
		this.addEventListener(e, x => f(x.detail))
		return this
	},
	hide() {
		this.classList.add('hidden')
		return this
	},
	show() {
		this.classList.remove('hidden')
		return this
	},
}

function Conditional(elements) {
	const me = E('div', null, Object.values(elements))
	me.active = null
	me.elements = elements
	for (const x of Object.values(elements)) x.hide()
	return extend(Component.prototype, Conditional.prototype, me)
}
Conditional.prototype = {
	activate(name) {
		if (this.active) this.active.hide()
		this.active = this.elements[name]
		this.active.show()
		this.emit('active', this.active)
	},
}

function AlphabeticalList(items) {
	const tree = group(x => first(x.toString()), sort(alphabetically, items))
	return extend(Component.prototype, E('div',
		{ class: 'alphabeticallist' },
		Object.entries(tree).map(([k, v]) =>
			E('section',
				{ class: k },
				[E('header', null, k), ...v]
			))))
}

function TrackElement(trackname) {
	const me = E('div', { class: 'track' }, [trackname])
	me.name = trackname
	me.onclick = () => me.emit('click', me)
	return extend(Component.prototype, TrackElement.prototype, me)
}
TrackElement.prototype = {
	toString() { return this.name },
}

function TabView(tabs) {
	const tabbar = TabBar(Object.keys(tabs).map(Tab))
	const me = E('div', { class: 'tabview', }, [tabbar, ...Object.values(tabs)])
	me.tabbar = tabbar
	me.tabs = tabs
	for (const x of Object.values(me.tabs)) x.hide()
	me.tabbar.on('active', x => me.on_active(x))
	me.active = null
	return extend(Component.prototype, TabView.prototype, me)
}
TabView.prototype = {
	on_active(tab) {
		if (tab !== this.active) {
			if (this.active) this.active.hide()
			this.active = this.tabs[tab.name].show()
			this.emit('active', this.active)
		}
		return this
	},

	activate(tab) {
		this.tabbar.activate(tab)
		return this
	}
}

function TabBar(tabs) {
	const me = E('nav', { class: 'tabbar', }, tabs)
	me.tabs = tabs
	for (const x of tabs)
		x.on('active', v => { if (v) me.on_active(x) })
	me.active = null
	return extend(Component.prototype, TabBar.prototype, me)
}
TabBar.prototype = {
	activate(tab) {
		tab.activate()
		return this
	},

	on_active(tab) {
		if (tab !== this.active) {
			if (this.active) this.active.deactivate()
			this.active = tab
			this.emit('active', this.active)
		}
		return this
	},
}

function Tab(name) {
	const me = E('div', {
		class: 'tab',
		on: {
			'click': () => me.activate()
		},
	}, [name])
	me.name = name
	return extend(Component.prototype, Tab.prototype, me)
}
Tab.prototype = {
	activate() {
		this.classList.add('active')
		return this.emit('active', true)
	},

	deactivate() {
		this.classList.remove('active')
		return this.emit('active', false)
	}
}

window.onload = main
