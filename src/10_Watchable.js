class Watchable {
	constructor() {
		this.watchers = new Map()
	}

	on(e, f) {
		if (!this.watchers.has(e)) this.watchers.set(e, new Set())
		this.watchers.get(e).add(f)
		return this
	}

	emit(e, v) {
		const fs = this.watchers.get(e)
		if (fs) for (const f of fs) f(v)
		return this
	}
}
