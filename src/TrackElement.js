function TrackElement(trackname) {
	const me = E('div', { class: 'track' }, [trackname])
	me.name = trackname
	me.onclick = () => me.emit('click', me)
	return extend(Component.prototype, TrackElement.prototype, me)
}
TrackElement.prototype = {
	toString() { return this.name },
}
