import { it, expect } from 'vitest'
import { RoundN } from '../src'

it('everyone is allin', () => {

  let events

  let r = RoundN.from_fen(`10-20 1 | @380 AhAc call-0-20 / i160 2h2c call-0-10 / i280 3h3c raise-20-0-80 $!p4h5h6h7h8h`)
  expect(r.dests.fen).toBe(`call-80 raise-80-80 fold`)

  r.act(`raise 80-300`)
  r.act(`raise 160-0`)
  expect(r.fen).toBe(`10-20 1 | a0 AhAc allin-20-80-300 / a0 2h2c allin-10-160-0 / @280 3h3c raise-20-0-80 $!p4h5h6h7h8h`)
  expect(r.dests.fen).toBe(`raise-300-300 fold`)

  r.act(`raise 280-0`)
  expect(r.fen).toBe(`10-20 1 | a0 AhAc allin-20-80-300 / a0 2h2c allin-10-160-0 / a0 3h3c allin-100-280-0 $!p4h5h6h7h8h`)

  expect(r.dests.fen).toBe(`phase`)

  events = r.act(`phase`)

  // 400 170 380
  expect(r.fen).toBe(`10-20 1 | s0 AhAc / s0 2h2c / s0 3h3c $ 0-side 510-123 420-13 20-1 !p4h5h6h7h8h`)


  expect(events.pov(1).map(_ => _.fen)).toStrictEqual(['p 1 400', 'p 2 170', 'p 3 380', 'v 2 170', 'v 3 210', 'v 1 20', 'f 4h5h6h', 'h 2 2h2c', 'h 3 3h3c', 't 7h', 'r 8h', 'c 2 s', 'a 2', 'c 3 s', 'a 3', 'c 1 s', 'a 1'])

})

it('normal allin', () => {

  let r = RoundN.from_fen(`10-20 1 | @380 AhAc call-0-20 / i160 2h2c call-0-10 / i280 3h3c raise-20-0-80 $!4h5h6h7h8h`)
  expect(r.dests.fen).toBe(`call-80 raise-80-80 fold`)

  r.act(`raise 80-300`)
  expect(r.fen).toBe(`10-20 1 | a0 AhAc allin-20-80-300 / @160 2h2c call-0-10 / i280 3h3c raise-20-0-80 $!4h5h6h7h8h`)
  expect(r.dests.fen).toBe(`raise-390-300 fold`)

})


it('cant post small blind', () => {
  let r = RoundN.from_fen(`10-20 3 | d10 / d180 / d280 $!`)

  r.act('deal AhAc2h2c3h3c4h5h6h7h8h')

  expect(r.fen).toBe(`10-20 3 | a0 AhAc allin-0-0-10 / i160 2h2c bb-0-0-20 / @280 3h3c $!p4h5h6h7h8h`)


})

it('cant post big blind', () => {
  let r = RoundN.from_fen(`10-20 2 | d20 / d180 / d280 $!`)

  r.act('deal AhAc2h2c3h3c4h5h6h7h8h')

  expect(r.fen).toBe(`10-20 2 | a0 AhAc allin-0-0-20 / @180 2h2c / i270 3h3c sb-0-0-10 $!p4h5h6h7h8h`)

})

it('cant raise allin', () => {

  let r = RoundN.from_fen(`10-20 1 | @150 AhAc call-0-20 / i160 2h2c call-0-10 / i280 3h3c raise-20-0-80 $!4h5h6h7h8h`)
  expect(r.dests.fen).toBe(`call-80 raise-80-80 fold`)

  r.act(`raise 80-70`)
  expect(r.fen).toBe(`10-20 1 | a0 AhAc allin-20-80-70 / @160 2h2c call-0-10 / i280 3h3c raise-20-0-80 $!4h5h6h7h8h`)


  r = RoundN.from_fen(`10-20 1 | @160 AhAc call-0-20 / i160 2h2c call-0-10 / i280 3h3c raise-20-0-80 $!4h5h6h7h8h`)
  expect(r.dests.fen).toBe(`call-80 raise-80-80 fold`)

  r.act(`raise 80-80`)
  expect(r.fen).toBe(`10-20 1 | a0 AhAc allin-20-80-80 / @160 2h2c call-0-10 / i280 3h3c raise-20-0-80 $!4h5h6h7h8h`)
})

