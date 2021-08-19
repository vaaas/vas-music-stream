'use strict'
const V = {}
async function main() {
    V.Tracks = new Tracks()
    V.Dirs = {}
	V.CONF = await get('conf.json').then(JSON.parse)
	let x = await post('/', remote(walk_directory, V.CONF.music))
	x = JSON.parse(x)
	x = x.map(x => x.slice(V.CONF.music.length + 1))
	x = dirs_to_tree(x)
	x = parse_music(x)
	Root(document.body)
}
window.onload = main
