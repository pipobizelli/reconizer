<template>
  <section>
    <canvas id="myCanvas" oncontextmenu="return false;"
    @mousedown="mouseDown"
    @mousemove="mouseMove"
    @mouseup="mouseUp"
    @touchstart="touchDown"
    @touchmove="touchMove"
    @touchend="touchUp"></canvas>
  </section>
</template>

<script>
import { Reconize } from '@@/plugins/dollar'
import { Point, Unistroke } from '@@/plugins/utils'
import Unis from '@@/unistrokes/index'

export default {
  data () {
    return {
      isDown: false,
      points: [],
      unistrokes: []
    }
  },
  computed: {
    canvas () {
      if (process.client) {
        return document.getElementById('myCanvas')
      }
    },
    canvasContext () {
      if (process.client) {
        return this.canvas.getContext('2d')
      }
    },
    rect () {
      if (process.client) {
        return this.getCanvasRect(this.canvas)
      }
    }
  },
  created () {
    let strokes = Object.values(Unis)

    for (var s in strokes) {
      this.unistrokes.push(Unistroke(strokes[s].name, strokes[s].points))
    }
  },
  mounted () {
    if (process.client) {
      this.$nextTick(() => {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        this.canvasContext.fillStyle = 'rgb(0,0,0)'
        this.canvasContext.strokeStyle = 'rgb(0,0,0)'
        this.canvasContext.lineWidth = 1
        this.canvasContext.font = '16px Gentilis'
        this.canvasContext.fillStyle = 'rgb(255,255,136)'
        this.canvasContext.fillRect(0, 0, this.rect.width, 20)
      })
    }
  },
  methods: {
    getCanvasRect (canvas) {
      var w = canvas.width
      var h = canvas.height

      var cx = canvas.offsetLeft
      var cy = canvas.offsetTop
      while (canvas.offsetParent != null) {
        canvas = canvas.offsetParent
        cx += canvas.offsetLeft
        cy += canvas.offsetTop
      }
      return {
        x: cx,
        y: cy,
        width: w,
        height: h
      }
    },
    mouseDown (e) {
      var x = e.clientX
      var y = e.clientY
      var button = e.button
      this.downEvent(x, y, button)
    },
    touchDown (e) {
      var x = e.touches[0].clientX
      var y = e.touches[0].clientY
      this.downEvent(x, y, 0)
    },
    downEvent (x, y, button) {
      document.onselectstart = function () {
        return false
      }
      document.onmousedown = function () {
        return false
      }

      if (button <= 1) {
        this.isDown = true
        x -= this.rect.x - window.scrollX
        y -= this.rect.y - window.scrollY
        if (this.points.length > 0) {
          this.canvasContext.clearRect(0, 0, this.rect.width, this.rect.height)
          this.points = []
        }
        // this.points.length = 1
        this.points.push(Point(x, y))
        this.drawText('Recording unistroke...')

        this.canvasContext.arc(x, y, 3, 0, 2 * Math.PI)
        this.canvasContext.fill()
      } else if (button === 2) {
        this.drawText('Recognizing gesture...')
      }
    },
    mouseMove (e) {
      var x = e.clientX
      var y = e.clientY
      this.moveEvent(x, y)
    },
    touchMove (e) {
      var x = e.touches[0].clientX
      var y = e.touches[0].clientY
      this.moveEvent(x, y)
    },
    moveEvent (x, y) {
      if (this.isDown) {
        x -= this.rect.x - window.scrollX
        y -= this.rect.y - window.scrollY
        this.points.push(Point(x, y))
        this.drawConnectedPoint(this.points.length - 2, this.points.length - 1)
      }
    },
    mouseUp (e) {
      this.upEvent(e.button)
    },
    touchUp () {
      this.upEvent(0)
    },
    upEvent (button) {
      document.onselectstart = function () {
        return true
      }
      document.onmousedown = function () {
        return true
      }

      if (this.isDown || button === 2) {
        this.isDown = false
        if (this.points.length >= 10) {
          // console.log(JSON.stringify(this.points))
          var result = Reconize(this.points, this.unistrokes)
          this.drawText('Result: ' + result.Name + ' (' + this.round(result.Score, 2) + ') in ' + result.Time + ' ms.')
        } else {
          this.drawText('Too few points made. Please try again.')
        }
      }
    },
    drawText (str) {
      this.canvasContext.fillStyle = 'rgb(255,255,136)'
      this.canvasContext.fillRect(0, 0, this.rect.width, 20)
      this.canvasContext.fillStyle = 'rgb(0,0,0)'
      this.canvasContext.fillText(str, 1, 14)
    },
    drawConnectedPoint (from, to) {
      this.canvasContext.beginPath()
      this.canvasContext.moveTo(this.points[from].X, this.points[from].Y)
      this.canvasContext.lineTo(this.points[to].X, this.points[to].Y)
      this.canvasContext.closePath()
      this.canvasContext.stroke()
    },
    round (n, d) {
      d = Math.pow(10, d)
      return Math.round(n * d) / d
    }
  }
}
</script>

<style lang="css">
  html,
  body {
    overscroll-behavior: none;
  }

  canvas {
    border: 0;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
    background-color:#ddd;
  }
</style>
