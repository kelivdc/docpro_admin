import { auth } from '../src/lib/auth.ts'

async function main() {
  const adminEmail = 'admin@docpro.id'
  const adminPassword = 'AdminDocPro2026!'
  const adminName = 'DocPro Admin'

  try {
    const result = await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: adminPassword,
        name: adminName,
      },
    })
    console.log(`Created admin user: ${adminEmail}`)
    console.log(`Password: ${adminPassword}`)
    console.log('Result:', JSON.stringify(result, null, 2))
  } catch (e) {
    console.error('ERROR:', e instanceof Error ? e.message : e)
    if (e && typeof e === 'object' && 'cause' in e) {
      console.error('CAUSE:', e.cause)
    }
    if (e && typeof e === 'object' && 'stack' in e) {
      console.error(e.stack)
    }
  }
}

main()
