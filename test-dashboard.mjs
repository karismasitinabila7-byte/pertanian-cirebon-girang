import { SignJWT } from 'jose'

async function test() {
  const secretKey = 'super-secret-key-that-should-be-in-env-12345'
  const encodedKey = new TextEncoder().encode(secretKey)
  
  const token = await new SignJWT({ userId: '1', username: 'admin', role: 'ADMIN' })
    .setProtectedHeader({ alg: 'HS256' })
    .sign(encodedKey)

  const res = await fetch('http://localhost:3000/admin', {
    headers: {
      Cookie: `session=${token}`
    }
  })
  
  console.log('Status:', res.status)
}

test()
