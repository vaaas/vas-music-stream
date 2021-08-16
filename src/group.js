function group(f, xs) {
	return xs.reduce((xs, x) => {
		const group = f(x)
		if (xs[group] === undefined) xs[group] = []
		xs[group].push(x)
		return xs
	}, {})
}