it('cant call allin', () => {
  let r = RoundN.from_fen(`10-20 1 | @80 AhAc call-0-20 / i160 2h2c call-0-10 / i280 3h3c raise-20-0-80 $!p4h5h6h7h8h`)
  expect(r.dests.fen).toBe(`raise-80-80 fold`)

  r.act(`raise 80-0`)
  expect(r.fen).toBe(`10-20 1 | a0 AhAc allin-20-80-0 / @160 2h2c call-0-10 / i280 3h3c raise-20-0-80 $!p4h5h6h7h8h`)
})


it('min raise', () => {
  let r = RoundN.from_fen(`10-20 1 | i60 AhAc raise-0-20-30 / @160 2h2c sb-0-10 / i280 3h3c bb-0-0-20 $!4h5h6h7h8h`)
  expect(r.dests.fen).toBe(`call-40 raise-40-30 fold`)

  r = RoundN.from_fen(`10-20 1 | i60 AhAc raise-0-20-30 / i160 2h2c raise-10-40-50 / @280 3h3c bb-0-0-20 $!4h5h6h7h8h`)
  expect(r.dests.fen).toBe(`call-80 raise-80-50 fold`)
})

it('bb raise', () => {
  let r = RoundN.from_fen(`10-20 1 | i60 AhAc raise-0-20-20 / i160 2h2c call-10-30 / @280 3h3c bb-0-0-20 $!4h5h6h7h8h`)
  //expect(r.dests.fen).toBe(`call-20 raise-20-20 fold`)
  let events = r.act('raise 20-20')

  expect(r.fen).toBe(`10-20 1 | @60 AhAc raise-0-20-20 / i160 2h2c call-10-30 / i240 3h3c raise-20-20-20 $!4h5h6h7h8h`)
  expect(r.dests.fen).toBe(`call-20 raise-20-20 fold`)
  events = r.act('call 20')
  expect(r.dests.fen).toBe(`call-20 raise-20-20 fold`)
  events = r.act('call 20')

  expect(r.fen).toBe(`10-20 1 | p40 AhAc call-40-20 / p140 2h2c call-40-20 / p240 3h3c raise-20-20-20 $!4h5h6h7h8h`)
  expect(r.dests.fen).toBe('phase')

})

it('bb call', () => {

  let r = RoundN.from_fen(`10-20 1 | d100 / d200 / d300 $!`)
  let events = r.act('deal AhAc2h2c3h3c4h5h6h7h8h')
  //expect(r.dests.fen).toBe(`call-20 raise-20-20 fold`)

  events = r.act('raise 20-20')

  expect(r.fen).toBe(`10-20 1 | i60 AhAc raise-0-20-20 / @190 2h2c sb-0-0-10 / i280 3h3c bb-0-0-20 $!p4h5h6h7h8h`)

  expect(events.pov(1).map(_ => _.fen)).toStrictEqual(['a 1 raise-0-20-20', 's 1 40', 'c 1 i', 'c 2 @'])

  expect(r.dests.fen).toBe(`call-30 raise-30-20 fold`)
  events = r.act('call 30')
  expect(r.fen).toBe(`10-20 1 | i60 AhAc raise-0-20-20 / i160 2h2c call-10-30 / @280 3h3c bb-0-0-20 $!p4h5h6h7h8h`)
  expect(r.dests.fen).toBe(`call-20 raise-20-20 fold`)

  events = r.act('call 20')

  expect(r.fen).toBe(`10-20 1 | p60 AhAc raise-0-20-20 / p160 2h2c call-10-30 / p260 3h3c call-20-20 $!p4h5h6h7h8h`)

})

