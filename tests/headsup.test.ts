import { it, expect } from 'vitest'
import { Round } from '../src/index'

it('allin on flop', () => {

  let buttons_fen = `10-20 8 1`

  let r00 = Round.make(buttons_fen)

  expect(r00.dests).toBeUndefined()

  let r0 = r00.act('phase')
  //expect(r0.fen).toBe(`80 90 / 0-0-20-bb 0-0-10-sb@`)
  let r1 = r0.act('call')
  //expect(r1.fen).toBe(`80 80 / 0-0-20-bb@ 10-10-0-call`)
  let r2 = r1.act('check')
  //expect(r2.fen).toBe(`80 80 / 20-0-0-check 10-10-0-call`)
  let r3 = r2.act('phase')
  //expect(r3.fen).toBe(`80 80 / 0@ 0 / 40`)
  let r4 = r3.act('allin')
  expect(r4.fen).toBe(`0 80 / 0-0-80-allin 0@ / 40`)
  expect(r4.dests.fen).toBe(`allin-80 fold`)

  let r5 = r4.act('allin')
  expect(r5.fen).toBe(`0 0 / 0-0-80-allin 0-80-0-allin / 40`)
  expect(r5.dests.fen).toBe(`phase`)

  let r6 = r5.act('phase')

  expect(r6.fen).toBe(`0 0 / show-200`)
  expect(r6.dests).toBeUndefined()

})

it('allin', () => {

  let buttons_fen = `10-20 8 1`

  let r00 = Round.make(buttons_fen)

  expect(r00.dests).toBeUndefined()

  let r0 = r00.act('phase')
  //expect(r0.fen).toBe(`80 90 / 0-0-20-bb 0-0-10-sb@`)
  //expect(r0.dests.fen).toBe(`call-10 raise-10-60 allin-90 fold`)

  let r1 = r0.act('allin')
  expect(r1.fen).toBe(`80 0 / 0-0-20-bb@ 10-10-80-allin`)
  expect(r1.dests.fen).toBe(`allin-80 fold`)

  let r2 = r1.act('allin')
  expect(r2.fen).toBe(`0 0 / 20-80-0-allin 10-10-80-allin`)
  expect(r2.dests.fen).toBe(`phase`)

  let r3 = r2.act('phase')

  expect(r3.fen).toBe(`0 0 / show-200`)
  expect(r3.dests).toBeUndefined()

})

it('raise', () => {

  let buttons_fen = `10-20 8 1`

  let r00 = Round.make(buttons_fen)

  expect(r00.dests).toBeUndefined()

  let r0 = r00.act('phase')
  //expect(r0.fen).toBe(`80 90 / 0-0-20-bb 0-0-10-sb@`)
  //expect(r0.dests.fen).toBe(`call-10 raise-10-60 allin-90 fold`)

  let r1 = r0.act('raise', 30)
  expect(r1.fen).toBe(`80 50 / 0-0-20-bb@ 10-10-30-raise`)

  expect(r1.dests.fen).toBe(`call-30 raise-30-30 allin-80 fold`)


  let r2 = r1.act('raise', 30)
  expect(r2.fen).toBe(`20 50 / 20-30-30-raise 10-10-30-raise@`)

  expect(r2.dests.fen).toBe(`call-30 allin-50 fold`)

  let r3 = r2.act('call')
  expect(r3.fen).toBe(`20 20 / 20-30-30-raise 50-30-0-call`)

})

it('permissions', () => {

  let buttons_fen = `10-20 8 1`

  let r00 = Round.make(buttons_fen)

  expect(r00.dests).toBeUndefined()

  let r0 = r00.act('phase')
  //expect(r0.fen).toBe(`80 90 / 0-0-20-bb 0-0-10-sb@`)

  expect(r0.dests.fen).toBe(`call-10 raise-10-60 allin-90 fold`)

  let r1 = r0.act('call')
  //expect(r1.fen).toBe(`80 80 / 0-0-20-bb@ 10-10-0-call`)
  expect(r1.dests.fen).toBe(`check raise-0-60 allin-80 fold`)


  let r2 = r1.act('check')
  //expect(r2.fen).toBe(`80 80 / 20-0-0-check 10-10-0-call`)
  expect(r2.dests.fen).toBe(`phase`)

  let r3 = r2.act('phase')
  //expect(r3.fen).toBe(`80 80 / 0@ 0 / 40`)

  expect(r3.dests.fen).toBe(`check raise-0-60 allin-80 fold`)
})


it('call check check check', () => {


  let buttons_fen = `10-20 8 1`

  let r00 = Round.make(buttons_fen)
  expect(r00.fen).toBe(`100 100`)

  let r0 = r00.act('phase')
  expect(r0.fen).toBe(`80 90 / 0-0-20-bb 0-0-10-sb@`)

  let r1 = r0.act('call')
  expect(r1.fen).toBe(`80 80 / 0-0-20-bb@ 10-10-0-call`)

  let r2 = r0.act('check')
  expect(r2.fen).toBe(`80 80 / 20-0-0-check 10-10-0-call`)

  let r3 = r2.act('phase')
  expect(r3.fen).toBe(`80 80 / 0@ 0 / 40`)

  let r4 = r3.act('check')
  expect(r4.fen).toBe(`80 80 / 0-0-0-check 0@ / 40`)

  let r5 = r4.act('check')
  expect(r5.fen).toBe(`80 80 / 0-0-0-check 0-0-0-check / 40`)

  let r6 = r5.act('phase')
  expect(r6.fen).toBe(`80 80 / 0@ 0 / 40-0`)

  let r7 = r6.act('check')
  expect(r7.fen).toBe(`80 80 / 0-0-0-check 0@ / 40-0`)

  let r8 = r7.act('check')
  expect(r8.fen).toBe(`80 80 / 0-0-0-check 0-0-0-check / 40-0`)

  let r9 = r8.act('phase')
  expect(r9.fen).toBe(`80 80 / 0@ 0 / 40-0-0`)

  let r10 = r9.act('check')
  expect(r10.fen).toBe(`80 80 / 0-0-0-check 0@ / 40-0-0`)

  let r11 = r10.act('check')
  expect(r11.fen).toBe(`80 80 / 0-0-0-check 0-0-0-check / 40-0-0`)

  let r12 = r11.act('phase')
  expect(r12.fen).toBe(`80 80 / show-40`)

})
