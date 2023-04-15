import { it, expect } from 'vitest'
import { Round } from '../src/index'

it('works', () => {


  let buttons_fen = `10-20 8 1`

  let r00 = Round.make(buttons_fen)
  expect(r00.fen).toBe(`100 100`)

  let r0 = r00.act('phase')
  expect(r0.fen).toBe(`80 90 / 20-bb 10-sb@`)

  let r1 = r0.act('call')
  expect(r1.fen).toBe(`80 80 / 20-bb@ 20-call`)

  let r2 = r0.act('check')
  expect(r2.fen).toBe(`80 80 / 20-check 20-call`)

  let r3 = r2.act('phase')
  expect(r3.fen).toBe(`80 80 / 0@ 0 / 40`)

  let r4 = r3.act('check')
  expect(r4.fen).toBe(`80 80 / 0-check 0@ / 40`)

  let r5 = r4.act('check')
  expect(r5.fen).toBe(`80 80 / 0-check 0-check / 40`)

  let r6 = r5.act('phase')
  expect(r6.fen).toBe(`80 80 / 0@ 0 / 40 0`)

  let r7 = r6.act('check')
  expect(r7.fen).toBe(`80 80 / 0-check 0@ / 40 0`)

  let r8 = r7.act('check')
  expect(r8.fen).toBe(`80 80 / 0-check 0-check / 40 0`)

  let r9 = r8.act('phase')
  expect(r9.fen).toBe(`80 80 / 0@ 0 / 40 0 0`)

  let r10 = r9.act('check')
  expect(r10.fen).toBe(`80 80 / 0-check 0@ / 40 0 0`)

  let r11 = r10.act('check')
  expect(r11.fen).toBe(`80 80 / 0-check 0-check / 40 0 0`)

  let r12 = r11.act('phase')
  expect(r12.fen).toBe(`80 80 / 40`)

})
