import { it, expect } from 'vitest'
import { HandRank, hand_rank, rank_eval } from '../src'

it.skip('pov hand showdown', () => {

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
