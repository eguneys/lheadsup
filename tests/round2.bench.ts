import { describe, it, expect, bench } from 'vitest'
import { RoundN, shuffle, make_deal } from '../src'

function choose_a_dest(r: RoundN) {
  let res = []

  let { dests } = r

  if(dests.deal) {
    res.push(`deal ${make_deal(dests.deal)}`)
  }
  if (dests.phase) {
    res.push('phase')
  }
  if (dests.showdown) {
    res.push('showdown')
  }
  if (dests.share) {
    res.push('share')
  }
  if (dests.check) {
    res.push('check')
  }
  if (dests.fold) {
    res.push('fold')
  }
  if (dests.call) {
    res.push(`call ${dests.call.match}`)
  }
  if (dests.win) {
    res.push('win')
  }

  if (dests.fin) {
    res.push('fin')
  }

  if (dests.raise) {

    let action_stack = r.action.stack
    let { match, min_raise } = dests.raise
    let pot = r.pov(1).total_pot
    let third_pot = pot / 3
    let half_pot = pot / 2
    let over_pot = pot * 1.2

    if (action_stack < match) {
      res.push(`raise ${action_stack}-0`)
    } else if (action_stack < min_raise) {
      res.push(`raise ${match}-${action_stack-match}`)
    } else {
      let raises = [min_raise, half_pot, third_pot, pot, over_pot].filter(_ => _ >= min_raise)
      let random_raise = shuffle(raises)[0]
      res.push(`raise ${match}-${Math.min(action_stack-match, random_raise)}`)
    }

  }
  shuffle(res)
  return res[0]
}

function play(fen: string) {

  let r = RoundN.from_fen(fen)

  for (let i = 0; i < 60; i++) {
    let dest = choose_a_dest(r)
    if (dest === 'fin') {
      return
    } else {
      r.act(dest)
    } 
  }
  throw 3

}

function examine_play(fen: string) {

  let r = RoundN.from_fen(fen)

  let fens = []
  let dests = []
  for (let i = 0; i < 30; i++) {
    let dest = choose_a_dest(r)
    dests.push(dest)
    fens.push(r.fen)
    if (dest === 'fin') {
      //console.log(i, r.fen)
      return
    } else {
      let pre_fen = r.fen
      try {
        r.act(dest)
      } catch (e) {
        if (i < 10) {
          console.log(i, pre_fen, r.fen, dest, dests, fens)
        }
        throw e
      }
    }
  }
  //console.log(r.fen, dests, fens)
  throw 3
}


describe('equal stacks', () => {

  bench('nine way equal stacks', () => {
    play(`10-20 1 | d300 / d300 / d300 / d300 / d300 / d300 / d300 / d300 / d300 $!`)
  })

  bench('six way equal stacks', () => {
    play(`10-20 1 | d300 / d300 / d300 / d300 / d300 / d300 $!`)
  })

  bench('three way equal stacks', () => {
    play(`10-20 1 | d300 / d300 / d300 $!`)
  })

  bench('three way', () => {
    play(`10-20 1 | d100 / d100 / d280 $!`)
  })

  bench('headsup', () => {
    play(`10-20 1 | d100 / d100 $!`)
  })

})

describe('uneven stacks', () => {
  bench('nine way uneven stacks', () => {
    play(`10-20 1 | d100 / d200 / d300 / d400 / d500 / d600 / d700 / d800 / d900 $!`)
  })


  bench('six way uneven stacks', () => {
    play(`10-20 1 | d100 / d200 / d300 / d400 / d500 / d600 $!`)
  })



  bench('three way uneven', () => {
    examine_play(`10-20 1 | d100 / d200 / d300 $!`)
  })


  bench('headsup uneven', () => {
    play(`10-20 1 | d100 / d200 $!`)
  })
})
