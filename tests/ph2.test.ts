import { it, expect } from 'vitest'
import { lookup_cards_str_fast } from '../src'

it('works', () => {

  let r0 = lookup_cards_str_fast(`Ah7cTc4d9hJc6c`)
  let r1 = lookup_cards_str_fast(`Ah7cTc4d9hJc5c`)

  expect(r0).toBe(r1);

  ([
  `AhKhQhJhTh9h8h`,
  `AsKsQsJsTs9s8s`,
  `AdKdQdJdTd9d8d`,
  `AcKcQcJcTc9c8c`,
  ]).forEach(rf => {
    expect(lookup_cards_str_fast(rf)).toBe(1)
  })


  let r7 = lookup_cards_str_fast(`Ah2h3h4h5h6h7h`)
  let r6 = lookup_cards_str_fast(`2h3h4h5h6h7h`)
  let r5 = lookup_cards_str_fast(`3h4h5h6h7h`)

  expect(r7).toBe(r6)
  expect(r6).toBe(r5)

  r6 = lookup_cards_str_fast(`3c2c4d9hJc5c`)
  r7 = lookup_cards_str_fast(`Ah3c2c4d9hJc5c`)

  expect(r6).not.toBe(0)
  expect(r7).not.toBe(0)
  expect(r6).not.toBe(r7)
  expect(r7).toBeLessThan(r6)
})
