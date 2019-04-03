import Config from '@@/config/global'

export let Point = function (x, y) {
  return {
    X: x,
    Y: y
  }
}

export let Rectangle = function (x, y, width, height) {
  return {
    X: x,
    Y: y,
    Width: width,
    Height: height
  }
}

export let WorkPoints = function (points) {
  points = Resample(points, Config.NumPoints)
  var radians = IndicativeAngle(points)
  points = RotateBy(points, -radians)
  points = ScaleTo(points, Config.SquareSize)
  points = TranslateTo(points, Config.Origin)

  return points
}

export let Unistroke = function (name, points) {
  points = WorkPoints(points)
  let vector = Vectorize(points)

  return {
    name,
    points,
    vector
  }
}

export let Resample = function (points, n) {
  var I = PathLength(points) / (n - 1) // interval length
  var D = 0.0
  var newpoints = [points[0]]
  for (var i = 1; i < points.length; i++) {
    var d = Distance(points[i - 1], points[i])
    if ((D + d) >= I) {
      var qx = points[i - 1].X + ((I - D) / d) * (points[i].X - points[i - 1].X)
      var qy = points[i - 1].Y + ((I - D) / d) * (points[i].Y - points[i - 1].Y)
      var q = new Point(qx, qy)
      newpoints[newpoints.length] = q // append new point 'q'
      points.splice(i, 0, q) // insert 'q' at position i in points s.t. 'q' will be the next i
      D = 0.0
    } else {
      D += d
    }
  }
  if (newpoints.length === (n - 1)) {
    newpoints[newpoints.length] = new Point(points[points.length - 1].X, points[points.length - 1].Y)
  }
  return newpoints
}

export let Result = function (name, score, ms) {
  return {
    Name: name,
    Score: score,
    Time: ms
  }
}

export let IndicativeAngle = function (points) {
  var c = Centroid(points)
  return Math.atan2(c.Y - points[0].Y, c.X - points[0].X)
}

export let RotateBy = function (points, radians) {
  var c = Centroid(points)
  var cos = Math.cos(radians)
  var sin = Math.sin(radians)
  var newpoints = []
  for (var i = 0; i < points.length; i++) {
    var qx = (points[i].X - c.X) * cos - (points[i].Y - c.Y) * sin + c.X
    var qy = (points[i].X - c.X) * sin + (points[i].Y - c.Y) * cos + c.Y
    newpoints[newpoints.length] = new Point(qx, qy)
  }
  return newpoints
}

export let ScaleTo = function (points, size) {
  var B = BoundingBox(points)
  var newpoints = []
  for (var i = 0; i < points.length; i++) {
    var qx = points[i].X * (size / B.Width)
    var qy = points[i].Y * (size / B.Height)
    newpoints[newpoints.length] = new Point(qx, qy)
  }
  return newpoints
}

export let TranslateTo = function (points, pt) {
  var c = Centroid(points)
  var newpoints = []
  for (var i = 0; i < points.length; i++) {
    var qx = points[i].X + pt.X - c.X
    var qy = points[i].Y + pt.Y - c.Y
    newpoints[newpoints.length] = new Point(qx, qy)
  }
  return newpoints
}

export let Vectorize = function (points) {
  var sum = 0.0
  var vector = []
  for (var i = 0; i < points.length; i++) {
    vector[vector.length] = points[i].X
    vector[vector.length] = points[i].Y
    sum += points[i].X * points[i].X + points[i].Y * points[i].Y
  }
  var magnitude = Math.sqrt(sum)
  for (var y = 0; y < vector.length; y++) {
    vector[y] /= magnitude
  }
  return vector
}

export let OptimalCosineDistance = function (v1, v2) {
  let a = 0.0
  let b = 0.0
  for (var i = 0; i < v1.length; i += 2) {
    a += v1[i] * v2[i] + v1[i + 1] * v2[i + 1]
    b += v1[i] * v2[i + 1] - v1[i + 1] * v2[i]
  }
  let angle = Math.atan(b / a)
  return Math.acos(a * Math.cos(angle) + b * Math.sin(angle))
}

export let DistanceAtBestAngle = function (points, T, a, b, threshold) {
  const Phi = 0.5 * (-1.0 + Math.sqrt(5.0))
  var x1 = Phi * a + (1.0 - Phi) * b
  var f1 = DistanceAtAngle(points, T, x1)
  var x2 = (1.0 - Phi) * a + Phi * b
  var f2 = DistanceAtAngle(points, T, x2)
  while (Math.abs(b - a) > threshold) {
    if (f1 < f2) {
      b = x2
      x2 = x1
      f2 = f1
      x1 = Phi * a + (1.0 - Phi) * b
      f1 = DistanceAtAngle(points, T, x1)
    } else {
      a = x1
      x1 = x2
      f1 = f2
      x2 = (1.0 - Phi) * a + Phi * b
      f2 = DistanceAtAngle(points, T, x2)
    }
  }
  return Math.min(f1, f2)
}

export let DistanceAtAngle = function (points, T, radians) {
  var newpoints = RotateBy(points, radians)
  return PathDistance(newpoints, T.points)
}

export let Centroid = function (points) {
  var x = 0.0
  var y = 0.0
  for (var i = 0; i < points.length; i++) {
    x += points[i].X
    y += points[i].Y
  }
  x /= points.length
  y /= points.length
  return new Point(x, y)
}

export let BoundingBox = function (points) {
  var minX = +Infinity
  var maxX = -Infinity
  var minY = +Infinity
  var maxY = -Infinity
  for (var i = 0; i < points.length; i++) {
    minX = Math.min(minX, points[i].X)
    minY = Math.min(minY, points[i].Y)
    maxX = Math.max(maxX, points[i].X)
    maxY = Math.max(maxY, points[i].Y)
  }
  return new Rectangle(minX, minY, maxX - minX, maxY - minY)
}

export let Path = function (a, b) {
  var d = 0.0
  for (var i = 0; i < a.length; i++) {
    d += Distance(a[i], b[i])
  }
  return d
}

export let PathDistance = function (pts1, pts2) {
  var d = Path(pts1, pts2)
  return d / pts1.length
}

export let PathLength = function (points) {
  var pts2 = points.slice(0)
  points.pop()
  pts2.shift()
  return Path(points, pts2)
}

export let Distance = function (p1, p2) {
  var dx = p2.X - p1.X
  var dy = p2.Y - p1.Y
  return Math.sqrt(dx * dx + dy * dy)
}

export let Deg2Rad = function (d) {
  return (d * Math.PI / 180.0)
}
