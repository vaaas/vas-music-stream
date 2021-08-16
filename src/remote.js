const remote = (f, ...args) => `(${f.toString()})(${args.map(JSON.stringify).join(', ')})`

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
