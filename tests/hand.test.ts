import { it, expect } from 'vitest'
import { Hand, hand_rank, rank_eval } from '../src'

let hands = [
  `2c Ts 7h Kd 5d 9c 3s 6h Qh`,
  `Jc 6c 5s 9h 8d Qs 2h 7s Tc`,
  `8h 4s 6c Qh 2d 7d 5c Th Js`,
  `9d 7c 5s 4h 6d 3c Kc Qd Jh`,
  `Qs 3h 9c 5d 8c 4s 7d Jc Th`,
  `Kd 2h 7c 9s 4c 8s Qd Tc 5h`,
  `6c 8h Ts 7d 9h 4d 2s Jh Qc`,
  `5s 9d 8d 6h Ks Qc Jd 2c 7s`,
  `Jc 3d Ts 2h 8c 6s Kd 9h 7d`,
  `Qh 4d 7c 3s 8h 5c 9d Kc Js`
]

const fen_hand_rank = (fen: string) => hand_rank(fen.split(' ')).fen

it('evaluate hand to rank', () => {

  expect(fen_hand_rank(`Qd Qh Qc Qs 5d 2c 8s`)).toBe(`quad Q`)


  expect(fen_hand_rank(`Kc Kh 2s 9h 3d 6c 7d`)).toBe(`pair K 9 7 6`)
  expect(fen_hand_rank(`Qh Qd 8s 8d 6c 4s 2h`)).toBe(`2pair Q 8 6`)
  expect(fen_hand_rank(`7c 7s 7h Kd Jh 8s 3d`)).toBe(`set 7 K J`)
  expect(fen_hand_rank(`5c 6d 7s 8h 9h Qc 2d`)).toBe('straight 9')
  expect(fen_hand_rank(`Ah 2h 5h 8h Kh 7s Jc`)).toBe('flush A')
})

it.only('evaluate rank to number', () => {
  const T = 10, J = 11, Q = 12, K = 13, A = 14

  const high = (a, b, c, d, e) => 0 * Math.pow(2, 5) +
    a * Math.pow(2, 4) + 
    b * Math.pow(2, 3) + 
    c * Math.pow(2, 2) + 
    d * Math.pow(2, 1) + 
    e * Math.pow(2, 0)
  const pair = (a, b, c, d) => 1 * Math.pow(2, 5) +
    a * Math.pow(2, 4) + 
    b * Math.pow(2, 3) + 
    c * Math.pow(2, 2) + 
    d * Math.pow(2, 1)
  const pair2 = (a, b, c) => 2 * Math.pow(2, 5) +
    a * Math.pow(2, 4) + 
    b * Math.pow(2, 3) + 
    c * Math.pow(2, 2)
  const set = (a, b, c) => 3 * Math.pow(2, 5) +
    a * Math.pow(2, 4) + 
    b * Math.pow(2, 3) + 
    c * Math.pow(2, 2)
  const full = (a, b) => 4 * Math.pow(2, 5) +
    a * Math.pow(2, 4) + 
    b * Math.pow(2, 3)
  const straight = (a) => 5 * Math.pow(2, 5) + a * Math.pow(2, 4)
  const flush = (a) => 6 * Math.pow(2, 5) + a * Math.pow(2, 4)
  const quad = (a) => 7 * Math.pow(2, 5) + a * Math.pow(2, 4)
  const sflush = (a) => 8 * Math.pow(2, 5) + a * Math.pow(2, 4)

  expect(rank_eval('high 7 6 4 2 1')).toBe(high(7, 6, 4, 2, 1))
  expect(rank_eval('high K J 9 2 1')).toBe(high(K, J, 9, 2, 1))
  expect(rank_eval('high A K J 3 2')).toBe(high(A, K, J, 3, 2))
  expect(rank_eval('pair K 9 7 6')).toBe(pair(K, 9, 7, 6))
  expect(rank_eval('pair A J 3 2')).toBe(pair(A, J, 3, 2))
  expect(rank_eval('pair 2 A K J')).toBe(pair(2, A, K, J))
  expect(rank_eval(`2pair Q 8 6`)).toBe(pair2(Q, 8, 6))
  expect(rank_eval(`2pair A 3 2`)).toBe(pair2(A, 3, 2))
  expect(rank_eval(`2pair 3 A 9`)).toBe(pair2(3, A, 9))
  expect(rank_eval(`set 2 K J`)).toBe(set(2, K, J))
  expect(rank_eval(`set T K J`)).toBe(set(T, K, J))
  expect(rank_eval(`set A K J`)).toBe(set(A, K, J))
  expect(rank_eval(`full J T`)).toBe(full(J, T))
  expect(rank_eval(`full A 5`)).toBe(full(A, 5))
  expect(rank_eval(`full K 2`)).toBe(full(K, 2))
  expect(rank_eval('straight 9')).toBe(straight(9))
  expect(rank_eval('straight A')).toBe(straight(A))
  expect(rank_eval('straight 5')).toBe(straight(5))
  expect(rank_eval('flush T')).toBe(flush(T))
  expect(rank_eval('flush A')).toBe(flush(A))
  expect(rank_eval('quad T')).toBe(quad(T))
  expect(rank_eval('quad A')).toBe(quad(A))
  expect(rank_eval('sflush 9')).toBe(sflush(9))
  expect(rank_eval('sflush A')).toBe(sflush(A))
  expect(rank_eval('sflush 5')).toBe(sflush(5))
})

it.skip('works', () => {
  let hand = Hand.from_fen(`2c Ts 7h Kd 5d 9c 3s 6h Qh`)
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
