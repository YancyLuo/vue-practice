<template>
  <div class="music-list">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
        <div ref="playBtn" v-show="songs.length>0 && !isTop" class="play">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter"></div>
    </div>
    <div class="bg-layer" ref="layer"></div>
    <scroll :asyncData="songs" 
            class="list" 
            ref="list" 
            :probeType="3" 
            :listenScroll="true"
            @scroll="scroll">
      <div class="song-list-wrapper">
        <song-list :songs="songs" @play="playSong"></song-list>
      </div>
      <div v-show="!songs.length" class="loading-container">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script>
import SongList from '@/base/song-list/song-list'
import Scroll from '@/base/scroll/scroll'
import { prefix } from 'common/js/dom'
import { Transform } from 'stream';
import Loading from '@/base/loading/loading'
import { mapActions } from 'vuex'

const RESERVED_HEIGHT = 40

export default {
  name: 'music-list',
  props:{
    title: {
      type: String,
      default: ''
    },
    bgImage: {
      type: String,
      default: ''
    },
    songs: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      maxHeight: '',
      prefix: '',
      isTop: false
    }
  },
  components: {
    SongList,
    Scroll,
    Loading
  },
  computed: {
    bgStyle() {
      return `background-image:url(${this.bgImage})`
    }
  },
  methods: {
    ...mapActions(['selectPlay']),
    back() {
      this.$router.back()
    },
    playSong(song, index) {
      this.selectPlay({
        list: this.songs,
        index
      })
    },
    scroll(pos) {
      var scrollY = pos.y
      var height = Math.min(-scrollY, this.maxHeight)
      var zIndex = 0
      if (scrollY > 0) {
        this.$refs.bgImage.style[this.prefix + 'transform'] =`scale(${1 + scrollY / (this.maxHeight + RESERVED_HEIGHT)})`
        zIndex = 1
      } else {
        if (height === this.maxHeight) {
          this.isTop = true
          this.$refs.bgImage.style.height = RESERVED_HEIGHT + 'px'
          this.$refs.bgImage.style.paddingTop = 0
          zIndex = 1
        } else {
          this.$refs.bgImage.style.height = 0
          this.$refs.bgImage.style.paddingTop = '70%'
          zIndex = 0
          this.isTop = false
        }
      }    
      this.$refs.layer.style.top = -height + 'px'
      this.$refs.bgImage.style.zIndex = zIndex
    }
  },
  mounted() {
    this.prefix = prefix()
    this.maxHeight = this.$refs.bgImage.clientHeight - RESERVED_HEIGHT
    this.$refs.list.$el.style.top = this.$refs.bgImage.clientHeight + 'px'
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      z-index: 0
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
        // z-index:10
</style>

