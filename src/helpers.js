const last = x => x[x.length-1]
const first = x => x[0]
const head = x => x.slice(0, x.length - 1)
const tail = x => x.slice(1)
const change_file_extension = (x, to) => without_extension(x) + to
const remote = (f, ...args) => `(${f.toString()})(${args.map(JSON.stringify).join(', ')})`
const song_file_p = x => SONG_EXTENSIONS.has(file_extension(x))
const cover_file_p = x => some(is(x), combine(['cover'], COVER_EXTENSIONS))
const get = x => fetch(x).then(text)
const post = (url, body, headers={}) => fetch(url, { method: 'POST', body, headers }).then(text)
function find(f, xs) { for (const x of xs) if (f(x)) return x ; return null }
function find_index(f, xs) { let i = 0 ; for (const x of xs) if (f(x)) return i ; return null }
function some(f, xs) { for (const x of xs) if (f(x)) return true ; return false }
function every(f, xs) { for (const x of xs) if (!f(x)) return false ; return true }
function file_extension(x) { const i = x.lastIndexOf('.') ; return i === -1 ? null : x.slice(i+1) }
function without_extension(x) { const i = x.lastIndexOf('.') ; return i === -1 ? x : x.slice(0, i) }
const is = a => b => a === b
const text = x => x.text()
const $ = x => document.querySelector(x)
const $$ = x => Array.from(document.querySelectorAll(x))
const N = a => b => new a(b)
const sort = (f, xs) => xs.sort((a, b) => f(a) < f(b) ? -1 : 1)
const alphabetically = x => x.toString()
const even = x => (x % 2) === 0
const odd = x => !even(x)
const evens = x => x.filter((x, i) => even(i))
const odds = x => x.filter((x, i) => odd(i))

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
