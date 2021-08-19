function UploadComponent() {
	const me = E('div', null, [
		E('input', {
			'type': 'file',
			'webkitdirectory': 'webkitdirectory',
			'directory': 'directory',
			'multiple': 'multiple',
		})
	])
	return extend(Component.prototype, UploadComponent.prototype, me)
}
