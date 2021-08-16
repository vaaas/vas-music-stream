function AlphabeticalList(items) {
	const tree = group(x => first(x.toString()), sort(alphabetically, items))
	return extend(Component.prototype,
        E('div',
		{ class: 'alphabeticallist' },
		Object.entries(tree).map(([k, v]) =>
			E('section',
				{ class: k },
				[E('header', null, k), ...v]
			))))
}
