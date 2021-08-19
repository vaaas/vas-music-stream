function parse_music(tree, prefix=[]) {
	const dirname = prefix.join('/') || '/'
	let dir = V.Dirs[dirname]
	if (dir === undefined) {
		dir = {
			pathname: dirname,
			tracks: new Set(),
			dirs: new Set(),
			cover: null,
			parent: null,
		}
		V.Dirs[dirname] = dir
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
				V.Tracks.add(x)
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
			V.Dirs[pathname] = x
			dir.dirs.add(x)
			parse_music(v, [...prefix, k])
		}
	}
	return dir
}
