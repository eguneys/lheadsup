import { it, expect } from 'vitest'
import { Hand, HandRank, hand_rank, rank_eval } from '../src'
import { HandEvalFunctions } from '../src'

const { high, quad, sflush, flush, straight, pair, pair2, set, full } = HandEvalFunctions

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
const fen_rank_eval = (fen: string) => rank_eval(HandRank.from_fen(fen))

it('evaluate hand to rank', () => {

  expect(fen_hand_rank(`Qd Qh Qc Qs 5d 2c 8s`)).toBe(`quad Q`)
  expect(fen_hand_rank(`Kc Kh Ks Jd Jc 6h 7s`)).toBe(`full K J`)
  expect(fen_hand_rank(`7c 7s 7h Kd Jh 8s 3d`)).toBe(`set 7 K J`)
  expect(fen_hand_rank(`Qh Qd 8s 8d 6c 4s 2h`)).toBe(`pair2 Q 8 6`)
  expect(fen_hand_rank(`8h 9h Th Jh Qh 7d 2c`)).toBe(`sflush Q`)


  expect(fen_hand_rank(`Kc Kh 2s 9h 3d 6c 7d`)).toBe(`pair K 9 7 6`)
  expect(fen_hand_rank(`5c 6d 7s 8h 9h Qc 2d`)).toBe('straight 9')
  expect(fen_hand_rank(`Ah 2h 5h 8h Kh 7s Jc`)).toBe('flush A')

  expect(fen_hand_rank(`Ah 2d 3c 4s 5h 8c Qd`)).toBe('straight 5')
  expect(fen_hand_rank(`Tc Jh Qd Ks Ah 4c 7d`)).toBe('straight A')


})

it('evaluate rank to number', () => {
  const T = 10, J = 11, Q = 12, K = 13, A = 14

  expect(fen_rank_eval('high 7 6 4 3 2')).toBe(high(7, 6, 4, 3, 2))
  expect(fen_rank_eval('high K J 9 3 2')).toBe(high(K, J, 9, 3, 2))
  expect(fen_rank_eval('high A K J 3 2')).toBe(high(A, K, J, 3, 2))
  expect(fen_rank_eval('pair K 9 7 6')).toBe(pair(K, 9, 7, 6))
  expect(fen_rank_eval('pair A J 3 2')).toBe(pair(A, J, 3, 2))
  expect(fen_rank_eval('pair 2 A K J')).toBe(pair(2, A, K, J))
  expect(fen_rank_eval(`pair2 Q 8 6`)).toBe(pair2(Q, 8, 6))
  expect(fen_rank_eval(`pair2 A 3 2`)).toBe(pair2(A, 3, 2))
  expect(fen_rank_eval(`pair2 3 A 9`)).toBe(pair2(3, A, 9))
  expect(fen_rank_eval(`set 2 K J`)).toBe(set(2, K, J))
  expect(fen_rank_eval(`set T K J`)).toBe(set(T, K, J))
  expect(fen_rank_eval(`set A K J`)).toBe(set(A, K, J))
  expect(fen_rank_eval(`full J T`)).toBe(full(J, T))
  expect(fen_rank_eval(`full A 5`)).toBe(full(A, 5))
  expect(fen_rank_eval(`full K 2`)).toBe(full(K, 2))
  expect(fen_rank_eval('straight 9')).toBe(straight(9))
  expect(fen_rank_eval('straight A')).toBe(straight(A))
  expect(fen_rank_eval('straight 5')).toBe(straight(5))
  expect(fen_rank_eval('flush T')).toBe(flush(T))
  expect(fen_rank_eval('flush A')).toBe(flush(A))
  expect(fen_rank_eval('quad T')).toBe(quad(T))
  expect(fen_rank_eval('quad A')).toBe(quad(A))
  expect(fen_rank_eval('sflush 9')).toBe(sflush(9))
  expect(fen_rank_eval('sflush A')).toBe(sflush(A))
  expect(fen_rank_eval('sflush 5')).toBe(sflush(5))
})


