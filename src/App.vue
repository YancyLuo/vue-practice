<template>
  <div id="app">
    <m-header></m-header>
    <tab></tab>
    <keep-alive>
      <router-view/>
    </keep-alive>
    <player></player>
  </div>
</template>

<script type="text/ecmascript-6">
import Player from 'components/player/player'
import MHeader from 'components/m-header/m-header'
import Tab from 'components/tab/tab'
export default {
  components: {
    MHeader,
    Tab,
    Player
  },
  methods: {
    // getRem () {
    //   var html = document.getElementsByTagName('html')[0]
    //   html.style.fontSize = html.offsetWidth / 7.5 + 'px'
    // }
  },
  mounted () {
    // this.getRem()
  }
}
</script>

<style lang="stylus" scoped rel="stylesheet/stylus">

</style>
