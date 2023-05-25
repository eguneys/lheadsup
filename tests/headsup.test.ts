import { it, expect } from 'vitest'
import { make_deal, Headsup } from '../src'

it('ends', () => {

  let h = Headsup.make()
  h.game_act('deal')
  expect(h.round_dests.fen).toBe('deal-2')
  h.round_act(`deal AhAc2h2c3h4h4c5h5c`)
  expect(h.round_dests.fen).toBe('call-10 raise-10-20 fold')
  h.round_act('raise 10-2990')
  expect(h.round_dests.fen).toBe('raise-2980-2980x2980-0 fold')

  h.round_act('raise 2980-0')
  expect(h.round_dests.fen).toBe('phase')
  h.round_act('phase')
  expect(h.round_dests.fen).toBe('showdown')
  h.round_act('showdown')
  expect(h.round_dests.fen).toBe('share')
  h.round_act('share')
  expect(h.round).toBeUndefined()
  expect(h.game).toBeUndefined()
  expect(h.winner).toBe(1)
})

it('works', () => {
  let h = Headsup.make()
  expect(h.game.fen).toBe(`10-20 1 | w3000 / w3000`)
  expect(h.game_dests.fen).toBe('deal')
  expect(h.round).toBeUndefined()

  h.game_act('deal')
  expect(h.game_dests.fen).toBe('share')
  expect(h.round_dests?.fen).toBe(`deal-2`)

  h.round_act(`deal ${make_deal(2)}`)
  expect(h.round_dests?.fen).toBe(`call-10 raise-10-20 fold`)

  h.round_act('fold')
  h.round_act('phase')
  h.round_act('win')
  h.round_act('share')
  expect(h.round).toBeUndefined()
  expect(h.game.fen).toBe(`10-20 2 | w3010 / w2990`)
  expect(h.game_dests.fen).toBe('deal')
})
