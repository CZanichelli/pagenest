// Admin test for Ordana's widget-host-billing (TEST MODE, "livemode": false).
// Runs locally with the server key from .env.local; never deployed.
//   npm run ordana:billing -- activate alice
//   npm run ordana:billing -- status alice bob carol
import { callOrdanaBilling, type BillingAction } from '../api/ordana/billing.ts'

const USERS = ['alice', 'bob', 'carol']
const [action, ...names] = process.argv.slice(2)
const { ORDANA_SERVER_KEY_ID, ORDANA_SERVER_SECRET } = process.env

if (!['activate', 'deactivate', 'status'].includes(action) || names.some((n) => !USERS.includes(n))) {
  console.error(`usage: npm run ordana:billing -- <activate|deactivate|status> [${USERS.join('|')} ...]`)
  process.exit(1)
}
if (!ORDANA_SERVER_KEY_ID || !ORDANA_SERVER_SECRET) {
  console.error('ORDANA_SERVER_KEY_ID / ORDANA_SERVER_SECRET missing (add them to .env.local)')
  process.exit(1)
}

for (const name of names.length ? names : USERS) {
  const reply = await callOrdanaBilling(action as BillingAction, name, ORDANA_SERVER_KEY_ID, ORDANA_SERVER_SECRET)
  console.log(`${action} ${name} -> HTTP ${reply.status}`)
  console.log(JSON.stringify(reply.data, null, 2))
}
