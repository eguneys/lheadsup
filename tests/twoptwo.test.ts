import { it, expect } from 'vitest'
import { lookup_cards_str } from '../src'

it('works', () => {

  let r7 = lookup_cards_str(`Ah2h3h4h5h6h7h`)
  let r6 = lookup_cards_str(`2h3h4h5h6h7h`)
  let r5 = lookup_cards_str(`3h4h5h6h7h`)

  expect(r7).toBe(r6)
  expect(r6).toBe(r5)

  r6 = lookup_cards_str(`3c2c4d9hJc5c`)
  r7 = lookup_cards_str(`Ah3c2c4d9hJc5c`)

  expect(r6).not.toBe(0)
  expect(r7).not.toBe(0)
  expect(r6).not.toBe(r7)
  expect(r7).toBeGreaterThan(r6)
})
