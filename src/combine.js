function* combine(...xs) { yield* _combine([], xs) }
function* _combine(head, tails) {
	if (tails.length === 0) yield head
	else for (const x of first(tails))
		yield* _combine([...head, x], tails.slice(1))
}
