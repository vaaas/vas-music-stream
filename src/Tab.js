function Tab(name) {
	const me = E('div', {
		class: 'tab',
		on: {
			'click': () => me.activate()
		},
	}, [name])
	me.name = name
	return extend(Component.prototype, Tab.prototype, me)
}
Tab.prototype = {
	activate() {
		this.classList.add('active')
		return this.emit('active', true)
	},

	deactivate() {
		this.classList.remove('active')
		return this.emit('active', false)
	}
}