it('three way', () => {

  let r = RoundN.from_fen(`10-20 1 | d100 / d200 / d300 $!`)

  expect(r.pov(1).fen).toBe(`10-20 1 | d100 / d200 / d300 $!`)
  expect(r.pov(2).fen).toBe(`10-20 3 | d200 / d300 / d100 $!`)
  expect(r.pov(3).fen).toBe(`10-20 2 | d300 / d100 / d200 $!`)

  expect(r.dests.fen).toBe('deal')

  let events = r.act('deal AhAc2h2c3h3c4h5h6h7h8h')
  expect(r.fen).toBe(`10-20 1 | @100 AhAc / i190 2h2c sb-0-0-10 / i280 3h3c bb-0-0-20 $!p4h5h6h7h8h`)

  expect(r.pov(1).fen).toBe(`10-20 1 | @100 AhAc / i190 sb-0-0-10 / i280 bb-0-0-20 $!`)
  expect(r.pov(2).fen).toBe(`10-20 3 | i190 2h2c sb-0-0-10 / i280 bb-0-0-20 / @100 $!`)
  expect(r.pov(3).fen).toBe(`10-20 2 | i280 3h3c bb-0-0-20 / @100 / i190 sb-0-0-10 $!`)

  expect(events.pov(1).map(_ => _.fen)).toStrictEqual(['c 1 @', 'c 2 i', 'c 3 i', 'a 2 sb-0-0-10','s 2 10', 'a 3 bb-0-0-20', 's 3 20', 'h 1 AhAc'])
  expect(events.pov(2).map(_ => _.fen)).toStrictEqual(['c 3 @', 'c 1 i', 'c 2 i', 'a 1 sb-0-0-10', 's 1 10', 'a 2 bb-0-0-20', 's 2 20', 'h 1 2h2c'])
  expect(events.pov(3).map(_ => _.fen)).toStrictEqual(['c 2 @', 'c 3 i', 'c 1 i', 'a 3 sb-0-0-10', 's 3 10', 'a 1 bb-0-0-20', 's 1 20', 'h 1 3h3c'])

  expect(r.dests.fen).toBe(`call-20 raise-20-20 fold`)

  events = r.act('call 20')
  expect(r.fen).toBe(`10-20 1 | i80 AhAc call-0-20 / @190 2h2c sb-0-0-10 / i280 3h3c bb-0-0-20 $!p4h5h6h7h8h`)

  expect(events.pov(1).map(_ => _.fen)).toStrictEqual(['a 1 call-0-20', 's 1 20', 'c 1 i', 'c 2 @'])

  expect(r.dests.fen).toBe(`call-10 raise-10-20 fold`)

  events = r.act('call 10')
  expect(r.fen).toBe(`10-20 1 | i80 AhAc call-0-20 / i180 2h2c call-10-10 / @280 3h3c bb-0-0-20 $!p4h5h6h7h8h`)

  expect(events.pov(1).map(_ => _.fen)).toStrictEqual(['a 2 call-10-10', 's 2 10', 'c 2 i', 'c 3 @'])

  expect(r.dests.fen).toBe(`check raise-0-20 fold`)


  events = r.act('check')
  expect(r.fen).toBe(`10-20 1 | p80 AhAc call-0-20 / p180 2h2c call-10-10 / p280 3h3c check-20 $!p4h5h6h7h8h`)

  expect(events.pov(1).map(_ => _.fen)).toStrictEqual(['c 1 p', 'c 2 p', 'c 3 p', 'a 3 check-20'])

  expect(r.dests.fen).toBe(`phase`)

  events = r.act('phase')
  expect(r.fen).toBe(`10-20 1 | i80 AhAc / i180 2h2c / @280 3h3c $ 60-123 !f4h5h6h7h8h`)

  expect(r.pov(1).fen).toBe(`10-20 1 | i80 AhAc / i180 / @280 $ 60-123 !4h5h6h`)

  expect(events.pov(1).map(_ => _.fen)).toStrictEqual(['p 1 20', 'p 2 20', 'p 3 20', 'f 4h5h6h', 'c 1 i', 'a 1', 'c 2 i', 'a 2', 'c 3 @', 'a 3'])

  expect(r.dests.fen).toBe(`check raise-0-20 fold`)

  events = r.act('check')
  events = r.act('check')
  events = r.act('check')
  expect(r.fen).toBe(`10-20 1 | p80 AhAc check-0 / p180 2h2c check-0 / p280 3h3c check-0 $ 60-123 !f4h5h6h7h8h`)

  events = r.act('phase')
  expect(r.fen).toBe(`10-20 1 | i80 AhAc / i180 2h2c / @280 3h3c $ 60-123 !t4h5h6h7h8h`)

  expect(r.pov(1).fen).toBe(`10-20 1 | i80 AhAc / i180 / @280 $ 60-123 !4h5h6h7h`)

  expect(events.pov(1).map(_ => _.fen)).toStrictEqual(['t 7h', 'c 1 i', 'a 1', 'c 2 i', 'a 2', 'c 3 @', 'a 3'])

  expect(r.dests.fen).toBe('check raise-0-20 fold')


  events = r.act('check')
  events = r.act('check')
  events = r.act('check')
  events = r.act('phase')

  expect(r.fen).toBe(`10-20 1 | i80 AhAc / i180 2h2c / @280 3h3c $ 60-123 !r4h5h6h7h8h`)

  expect(r.pov(1).fen).toBe(`10-20 1 | i80 AhAc / i180 / @280 $ 60-123 !4h5h6h7h8h`)
  expect(events.pov(1).map(_ => _.fen)).toStrictEqual(['r 8h', 'c 1 i', 'a 1', 'c 2 i', 'a 2', 'c 3 @', 'a 3'])

  events = r.act('check')
  events = r.act('check')
  events = r.act('check')
  events = r.act('phase')

  expect(r.fen).toBe(`10-20 1 | s80 AhAc / s180 2h2c / s280 3h3c $ 60-123 !r4h5h6h7h8h`)

  expect(r.pov(1).fen).toBe(`10-20 1 | s80 AhAc / s180 2h2c / s280 3h3c $ 60-123 !4h5h6h7h8h`)

  expect(events.pov(1).map(_ => _.fen)).toStrictEqual(['c 1 s', 'a 1', 'c 2 s', 'a 2', 'c 3 s', 'a 3', 'h 2 2h2c', 'h 3 3h3c'])

  expect(r.dests.fen).toBe('showdown')

  events = r.act('showdown')
  expect(r.fen).toBe(`10-20 1 | s80 AhAc / s180 2h2c / s280 3h3c $ 60-123 !r4h5h6h7h8h shares win-1-60`)

  expect(r.pov(1).fen).toBe(`10-20 1 | s80 AhAc / s180 2h2c / s280 3h3c $ 60-123 !4h5h6h7h8h shares win-1-60`)
  expect(r.pov(2).fen).toBe(`10-20 3 | s180 2h2c / s280 3h3c / s80 AhAc $ 60-123 !4h5h6h7h8h shares win-3-60`)

  expect(events.pov(1).map(_ => _.fen)).toStrictEqual(['w win-1-60'])

  expect(r.dests.fen).toBe('share')

  events = r.act('share')
  expect(r.fen).toBe(`10-20 2 | d140 / d180 / d280 $!`)

  expect(r.pov(1).fen).toBe(`10-20 2 | d140 / d180 / d280 $!`)

  expect(events.pov(1).map(_ => _.fen)).toStrictEqual(['c 1 d', 'o 1', 'c 2 d', 'o 2', 'c 3 d', 'o 3', 'C', 'S 1 60', 'b 2'])

  expect(r.dests.fen).toBe('deal')

  r.act('deal AhAc2h2c3h3c4h5h6h7h8h')

  expect(r.fen).toBe(`10-20 2 | i120 AhAc bb-0-0-20 / @180 2h2c / i270 3h3c sb-0-0-10 $!p4h5h6h7h8h`)
})
