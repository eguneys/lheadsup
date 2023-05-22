import { expect, it } from 'vitest'
import { GameN } from '../src'

it('works', () => {
  let g = GameN.from_fen(`10-20 1 | e0 / e0 / e0`)

  expect(g.dests.fen).toBe('sit-123')

  let events = g.act('sit 1-100')
  expect(g.fen).toBe(`10-20 1 | s100 / e0 / e0`)

  expect(g.spec.fen).toBe(`10-20 1 | s100 / e0 / e0`)
  expect(g.pov(1).fen).toBe(`10-20 1 | s100 / e0 / e0`)
  expect(g.pov(2).fen).toBe(`10-20 3 | e0 / e0 / s100`)
  expect(g.pov(3).fen).toBe(`10-20 2 | e0 / s100 / e0`)

  expect(events.spec.map(_ => _.fen)).toStrictEqual(['S 1 100', 'c 1 s'])
  expect(events.pov(1).map(_ => _.fen)).toStrictEqual(['S 1 100', 'c 1 s'])
  expect(events.pov(2).map(_ => _.fen)).toStrictEqual(['S 3 100', 'c 3 s'])
  expect(events.pov(3).map(_ => _.fen)).toStrictEqual(['S 2 100', 'c 2 s'])

  expect(g.dests.fen).toBe('sit-23 lea-1')

  events = g.act('lea 1')
  expect(g.fen).toBe(`10-20 1 | e0 / e0 / e0`)


  expect(events.spec.map(_ => _.fen)).toStrictEqual(['S 1 0', 'c 1 e'])

  events = g.act('sit 1-100')
  events = g.act('sit 2-200')
  expect(g.fen).toBe(`10-20 1 | w100 / w200 / e0`)

  expect(events.spec.map(_ => _.fen)).toStrictEqual(['S 2 200', 'c 1 w', 'c 2 w'])

  expect(g.dests.fen).toBe(`sit-3 lea-12 deal`)

  events = g.act('deal')
  expect(g.fen).toBe(`10-20 2 | i100 / i200 / e0`)

  expect(events.spec.map(_ => _.fen)).toStrictEqual(['c 1 i', 'c 2 i', 'b 2'])

  expect(g.dests.fen).toBe(`f-12 n-3 share`)
  events = g.act('share 80-220')
  expect(g.fen).toBe(`10-20 2 | w80 / w220 / e0`)

  expect(events.spec.map(_ => _.fen)).toStrictEqual(['S 1 80', 'S 2 220', 'c 1 w', 'c 2 w'])
  expect(g.dests.fen).toBe(`sit-3 lea-12 deal`)

  events = g.act('deal')
  expect(g.dests.fen).toBe(`f-12 n-3 share`)

  events = g.act('next 3-300')
  expect(g.fen).toBe(`10-20 1 | i80 / i220 / n300`)

  expect(events.spec.map(_ => _.fen)).toStrictEqual(['S 3 300', 'c 3 n'])
  expect(g.dests.fen).toBe(`lea-3 f-12 share`)

  events = g.act('lea 3')
  expect(g.fen).toBe(`10-20 1 | i80 / i220 / e0`)
  expect(g.dests.fen).toBe(`f-12 n-3 share`)

  events = g.act('next 3-300')
  events = g.act('share 100-200')
  expect(g.fen).toBe(`10-20 1 | w100 / w200 / w300`)
  expect(g.dests.fen).toBe(`lea-123 deal`)


  events = g.act('deal')
  expect(g.fen).toBe(`10-20 2 | i100 / i200 / i300`)
  expect(g.dests.fen).toBe(`f-123 share`)

  events = g.act('fold 1')
  expect(g.fen).toBe(`10-20 2 | j100 / i200 / i300`)

  expect(g.dests.fen).toBe(`i-1 f-23 share`)

  events = g.act('in 1')
  expect(g.fen).toBe(`10-20 2 | i100 / i200 / i300`)
  expect(g.dests.fen).toBe(`f-123 share`)

  events = g.act('fold 1')
  events = g.act('share 100-200-300')

  expect(g.fen).toBe(`10-20 2 | e0 / w200 / w300`)


  events = g.act('lea 2')
  expect(g.fen).toBe(`10-20 2 | e0 / e0 / s300`)

  events = g.act('sit 1-100')
  expect(g.fen).toBe(`10-20 2 | w100 / e0 / w300`)
})
