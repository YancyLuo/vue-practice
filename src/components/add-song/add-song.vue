<template>
  <transition name="slide" appear>
    <div class="add-song" v-show="showFlag">
      <div class="header">
        <h1 class="title">添加歌曲到队列</h1>
        <div class="close" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <div class="search-box-wrapper">
        <search-box placeholder="搜索歌曲" @query="getQuery" ref="searchBox"></search-box>
      </div>
      <div class="shortcut" v-show="!query">
        <switches :switches="switches" :activeIndex.sync="activeIndex">
        </switches >
        <div class="list-wrapper">
            <scroll class="list-scroll" v-show="activeIndex===0" :asyncData="playHistory" ref="scroll1">
              <div class="list-inner">
                <song-list :songs="playHistory" @play="selectSong"></song-list>
              </div>
            </scroll>
            <scroll class="list-scroll" v-show="activeIndex===1" :asyncData="searchHistory" ref="scroll2">
              <div class="list-inner">
                <history-list :searches="searchHistory" 
                            @select="addQuery" 
                            @delete="deleteSearchHistory">
                </history-list>
              </div>
            </scroll>
          </div>
      </div>
      <div class="search-result" v-show="query">
        <suggest :query="query" 
                 :isShowSinger="false" 
                 @select="saveSearch" 
                 @listScroll="blurInput"
                 ref="suggest">
        </suggest>
      </div>
      <top-tip ref="topTip">
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">1首歌曲已经添加到播放队列</span>
        </div>
      </top-tip>
    </div>
  </transition>
</template>

<script>
import SearchBox from '@/base/search-box/search-box'
import Suggest from 'components/suggest/suggest'
import { searchMixin } from 'common/js/mixin'
import Switches from '@/base/switches/switches'
import Scroll from '@/base/scroll/scroll'
import { mapGetters, mapActions, mapMutations } from 'vuex' 
import SongList from '@/base/song-list/song-list'
import  Song  from 'common/js/song'
import HistoryList from '@/base/history-list/history-list'
import TopTip from '@/base/top-tip/top-tip'

export default {
  mixins: [searchMixin],
  components: {
    SearchBox,
    Suggest,
    Switches,
    Scroll,
    SongList,
    HistoryList,
    TopTip
  },
  computed: {
    ...mapGetters([
      'playHistory'
    ])
  },
  data() {
    return {
      showFlag: false,
      activeIndex: 0,
      switches:[
        {name: '最近播放'},
        {name: '搜索历史'}
      ]
    }
  },
  methods: {
    selectSong(item, index) {
      if (index !== 0) {
        this.insertSong(new Song(item))
        this.setFullScreen(false)
      }
      this.$refs.topTip.show()
    },
    getQuery(query) {
      this.query = query
    },
    show() {
      this.showFlag = true
      this.refreshList()
    },
    refreshList() {
      setTimeout(() => {
        if (this.activeIndex === 0) {
          this.$refs.scroll1.refresh()
        }
         else {
          this.$refs.scroll2.refresh()
        }
      }, 20)
    },
    hide() {
      this.showFlag = false
    },
    ...mapActions([
      'insertSong'
    ]),
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN'
    })
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .add-song
    position: fixed
    top: 0
    bottom: 0
    width: 100%
    z-index: 200
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .header
      position: relative
      height: 44px
      text-align: center
      .title
        line-height: 44px
        font-size: $font-size-large
        color: $color-text
      .close
        position: absolute
        top: 0
        right: 8px
        .icon-close
          display: block
          padding: 12px
          font-size: 20px
          color: $color-theme

    .search-box-wrapper
      margin: 20px
    .shortcut
      .list-wrapper
        position: absolute
        top: 165px
        bottom: 0
        width: 100%
        .list-scroll
          height: 100%
          overflow: hidden
          .list-inner
            padding: 20px 30px
    .search-result
      position: fixed
      top: 124px
      bottom: 0
      width: 100%
    .tip-title
      text-align: center
      padding: 18px 0
      font-size: 0
      .icon-ok
        font-size: $font-size-medium
        color: $color-theme
        margin-right: 4px
      .text
        font-size: $font-size-medium
        color: $color-text
</style>