function extend(...xs) {
	const target = last(xs)
	for (const x of head(xs))
		for (const [k, v] of Object.entries(x))
			target[k] = v
	return target
}
