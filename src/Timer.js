class Timer {
	constructor(f, t=0) {
		this.id = null
		this.t = 0
		this.f = f
	}

	start() {
		if (this.id) this.stop()
		this.id = setTimeout(this.f, this.t)
		return this
	}

	stop() {
		if (this.id) {
			clearTimeout(this.id)
			this.id = null
		}
		return this
	}
}
