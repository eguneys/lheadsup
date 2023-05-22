import { Side, next } from './round2'
import { Card, HandRank, hand_rank } from './hand_eval'

const straight_highs: Record<string, string> = { 'A': 'AKQJT', '5': '5432A', '6': '65432', '7': '76543', '8': '87654', '9': '98765', 'T': 'T9876', 'J': 'JT987', 'Q': 'QJT98', 'K': 'KQJT9' }

/* https://stackoverflow.com/questions/1053843/get-the-element-with-the-highest-occurrence-in-an-array */
function mode<A>(arr: A[]){
    return arr.sort((a,b) =>
          arr.filter(v => v===a).length
        - arr.filter(v => v===b).length
    ).pop();
}


export type Hi = string

function highlight(hand: Card[], hand_rank: HandRank) {
  if (hand_rank.quad) {
    return hand.map(_ => _[0] === hand_rank.quad![0] ? 'h' : 's')
  }
  if (hand_rank.high) {
    return hand.map(_ => hand_rank.high![0] === _[0] ? 'h' : 
                    hand_rank.high!.slice(1)!.includes(_[0]) ? 'k' : 's')
  }
  if (hand_rank.full) {
    return hand.map(_ => 
                    _[0] === hand_rank.full![0] ? 'h' : 
                    _[0] === hand_rank.full![1] ? 'h' : 
                    's')
  }
  if (hand_rank.set) {
    return hand.map(_ => 
                    _[0] === hand_rank.set![0] ? 'h' : 
                    _[0] === hand_rank.set![1] ? 'k' : 
                    _[0] === hand_rank.set![2] ? 'k' : 
                    's')
  }
  if (hand_rank.pair2) {
    let k_found = false
    return hand.map(_ => {
      let kicker = false
      if (!k_found && _[0] === hand_rank.pair2![2]) {
        kicker = true
      }
      let res = _[0] === hand_rank.pair2![0] ? 'h' :
        _[0] === hand_rank.pair2![1] ? 'h' :
        kicker ? 'k' :
        's'
      k_found = k_found || kicker
      return res
    })
  }
  if (hand_rank.pair) {
    return hand.map(_ => 
                    _[0] === hand_rank.pair![0] ? 'h' : 
                    _[0] === hand_rank.pair![1] ? 'k' : 
                    's')

  }

  if (hand_rank.sflush) {
    let highs = straight_highs[hand_rank.sflush].split('')
    return hand.map(_ => highs.includes(_[0]) ? 'h' : 's')
  }

  if (hand_rank.straight) {
    let highs = straight_highs[hand_rank.straight].split('')
    return hand.map(_ => highs.includes(_[0]) ? 'h' : 's')
  }

  if (hand_rank.flush) {
    let suit = mode(hand.map(_ => _[1]))
    return hand.map(_ => (hand_rank.flush!.includes(_[0]) && _[1] === suit) ? 'h' : 's')
  }
}
