function Root(elem) {
	const telems = Object.values(Tracks).sort().map(TrackElement)
	const player = Player().hide()
	for (const x of telems)
		x.on('clicked', x => player.play_track(x))
	const tracks = Conditional({
		false: Component(E('h1', null, 'no tracks...')),
		true: AlphabeticalList(telems),
	})
	const tabs = new TabView(
		Tab('Tracks'), tracks,
		Tab('Browse'), Component(E('h1', null, 'Goodbye, world!')),
        Tab('Upload'), new UploadComponent(),
	)
	tabs.activate('Tracks')
    tracks.activate(V.Tracks.size() > 0)
    V.Tracks.on('add', () => tracks.activate(V.Tracks.size() > 0))
    V.Tracks.on('delete', () => tracks.activate(V.Tracks.size() > 0))

	elem.appendChild(tabs)
	elem.appendChild(player)
	return extend(Component.prototype, elem)
}
