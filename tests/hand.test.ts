import { it, expect } from 'vitest'
import { Hand, HandPov, HandRank, hand_rank, rank_eval } from '../src'


it('works', () => {
  let hand = Hand.from_fen(`2c Ts 7h Kd 5d 9c 3s 6h Qh`)
  expect(hand.fen).toBe(`2c Ts 7h Kd 5d 9c 3s 6h Qh`)
  expect(hand.hand(1).join(' ')).toBe(`2c Ts 7h Kd 5d 9c 3s`)
  expect(hand.hand(2).join(' ')).toBe(`2c Ts 7h Kd 5d 6h Qh`)
  expect(hand.hand_rank(1).fen).toBe(`high K T 9 7 5`)
  expect(hand.hand_rank(2).fen).toBe(`high K Q T 7 6`)

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
  expect(hand.pov(1).my_hand_rank.fen).toBe(`high K T 9 7 5`)
  expect(hand.pov(1).op_hand_rank.fen).toBe(`high K Q T 7 6`)
  expect(hand.pov(2).fen).toBe(`6h Qh 2c Ts 7h Kd 5d 9c 3s`) 
  expect(hand.pov(2).my_hand_rank.fen).toBe(`high K Q T 7 6`)
  expect(hand.pov(2).op_hand_rank.fen).toBe(`high K T 9 7 5`)
})


it('pov from fen', () => {

  [
    '9c 3s',
    `2c Ts 7h Kd 5d 9c 3s 6h Qh`,
    `2c Ts 7h Kd 5d 9c 3s`,
    `2c Ts 7h Kd 5d 9c`,
    `2c Ts 7h Kd 5d`,
  ]
  .forEach(fen =>
           expect(HandPov.from_fen(fen).fen).toBe(fen))
})

it('pov hand showdown', () => {

  let edge_cases = [
    [`Ah 2h 5h 8h Kh 7h Jc 3s 2s`,`flush A K 8 7 5`, `h s h h h h s s s`],
    [`4h 2s Ah 8h Kh 7h 5h Jc 6h`,`flush A K 8 7 5`, `s s h h h h s s h`],
    [`4h 2s Ah 8h Kh 7h 5h Jc 6s`,`flush A K 8 7 5`, `s s h h h h h s s`],
  ]


  let hands = [
    ...edge_cases,
    [`9c 3s 2c Ts 7h Kd 5d 6h Qh`, `high K T 9 7 5`, `s s s k k h s k k`],
    [`Qh Qd 8s 8d 6c 6s 2h 2s 3s`,`pair2 Q 8 6`, `h h h h k s s s s`],
    [`Qd Qh Qc Qs 5d 2c 8s 3s 2s`,`quad Q`, `h h h h s s s s s`],
    [`Kc Kh Ks Jd Jc 6h 7s 2s 3s`,`full K J`, `h h h h h s s s s`],
    [`7c 7s 7h Kd Jh 8s 3d 3s 2s`,`set 7 K J`, `h h h k k s s s s`],
    [`Qh Qd 8s 8d 6c 4s 2h 2s 3s`,`pair2 Q 8 6`, `h h h h k s s s s`],
    [`8h 9h Th Jh Qh 7d 2c 3s 2s`,`sflush Q`, `h h h h h s s s s`],
    [`Kc Kh 2s 9h 3d 6c 7d 2s 3s`,`pair K 9 7 6`, `s s h k h s s h h`],
    [`5c 6d 7s 8h 9h Qc 2d 3s 2s`,`straight 9`, `h h h h h s s s s`],
    [`Ah 2h 5h 8h Kh 7s Jc 3s 2s`,`flush A K 8 5 2`, `h h h h h s s s s`],
    [`Ah 2d 3c 4s 5h 8c Qd 3s 2s`,`straight 5`, `h h h h h s s s s`],
    [`Tc Jh Qd Ks Ah 4c 7d 2s 3s`,`straight A`, `h h h h h s s s s`],
  ]

  hands.forEach(hand => {
    let h1 = HandPov.from_fen(hand[0])
    expect(h1.my_hand_rank.fen).toBe(hand[1])
    expect(h1.highlight.fen).toBe(hand[2])
  })

})
