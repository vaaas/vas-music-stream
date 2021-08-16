function Component(element) {
	return extend(Component.prototype, element)
}
Component.prototype = {
	emit(k, v) {
		const event = new CustomEvent(k, { detail: v })
		this.dispatchEvent(event)
	},
	on(e, f) {
		this.addEventListener(e, x => f(x.detail))
		return this
	},
	hide() {
		this.classList.add('hidden')
		return this
	},
	show() {
		this.classList.remove('hidden')
		return this
	},
}
