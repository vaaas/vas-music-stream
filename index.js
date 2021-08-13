'use strict'
let CONF

const text = x => x.text()
const head = x => x.slice(0, x.length - 1)
const last = x => x[x.length - 1]

const Songs = []
const Directories = {}
const Tags = {}

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

function file_extension(x) {
	const i = x.lastIndexOf('.')
	if (i === -1) return null
	else return x.slice(i+1)
}

function change_file_extension(x, to) {
	const i = x.lastIndexOf('.')
	if (i === -1) return x + to
	else return x.slice(0, i+1) + to
}

function song_file_p(x) {
	return ['opus', 'mp3', 'm4a', 'ogg', 'mka', 'flac', 'aac'].includes(file_extension(x))
}

function find_cover_art(dir, entry) {
	return
		dir[change_file_extension(entry, 'png') ||
		dir[change_file_extension(entry, 'jpg') ||
		dir['cover.png'] ||
		dir['cover.jpg'] ||
		null
}

function parse_music(tree, prefix=[]) {
	for (const k in tree) {
		if (v.constructor === String) {
			if (song_file_p(v)) {
				const x = {
					pathname: v,
					cover: find_cover_art(tree, k),
				}
				Directories[prefix.join('/')].add(x)
			}
		} else {
		}
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
	x = parse_music(x)
	console.log(x)
}

window.onload = main
