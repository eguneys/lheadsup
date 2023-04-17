import { next, Round, Chips, Side } from './round'
import { Hand } from './hand'
import { HandRank } from './hand_eval'

export type ShareDescription = string

export class PotShare {

  static win = (side: Side, chips: Chips) => {
    return new PotShare('win', side, chips)
  }

  static win_show = (side: Side, chips: Chips, hand_rank: HandRank) => {
    return new PotShare('winshow', side, chips, hand_rank)
  }

  static tie_show = (side: Side, chips: Chips, hand_rank: HandRank) => {
    return new PotShare('tieshow', side, chips, hand_rank)
  }

  static back = (side: Side, chips: Chips) => {
    return new PotShare('back', side, chips)
  }



  constructor(
    readonly desc: ShareDescription,
    readonly side: Side,
    readonly chips: Chips,
    readonly hand_rank?: HandRank
  ) {}
}

export class GameDeal {
  constructor(
    readonly round: Round,
    readonly hand: Hand,
    public distribution?: PotShare[]) {}


  add_share() {
    let res = []

    let { distribution } = this.round

    let back_show = 0

    if (distribution!.back) {
      let [side, chips] = distribution!.back

      res.push(PotShare.back(side, chips))
      back_show = chips
    }

    if (distribution!.win) {
      let [side, chips] = distribution!.win

      res.push(PotShare.win(side, chips))
    } else if (distribution!.show) {

      let show = distribution!.show - back_show

      let rank1 = this.hand.hand_rank(1)
      let rank2 = this.hand.hand_rank(2)

      if (rank1.hand_eval > rank2.hand_eval) {
        res.push(PotShare.win_show(1, show, rank1))
      } else if (rank1.hand_eval < rank2.hand_eval) {
        res.push(PotShare.win_show(2, show, rank2))
      } else {
        res.push(PotShare.tie_show(1, show / 2, rank1))
        res.push(PotShare.tie_show(2, show / 2, rank2))
      }
    }

    this.distribution = res
  }

  get stacks() {
    return this.round.stacks
  }
  
}

export type GameAction = string

export class Game {

  static make = () => {

    let small_blind = 10
    let button: Side = 1
    let stacks: [Chips, Chips] = [small_blind * 100, small_blind * 100]

    return new Game(small_blind, button, stacks, undefined)
  }

  constructor(
    public small_blind: Chips,
    public button: Side,
    public stacks: [Chips, Chips],
    public deal?: GameDeal) {}

  get big_blind() {
    return this.small_blind * 2
  }

  get fen() {

    let { small_blind, big_blind, button } = this

    let blinds = [small_blind, big_blind].join('-')
    let blinds_button = [blinds, button].join(' ')
    let stacks = this.stacks.join(' ')

    if (this.deal) {
      return [blinds_button, stacks, '@'].join(' / ')
    } else {
      return [blinds_button, stacks].join(' / ')
    }
  }


  get dests() {
    if (this.deal) {
      if (this.deal.distribution) {
        return 'dist'
      } else if (this.deal.round.distribution) {
        return 'share'
      }
    } else {
      return 'deal'
    }
  }


  add_deal(hand: Hand) {
    let round = Round.from_game(this)

    this.deal = new GameDeal(round, hand)
  }

  add_share() {
    this.deal!.add_share()
  }

  add_dist() {

    let { distribution } = this.deal!

    let stacks: [Chips, Chips] = [...this.deal!.stacks]
    distribution!.forEach(dist => {
      stacks[dist.side - 1] += dist.chips
    })

    this.button = next(this.button)
    this.stacks = stacks
    this.deal = undefined
  }

  add_blinds(blinds: Chips) {
    this.small_blind = blinds
  }

}
