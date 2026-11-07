// Quick checks for the shift rules. Run with: npm run test:shifts
import assert from 'node:assert/strict'
import { computeWorked, rolesForService, todayInEastern } from '../lib/shift-eligibility'

let passed = 0
function check(name: string, fn: () => void) {
  fn()
  passed++
  console.log(`ok - ${name}`)
}

check('hours are computed from clock in and out (9:00 to 13:30 = 4.5 hours)', () => {
  const r = computeWorked('2026-11-06T13:00:00.000Z', '2026-11-06T17:30:00.000Z')
  assert.equal(r.minutes, 270)
  assert.equal(r.hours, 4.5)
})

check('hours are rounded to two decimals (20 minutes = 0.33)', () => {
  const r = computeWorked('2026-11-06T13:00:00.000Z', '2026-11-06T13:20:00.000Z')
  assert.equal(r.minutes, 20)
  assert.equal(r.hours, 0.33)
})

check('culinary service offers Culinary and Housekeeping roles', () => {
  assert.deepEqual(rolesForService('culinary'), ['Culinary / Chef', 'Housekeeping Staff'])
})

check('care service offers Care Companion and Nanny roles', () => {
  assert.deepEqual(rolesForService('care'), ['Care Companion (Adult/Senior)', 'Nanny / Childcare Specialist'])
})

check('missing service returns no roles', () => {
  assert.deepEqual(rolesForService(null), [])
  assert.deepEqual(rolesForService(''), [])
})

check('today in Eastern time is a YYYY-MM-DD date', () => {
  assert.match(todayInEastern(), /^\d{4}-\d{2}-\d{2}$/)
  assert.match(todayInEastern(1), /^\d{4}-\d{2}-\d{2}$/)
})

console.log(`\n${passed} shift rule checks passed.`)
