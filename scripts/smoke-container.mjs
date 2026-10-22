import assert from 'node:assert/strict'

assert.equal(typeof process.getuid, 'function')
assert.ok(process.getuid() > 0, 'Server must run as a non-root user')

const base = 'http://127.0.0.1:8787'
const deadline = Date.now() + Number(process.env.SMOKE_TIMEOUT_MS ?? 30000)
let response
while (!response) {
  try {
    response = await fetch(`${base}/openapi.json`, { redirect: 'manual', signal: AbortSignal.timeout(1000) })
  } catch {
    assert.ok(Date.now() < deadline, 'Container did not start before the deadline')
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
}
assert.equal(response.status, 200)
assert.match(response.headers.get('content-type') ?? '', /application\/json/)
assert.equal((await response.json()).openapi, '3.0.0')
const userResponse = await fetch(`${base}/users/123`, { redirect: 'manual', signal: AbortSignal.timeout(2000) })
assert.equal(userResponse.status, 200)
assert.match(userResponse.headers.get('content-type') ?? '', /application\/json/)
assert.deepEqual(await userResponse.json(), { id: '123', age: 17, name: 'Ultemica' })
console.log(JSON.stringify({ smoke: 'ok', bun: Bun.version, port: 8787 }))
