function Player() {
	const me = E('audio', { class: 'player' })
	me.controls = true
	return extend(Component.prototype, Player.prototype, me)
}
Player.prototype = {
	play_track(track=null) {
		if (track) this.src = [CONF.music, track.pathname].join('/')
		this.play()
		this.show()
		return this
	},
	pause_track() {
		this.pause()
		return this
	},
	close() {
		return this.stop()
		this.hide()
		return this
	},
}
