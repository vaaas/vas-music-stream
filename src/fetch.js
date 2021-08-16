const get = x => fetch(x).then(text)
const post = (url, body, headers={}) => fetch(url, { method: 'POST', body, headers }).then(text)
const text = x => x.text()
