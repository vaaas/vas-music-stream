function AlphabeticalList(items) {
	const tree = group(first_track_letter, sort(alphabetically, items))
	return extend(Component.prototype,
		E('div',
		{ class: 'alphabeticallist' },
		Object.entries(tree).map(([k, v]) =>
			E('section',
				{ class: k },
				[E('header', null, k), ...v]
			))))
}

function first_track_letter(x) {
	const fst = first(x.toString())
	const code = fst.charCodeAt(0)
	console.log(code)
	if (between(code, 48, 57)) return fst
	else if (between(code, 65, 90)) return fst
	else if (between(code, 97, 122)) return fst
	else return '#'
}
