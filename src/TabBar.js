function TabBar(tabs) {
	const me = E('nav', { class: 'tabbar', }, tabs)
	me.tabs = tabs
	for (const x of tabs)
		x.on('active', v => { if (v) me.on_active(x) })
	me.active = null
	return extend(Component.prototype, TabBar.prototype, me)
}
TabBar.prototype = {
	activate(tab) {
		tab.activate()
		return this
	},

	on_active(tab) {
		if (tab !== this.active) {
			if (this.active) this.active.deactivate()
			this.active = tab
			this.emit('active', this.active)
		}
		return this
	},
}
