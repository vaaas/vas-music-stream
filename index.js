'use strict'
let CONF

const text = x => x.text()
const head = x => x.slice(0, x.length - 1)
const last = x => x[x.length - 1]

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

function remote(f, ...args) {
	return `(${f.toString()})(${args.map(JSON.stringify).join(', ')})`
}

function get(url) {
	return fetch(url, {
		method: 'GET',
		credentials: 'same-origin',
	}).then(text)
}

function post(url, data) {
	return fetch(url, {
		method: 'POST',
		credentials: 'same-origin',
		body: data,
		headers: {
			'Content-Type': 'text/javascript',
		},
	}).then(text)
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

function make_music_tree(tree, prefix=[]) {
	for (const k in tree) {
		const v = tree[k]
		if (v.constructor === Array)
			music_tree(v, [...tags, k])
	}
	return tree
}

async function main() {
	CONF = await get('conf.json').then(JSON.parse)
	let x = await post('/', remote(walk_directory, CONF.music))
	x = JSON.parse(x)
	x = x.map(x => x.slice(CONF.music.length + 1))
	x = dirs_to_tree(x)
	x = make_music_tree(x)
	console.log(x)
}

window.onload = main
