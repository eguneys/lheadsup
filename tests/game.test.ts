import { it, expect } from 'vitest'
import { Hand, Game, Round } from '../src'

let smalls = [10, 20, 30, 50, 100, 150, 200, 400, 800]

it('dist show back', () => {
  let g0 = Game.make()
  //expect(g0.fen).toBe(`10-20 1 / 1000 1000`)

  let h0 = Hand.from_fen(`2c Ts 7h Kd 5d 9c 3s 9h 3h`)
  g0.add_deal(h0)

  g0.deal.round = Round.from_fen(10, 1, `980 980 / show-400 1-200`)
  g0.add_share()
  g0.add_dist()
  expect(g0.fen).toBe(`10-20 2 / 1280 1080`)
  expect(g0.dests).toBe('deal')

})

it('dist show equal', () => {
  let g0 = Game.make()
  //expect(g0.fen).toBe(`10-20 1 / 1000 1000`)

  let h0 = Hand.from_fen(`2c Ts 7h Kd 5d 9c 3s 9h 3h`)
  g0.add_deal(h0)

  g0.deal.round = Round.from_fen(10, 1, `980 980 / show-40`)
  g0.add_share()
  g0.add_dist()
  expect(g0.fen).toBe(`10-20 2 / 1000 1000`)
  expect(g0.dests).toBe('deal')
})

it('dist show', () => {
  let g0 = Game.make()
  //expect(g0.fen).toBe(`10-20 1 / 1000 1000`)

  let h0 = Hand.from_fen(`2c Ts 7h Kd 5d 9c 3s 6h Qh`)
  g0.add_deal(h0)

  g0.deal.round = Round.from_fen(10, 1, `980 980 / show-40`)
  g0.add_share()
  g0.add_dist()
  expect(g0.fen).toBe(`10-20 2 / 980 1020`)
  expect(g0.dests).toBe('deal')
})

it('deal dist win', () => {

  let g0 = Game.make()
  expect(g0.fen).toBe(`10-20 1 / 1000 1000`)
  expect(g0.dests).toBe('deal')

  let h0 = Hand.from_fen(`2c Ts 7h Kd 5d 9c 3s 6h Qh`)
  g0.add_deal(h0)
  expect(g0.deal.hand.fen).toBe(`2c Ts 7h Kd 5d 9c 3s 6h Qh`)
  expect(g0.deal.round.fen).toBe(`1000 1000`)
  expect(g0.fen).toBe(`10-20 1 / 1000 1000 / @`)
  expect(g0.dests).toBeUndefined()

  g0.deal.round = Round.from_fen(10, 1, `980 990 / win-1-30`)
  expect(g0.dests).toBe('share')
  g0.add_share()
  expect(g0.dests).toBe('dist')
  g0.add_dist()
  expect(g0.fen).toBe(`10-20 2 / 1010 990`)
  expect(g0.dests).toBe('deal')

  g0.add_blinds(20)
  expect(g0.fen).toBe(`20-40 2 / 1010 990`)
  expect(g0.dests).toBe('deal')

  let h1 = Hand.from_fen(`Qh 4d 7c 3s 8h 5c 9d Kc Js`)
  g0.add_deal(h1)
  expect(g0.deal.hand.fen).toBe(`Qh 4d 7c 3s 8h 5c 9d Kc Js`)
  expect(g0.deal.round.fen).toBe(`1010 990`)
  expect(g0.deal.round.small_blind).toBe(20)
  expect(g0.dests).toBeUndefined()
})
