import { it, expect } from 'vitest'
import { RoundN } from '../src'

it('six way uneven fold is excluded from pots', () => {
  let r = RoundN.from_fen('10-20 1 | a0 7h8h / a0 ThKd allin-0-0-12 / @112 Jc3s check-0 $ 176-23side 300-231 !fJd3cQh9s7$')

  expect(r.dests.fen).toBe('call-12 fold')
  r.act('fold')

  expect(r.fen).toBe('10-20 1 | a0 7h8h / a0 ThKd allin-0-0-12 / f112 Jc3s fold-0 $ 176-23side 300-231 !fJd3cQh9s7$')

  expect(r.dests.fen).toBe('phase')

  r.act('phase')

  expect(r.fen).toBe('10-20 1 | s0 7h8h / s0 ThKd / f112 Jc3s $ 188-2side 300-21 !fJd3cQh9s7$')

})

it('six way uneven', () => {
  let r = RoundN.from_fen('10-20 1 | a0 7h8h / p12 3c5s / f112 5hJh fold-0 $ 176-2side 300-21 !f9c3hTd8s5d')

  expect(r.dests.fen).toBe('phase')

  r.act('phase')
  expect(r.fen).toBe('10-20 1 | s0 7h8h / s12 3c5s / f112 5hJh $ 176-2side 300-21 !f9c3hTd8s5d')
})

it('six way', () => {

  let r = RoundN.from_fen(`10-20 1 | d300 / d300 / d300 / d300 / d300 / d300 $!`)
  let acts = [
    'deal 8c2hAdTd6c6h2s6dKd4sTs7c5hQcAsQhQd',
    'raise 20-36',
    'raise 56-103.2',
    'call 159',
    'call 159',
    'raise 149-141',
    'raise 280-0',
    'fold',
    'phase',
    'phase'
  ]


  //acts.forEach(act => { r.act(act); console.log(act, r.fen) })

  r = RoundN.from_fen(`10-20 1 | i141 8c2h call-0-159 / a0 AdTd allin-10-149-141 / a0 6c6h allin-20-280-0 / @244 2s6d raise-0-20-36 / i141 Kd4s raise-0-56-103 / i141 Ts7c call-0-159 $!p5hQcAsQhQd`)
  r.act('fold')

  expect(r.fen).toBe(`10-20 1 | i141 8c2h call-0-159 / a0 AdTd allin-10-149-141 / a0 6c6h allin-20-280-0 / f244 2s6d fold-56 / @141 Kd4s raise-0-56-103 / i141 Ts7c call-0-159 $!p5hQcAsQhQd`)
})
