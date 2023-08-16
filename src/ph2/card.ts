import * as hash from './hash'
import * as tables from './tables'

const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"]


type Rank = typeof ranks[number]

const rank = Object.fromEntries(ranks.map((r, i) => [r, i]))
const reverseRank = Object.fromEntries(ranks.map((r, i) => [`${i}`, r]))


const suits = ['c', 'd', 'h', 's']


type Suit = typeof suits[number]

const suit = Object.fromEntries(suits.map((r, i) => [r, i]))
const reverseSuit = Object.fromEntries(suits.map((r, i) => [`${i}`, r]))

const numberOfCards = ranks.length * suits.length

type Card = { rank: Rank, suit: Suit }

const cardToId = (card: Card) => rank[card.rank] * 4 + suit[card.suit]
const idToCard = (id: number) => {
  if (id < 0 || id > numberOfCards - 1) {
    throw new Error(`Id(${id}) is not a card id`)
  }
  return {
    rank: reverseRank[`${Math.floor(id / 4)}`],
    suit: reverseSuit[`${id % 4}`]
  }
}

const minCards = 5
const maxCards = 7
const noFlushes: { [key: number]: number[] } = {
  5: tables.noFlush5,
  6: tables.noFlush6,
  7: tables.noFlush7,
}

export const  evaluate = (cards: Card[]): number => {
  const ids = cards.map((c) => cardToId(c))
  const size = ids.length
  const noFlush = noFlushes[size]

  if (size < minCards || size > maxCards || !noFlush) {
    throw new Error(`#cards must be in [${minCards}, ${maxCards}].`)
  }

  let suitHash = 0
  for (const card of ids) {
    suitHash += tables.suitbitById[card]
  }

  const flushSuit = tables.suits[suitHash]

  if (flushSuit) {

    const suitBinary = [0, 0, 0, 0]

    for (const card of ids) {
      suitBinary[card & 0x03] |= tables.binariesById[card]
    }

    return tables.flush[suitBinary[flushSuit - 1]]
  }

  const quinary = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

  for (const card of ids) {
    quinary[card >> 2]++;
  }

  return noFlush[hash.quinary(quinary, size)]
}


const equalsCard = (a: Card, b: Card) => a.rank === b.rank && a.suit === b.suit