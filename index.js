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
	console.log(Dirs, Tracks)

	Root(document.body)
}

function Root(elem) {
	const tabs = new TabView({
		'Tracks': new Component(E('h1', null, 'Hello, world!')),
		'Browse': new Component(E('h1', null, 'Goodbye, world!')),
	})
	elem.appendChild(tabs.element)
	tabs.activate('Tracks')
}

class Component {
	constructor(element=null) {
		this.watchers = {}
		this.element = element
	}

	emit(k, v) {
		const fs = this.watchers[k]
		if (fs) for (const f of fs) f(v)
		return this
	}

	on(e, f) {
		let fs = this.watchers[e]
		if (!fs) this.watchers[e] = fs = []
		fs.push(f)
		return this
	}

	echo(x, e) {
		x.on(e, v => this.emit(e, v))
		return this
	}

	hide() {
		this.element.classList.add('hidden')
		return this
	}

	show() {
		this.element.classList.remove('hidden')
		return this
	}
}

class TabView extends Component {
	constructor(tabs) {
		super()
		this.tabs = tabs
		this.tabbar = new TabBar(Object.keys(this.tabs).map(N(Tab)))
		for (const x of Object.values(this.tabs)) x.hide()
		this.element = E('div', { class: 'tabview', }, [this.tabbar, ...Object.values(this.tabs)].map(x => x.element))
		this.tabbar.on('active', x => this.on_active(x))
		this.active = null
	}

	on_active(tab) {
		if (this.active) this.active.hide()
		this.active = this.tabs[tab.name].show()
		return this.emit('active', this.active)
	}

	activate(tabname) {
		this.tabbar.activate(tabname)
		return this
	}
}

class TabBar extends Component {
	constructor(tabs) {
		super()
		this.element = E('nav', { class: 'tabbar', }, tabs.map(x => x.element))
		this.tabs = tabs
		for (const x of tabs) {
			x.tabbar = this
			x.on('active', v => { if (v) this.on_active(x) })
		}
		this.active = null
	}

	activate(tabname) {
		const tab = find(x => x.name === tabname, this.tabs)
		if (tab) tab.activate()
		return this
	}

	on_active(tab) {
		if (this.active) find(is(this.active), this.tabs).deactivate()
		this.active = tab
		return this.emit('active', this.active)
	}
}

class Tab extends Component {
	constructor(name) {
		super()
		this.name = name
		this.element = E('div', {
			class: 'tab',
			on: {
				'click': () => this.activate()
			},
		}, [name])
		this.tabbar = null
	}

	activate() {
		this.element.classList.add('active')
		return this.emit('active', true)
	}

	deactivate() {
		this.element.classList.remove('active')
		return this.emit('active', false)
	}
}

window.onload = main
