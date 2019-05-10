<template>
  <transition name="slide">
    <div class="user-center">
      <div class="back" @click.stop="back">
        <i class="icon-back"></i>
      </div>
      <div class="switches-wrapper">
        <switches :activeIndex.sync="activeIndex" :switches="switches"></switches>
      </div>
      <div class="play-btn" ref="playBtn">
        <i class="icon-play"></i>
        <span class="text" @click="randomPlayList">随机播放全部</span>
      </div>
      <div class="list-wrapper" ref="listWrapper">
        <scroll class="list-scroll" :asyncData="favoriteList" v-show="activeIndex===0" ref="favoriteList">
          <div class="list-inner">
            <song-list :songs="favoriteList" @play="selectSong"></song-list>
          </div>
        </scroll>
        <scroll class="list-scroll" :asyncData="playHistory" v-show="activeIndex===1" ref="playHistory">
          <div class="list-inner">
            <song-list :songs="playHistory" @play="selectSong"></song-list>
          </div>
        </scroll>
      </div>
      <div class="no-result-wrapper">
        <no-result v-show="isEmpty" :title="title"></no-result>
      </div>
    </div>
  </transition>
</template>

<script>
import Switches from '@/base/switches/switches'
import Scroll from '@/base/scroll/scroll'
import SongList from '@/base/song-list/song-list'
import HistoryList from '@/base/history-list/history-list'
import NoResult from '@/base/no-result/no-result'
import { mapGetters, mapActions  } from 'vuex'
import Song from 'common/js/song'
import { setTimeout } from 'timers'
import { playlistMixin } from 'common/js/mixin'

export default {
  mixins: [playlistMixin],
  components: {
    Switches,
    Scroll,
    SongList,
    HistoryList,
    NoResult
  },
  computed: {
    title() {
      return this.activeIndex === 0 ? '暂无收藏的歌曲' : '暂无听过的歌曲'
    },
    isEmpty() {
      if (this.activeIndex === 0) {
        return this.favoriteList.length ? false : true
      } else {
        return this.playHistory.length ? false : true
      }
    },
    ...mapGetters([
      'favoriteList',
      'playHistory'
    ])
  },
  data() {
    return {
      switches: [
        {name: '我喜欢的'},
        {name: '最近听的'}
      ],
      activeIndex: 0
    }
  },  
  methods: {
    randomPlayList() {
      let list = []
      if(this.activeIndex === 0) {
        if (!this.favoriteList.length) return
        list = this.favoriteList.map(item => {
          return new Song(item)
        })
      } else {
        if (!this.playHistory.length) return 
        list = this.playHistory.map(item => {
          return new Song(item)
        })
      }
      this.randomPlay({list})
    },
    handlePlaylist(playlist) {
      let bottom = playlist.length > 0 ? '60px' : '0px'
      this.$refs.listWrapper.style.bottom = bottom
      this._refreshList(this.activeIndex)
    },
    selectSong(item, index) {
      this.insertSong(new Song(item))
    },
    back() {
      this.$router.back()
    },
    _refreshList(index) {
      if (index === 0) {
        setTimeout(() => {
          this.$refs.favoriteList.refresh()
        },20)
      } else {
        setTimeout(() => {
          this.$refs.playHistory.refresh()
        },20)
      }
    },
    ...mapActions([
      'insertSong',
      'randomPlay'
    ])
  },
  watch: {
    activeIndex(newVal) {
      this._refreshList(newVal)
    }
  }
} 
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .user-center
    position: fixed
    top: 0
    bottom: 0
    z-index: 100
    width: 100%
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
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
    .switches-wrapper
      margin: 10px 0 30px 0
    .play-btn
      box-sizing: border-box
      width: 135px
      padding: 7px 0
      margin: 0 auto
      text-align: center
      border: 1px solid  $color-text-l
      color: $color-text-l
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
    .list-wrapper
      position: absolute
      top: 110px
      bottom: 0
      width: 100%
      .list-scroll
        height: 100%
        overflow: hidden
        .list-inner
          padding: 20px 30px
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>

