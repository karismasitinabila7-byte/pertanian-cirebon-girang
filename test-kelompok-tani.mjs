import { SignJWT } from 'jose'

async function test() {
  const secretKey = 'super-secret-key-that-should-be-in-env-12345'
  const encodedKey = new TextEncoder().encode(secretKey)
  
  const token = await new SignJWT({ userId: '1', username: 'admin', role: 'ADMIN' })
    .setProtectedHeader({ alg: 'HS256' })
    .sign(encodedKey)

  console.log('--- GET /api/kelompok-tani ---')
  let res = await fetch('http://localhost:3000/api/kelompok-tani', {
    headers: { Cookie: `session=${token}` }
  })
  let data = await res.json()
  console.log(res.status, data)
  
  if (data.data && data.data.length > 0) {
    const id = data.data[0].id
    console.log(`\n--- GET /api/kelompok-tani/${id} ---`)
    res = await fetch(`http://localhost:3000/api/kelompok-tani/${id}`, {
      headers: { Cookie: `session=${token}` }
    })
    console.log(res.status, await res.json())
  }
}

test()
