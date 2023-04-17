import { it, expect } from 'vitest'
import { Hand, HandRank, hand_rank, rank_eval } from '../src'


it('works', () => {
  let hand = Hand.from_fen(`2c Ts 7h Kd 5d 9c 3s 6h Qh`)
  expect(hand.fen).toBe(`2c Ts 7h Kd 5d 9c 3s 6h Qh`)
  expect(hand.hand(1).join(' ')).toBe(`2c Ts 7h Kd 5d 9c 3s`)
  expect(hand.hand(2).join(' ')).toBe(`2c Ts 7h Kd 5d 6h Qh`)

  expect(hand.pov(1).fen).toBe(`9c 3s`)
  expect(hand.pov(2).fen).toBe(`6h Qh`)


  hand.reveal('flop')
  expect(hand.pov(1).fen).toBe(`9c 3s 2c Ts 7h`)
  expect(hand.pov(2).fen).toBe(`6h Qh 2c Ts 7h`)

  hand.reveal('turn')
  expect(hand.pov(1).fen).toBe(`9c 3s 2c Ts 7h Kd`)
  expect(hand.pov(2).fen).toBe(`6h Qh 2c Ts 7h Kd`)

  hand.reveal('river')
  expect(hand.pov(1).fen).toBe(`9c 3s 2c Ts 7h Kd 5d`)
  expect(hand.pov(2).fen).toBe(`6h Qh 2c Ts 7h Kd 5d`)

  hand.reveal('show')
  expect(hand.pov(1).fen).toBe(`9c 3s 2c Ts 7h Kd 5d 6h Qh`)
  expect(hand.pov(2).fen).toBe(`6h Qh 2c Ts 7h Kd 5d 9c 3s`)
})
