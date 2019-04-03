<template>
  <section>
    <reconizer :unistrokes="unistrokes"></reconizer>
  </section>
</template>

<script>
import { Unistroke } from '@@/plugins/utils'
import Unis from '@@/unistrokes/index'
import Reconizer from '@@/components/reconizer.vue'
export default {
  data () {
    return {
      unistrokes: []
    }
  },
  created () {
    let strokes = Object.values(Unis)
    for (var s in strokes) {
      this.unistrokes.push(Unistroke(strokes[s].name, strokes[s].points))
    }
  },
  components: {
    Reconizer
  }
}
</script>

<style lang="css">
  html,
  body {
    overscroll-behavior: none;
  }
</style>
