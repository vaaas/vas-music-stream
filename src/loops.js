function find(f, xs) { for (const x of xs) if (f(x)) return x ; return null }
function find_index(f, xs) { let i = 0 ; for (const x of xs) if (f(x)) return i ; return null }
function some(f, xs) { for (const x of xs) if (f(x)) return true ; return false }
function every(f, xs) { for (const x of xs) if (!f(x)) return false ; return true }
