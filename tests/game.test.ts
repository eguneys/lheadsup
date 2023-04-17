import { it, expect } from 'vitest'
import { Game, Round } from '../src'

let smalls = [10, 20, 30, 50, 100, 150, 200, 400, 800]

it('dist show', () => {
  let g0 = Game.make()
  g0.act('deal')

  let rd = Round.from_fen(10, 1, `980 980 / show-40`)
  g0.act('dist', rd)
})

it('deal dist win', () => {

  let g0 = Game.make()
  expect(g0.fen).toBe(`10-20 1 / 1000 1000`)
  expect(g0.dests).toBe('deal')

  let r0 = g0.act('deal')
  expect(r0.fen).toBe(`1000 1000`)
  expect(g0.fen).toBe(`10-20 1 / 1000 1000 / @`)
  expect(g0.dests).toBe('dist')

  let rd = Round.from_fen(10, 1, `980 990 / win-1-30`)
  g0.act('dist', rd)
  expect(g0.fen).toBe(`10-20 2 / 1010 990`)
  expect(g0.dests).toBe('deal')

  g0.blinds(20)
  expect(g0.fen).toBe(`20-40 2 / 1010 990`)

  let r20 = g0.act('deal')
  expect(r20.fen).toBe(`1010 990`)
  expect(r20.small_blind).toBe(20)
  expect(g0.dests).toBe('dist')

})
