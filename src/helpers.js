const last = x => x[x.length-1]
const first = x => x[0]
const head = x => x.slice(0, x.length - 1)
const tail = x => x.slice(1)
const is = a => b => a === b
const N = a => b => new a(b)
const alphabetically = x => x.toString()
const even = x => (x % 2) === 0
const odd = x => !even(x)
const sort = (f, xs) => xs.sort((a, b) => f(a) < f(b) ? -1 : 1)
const evens = x => x.filter((x, i) => even(i))
const odds = x => x.filter((x, i) => odd(i))
