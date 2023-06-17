import { it, expect } from 'vitest'
import data from './7462.json'
import { 
  pair_kickers,
  ppair_kickers,
  flush_kickers,
  set_kickers } from './flush_kickers.json'
import { cards, lookup_cards, get_klass, get_klass_info } from '../src'

it('checks samples', () => {

  data.forEach(data => {
    let { 
      klass,
      nb5,
      nb6,
      nb7,
      sample,
      abbr,
      desc
    } = data

    let force_suits = abbr ===  'S' ? ['c', 'd'] : 
      (abbr === 'F' ? ['c', 'c', 'c', 'c', 'c'] : 
       abbr === 'HC' ? ['c', 'd'] : [])
    let { klass: k, abbr: a, desc: d } = sample_5(sample, force_suits)
    expect(`${7463 - k}`).toBe(klass)
    expect(a).toBe(abbr)
    expect(d).toBe(desc)
  })
})

it.skip('nb5s', () => {

  let [nb5s, nb6s, nb7s] = gen_nbs()

  data.forEach(data => {
    let { 
      klass,
      nb5,
      nb6,
      nb7,
      sample,
      abbr,
      desc
    } = data

    expect(nb5s[klass] + '').toBe(nb5)
    //expect(nb6s[klass]).toBe(nb6)
    //expect(nb7s[klass]).toBe(nb7)
  })
})

function sample_5(sample: string, force_suits: string[]) {
  let cards = sample_cards(sample, force_suits)

  return get_klass_info(cards)
}

function sample_cards(str: string, force_suits: string[]) {
  let deck = cards.slice(0)
  function get_card(rank: string) {
    let i = deck.findIndex(_ => _[0] == rank && 
                           (force_suits.length === 0 ||
                            _[1] === force_suits[0]))

    force_suits.shift()
    return deck.splice(i, 1)[0]
  }
  let ranks = str.split(' ')
  let res = ranks.map(rank => get_card(rank))

  return res
}

function gen_nbs() {
  let nb5s = Array(7463).fill(0)
  let nb6s = Array(7463).fill(0)
  let nb7s = Array(7463).fill(0)

  let count = 0
  for (let c1 = 0; c1 < 52; c1++) {
    for (let c2 = c1 + 1; c2 < 52; c2++) {
      for (let c3 = c2 + 1; c3 < 52; c3++) {
        for (let c4 = c3 + 1; c4 < 52; c4++) {
          for (let c5 = c4 + 1; c5 < 52; c5++) {
            let [klass, rank] = get_klass([c1, c2, c3, c4, c5].map(i => cards[i]))
            nb5s[7463 - klass]++;
            count++
          }
        }
      }
    }
  }

  expect(count).toBe(2_598_960)
  return [nb5s, nb6s, nb7s]
}

