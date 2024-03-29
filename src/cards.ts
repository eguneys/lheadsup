export type Rank = string
export type Card = string

export const suits = 'schd'.split('')
export const ranks = 'A23456789TJQK'.split('')

export const cards = suits.flatMap(suit => ranks.map(rank => `${rank}${suit}`))

export function make_cards(nb: number) {
  let deck = shuffle(cards.slice(0))

  return deck.slice(0, nb).join('')
}

export function make_deal(nb: number) {
  return make_cards(5 + nb * 2)
}


export function split_cards(cards: string, nb = cards.length / 2): Card[] {
  return [...Array(nb).keys()].map(_ => cards.slice(_ * 2, _ * 2 + 2))
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export function shuffle<A>(array: A[]) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}
