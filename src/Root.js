function Root(elem) {
	const tracks = Conditional({
		false: Component(E('h1', null, 'no tracks...')),
		true: AlphabeticalList(Object.keys(Tracks).sort().map(N(TrackElement))),
	})
	const tabs = new TabView(
		Tab('Tracks'), tracks,
		Tab('Browse'), Component(E('h1', null, 'Goodbye, world!')),
	)
	elem.appendChild(tabs)
	tabs.activate('Tracks')
	tracks.activate(true)
	return extend(Component.prototype, elem)
}
