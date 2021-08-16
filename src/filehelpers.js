const change_file_extension = (x, to) => without_extension(x) + to
const song_file_p = x => SONG_EXTENSIONS.has(file_extension(x))
const cover_file_p = x => some(is(x), combine(['cover'], COVER_EXTENSIONS))
function file_extension(x) { const i = x.lastIndexOf('.') ; return i === -1 ? null : x.slice(i+1) }
function without_extension(x) { const i = x.lastIndexOf('.') ; return i === -1 ? x : x.slice(0, i) }

function find_cover_art(dir, entry) {
	return find(x => x in dir, combine([without_extension(entry), 'cover'], COVER_EXTENSIONS))
}
