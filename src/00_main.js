'use strict'
let CONF
const Tracks = {}
const Dirs = {}

const SONG_EXTENSIONS = new Set(['opus', 'mp3', 'm4a', 'ogg', 'mka', 'flac', 'aac'])
const COVER_EXTENSIONS = [ 'png', 'jpg', 'jpeg' ]

async function main() {
	CONF = await get('conf.json').then(JSON.parse)
	let x = await post('/', remote(walk_directory, CONF.music))
	x = JSON.parse(x)
	x = x.map(x => x.slice(CONF.music.length + 1))
	x = dirs_to_tree(x)
	x = parse_music(x)
	Root(document.body)
}

window.onload = main
