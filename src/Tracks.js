class Tracks extends Watchable {
	constructor() {
		super()
		this.data = new Map()
	}

	add(...xs) {
		for (const x of xs) this.data.set(x.pathname, x)
		return this.emit('add', [xs])
	}

	delete(...xs) {
		for (const x of xs) this.data.delete(x)
		return this.emit('delete', [xs])
	}

	entries() { return this.data.entries() }
	keys() { return this.data.keys() }
	values() { return this.data.values() }
	size() { return this.data.size }
}
