function TrackElement(track) {
	const me = E('div', { class: 'track' }, [track.pathname])
	me.track = track
	me.onclick = () => me.emit('clicked', me.track)
	return extend(Component.prototype, TrackElement.prototype, me)
}
TrackElement.prototype = {
	toString() { return this.track.pathname },
}
