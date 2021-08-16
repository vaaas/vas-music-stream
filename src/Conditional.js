function Conditional(elements) {
	const me = E('div', null, Object.values(elements))
	me.active = null
	me.elements = elements
	for (const x of Object.values(elements)) x.hide()
	return extend(Component.prototype, Conditional.prototype, me)
}
Conditional.prototype = {
	activate(name) {
		if (this.active) this.active.hide()
		this.active = this.elements[name]
		this.active.show()
		this.emit('active', this.active)
	},
}
