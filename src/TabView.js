function TabView(...xs) {
	const tabs = evens(xs)
	const views = odds(xs)
	for (let i = 0; i < tabs.length; i++) tabs[i].view = views[i]
	for (const x of views) x.hide()
	const tabbar = TabBar(tabs)
	const me = E('div', { class: 'tabview', }, [tabbar, ...views])
	me.tabbar = tabbar
	tabbar.on('active', x => me.on_active(x))
	me.active = null
	return extend(Component.prototype, TabView.prototype, me)
}
TabView.prototype = {
	on_active(tab) {
		if (tab !== this.active) {
			if (this.active) this.active.view.hide()
			this.active = tab
			this.active.view.show()
			this.emit('active', tab)
		}
		return this
	},

	activate(tab) {
		let target
		if (tab.constructor === String)
			target = find(x => x.name === tab, this.tabbar.childNodes)
		else target = tab
		target.activate()
		return this
	}
}
