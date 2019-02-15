import { Result, DistanceAtBestAngle, Deg2Rad, WorkPoints } from './utils'
import Config from '@@/config/global'

export let Reconize = function (points, Unistrokes) {
  const defaults = Object.assign({}, Config, {
    AngleRange: Deg2Rad(45.0),
    AnglePrecision: Deg2Rad(2.0)
  })

  var t0 = Date.now()
  points = WorkPoints(points)

  var b = +Infinity
  var u = -1
  for (var i = 0; i < Unistrokes.length; i++) {
    var d = DistanceAtBestAngle(points, Unistrokes[i], -defaults.AngleRange, +defaults.AngleRange, defaults.AnglePrecision)
    if (d < b) {
      b = d
      u = i
    }
  }
  var t1 = Date.now()
  return (u === -1)
    ? Result('No match.', 0.0, t1 - t0)
    : Result(Unistrokes[u].name, 1.0 - b / defaults.HalfDiagonal, t1 - t0)
}
