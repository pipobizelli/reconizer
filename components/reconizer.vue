<template>
  <canvas id="board" ref="board" oncontextmenu="return false;"
  @mousedown="mouseDown"
  @mousemove="mouseMove"
  @mouseup="mouseUp"
  @touchstart="touchDown"
  @touchmove="touchMove"
  @touchend="touchUp"></canvas>
</template>

<script>
import { Reconize } from '@@/plugins/dollar'
import { Point } from '@@/plugins/utils'
export default {
  props: ['unistrokes'],
  data () {
    return {
      isDown: false,
      points: []
    }
  },
  computed: {
    legend () {
      return {
        height: 32
      }
    },
    canvas () {
      if (process.client) {
        return this.$refs.board
      }
    },
    canvasContext () {
      if (process.client) {
        return this.canvas.getContext('2d')
      }
    },
    rect () {
      if (process.client) {
        var w = this.canvas.width
        var h = this.canvas.height
        var cx = this.canvas.offsetLeft
        var cy = this.canvas.offsetTop

        return {
          x: cx,
          y: cy,
          width: w,
          height: h
        }
      }
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
        this.canvasContext.font = '21px sans-serif'
        this.canvasContext.fillRect(0, 0, this.rect.width, this.legend.height)
      })
    }
  },
  methods: {
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
        this.points.push(Point(x, y))
        this.drawText('Desenhando...')

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
          var result = Reconize(this.points, this.unistrokes)
          this.drawText('Result: ' + result.Name + ' (' + this.round(result.Score, 1) + ') in ' + result.Time + ' ms.')
        } else {
          this.drawText('Too few points made. Please try again.')
        }
      }
    },
    drawText (str) {
      this.canvasContext.fillStyle = 'rgb(0,0,0)'
      this.canvasContext.fillRect(0, 0, this.rect.width, this.legend.height)
      this.canvasContext.fillStyle = 'rgb(200,155,50)'
      this.canvasContext.fillText(str, 5, 21)
    },
    drawConnectedPoint (from, to) {
      this.canvasContext.fillStyle = 'rgb(0,0,0)'
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
  canvas {
    border: 0;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
    background-color: #ddd;
  }
</style>
