<template>
  <transition appear name="up">
    <div class="playlist" v-show="showPlaylist" @click.self="hide">
      <div class="list-wrapper">
        <div class="list-header">
          <h1 class="title">
            <i class="icon" :class="iconMode" @click="changeMode"></i>
            <span class="text">{{modeText}}</span>
            <span class="clear" @click.stop="showConfirm"><i class="icon-clear"></i></span>
          </h1>
        </div>
        <scroll class="list-content" :asyncData="sequenceList" ref="scroll">
          <transition-group tag="ul" name="list" ref="list">
            <li class="item"
                v-for="(item, index) in sequenceList" 
                :key="item.id" 
                @click="selectItem(item, index)"
                ref="listItem">
              <i class="current" :class="getCurrentIcon(item)"></i>
              <span class="text">{{item.name}}</span>
              <span class="like"  @click.stop="toggleFavorite(item)">
                <i :class="getFavoriteIcon(item)"></i>
              </span>
              <span class="delete" @click.stop="deleteOne(item)">
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group>
        </scroll>
        <div class="list-operate">
          <div class="add" @click="addSong">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到队列</span>
          </div>
        </div>
        <div class="list-close" @click="hide">
          <span>关闭</span>
        </div>   
      </div>
      <confirm ref="confirm" 
               text="是否清空播放列表" 
               confirmBtnText="清空" 
               @confirm="confirmClear">
      </confirm>
      <add-song ref="addSong"></add-song>
    </div>
  </transition>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import Scroll from '@/base/scroll/scroll'
import { setTimeout } from 'timers';
import { playMode } from 'common/js/config'
import Confirm from '@/base/confirm/confirm'
import { playerMixin } from 'common/js/mixin'
import AddSong from 'components/add-song/add-song'

export default {
  mixins: [playerMixin],
  data() {
    return {
      showPlaylist: false
    }
  },
  computed: {
    modeText() {
      switch(this.mode) {
        case playMode.loop : return '单曲循环'
        case playMode.random : return '随机播放'
        default : return '顺序播放'
      }
    },
    ...mapGetters([
      'currentSong',
      'playlist'
    ])
  },
  components: {
    Scroll,
    Confirm,
    AddSong
  },
  watch: {
    currentSong(newSong, oldSong) {
      if (!this.showPlaylist || newSong.mid === oldSong.mid) {
        return
      }
      setTimeout(() => {
        this.$refs.scroll.refresh()
        this.scrollToCurrent(newSong)
      }, 20)
    }
  },
  methods: {
    addSong() {
      this.$refs.addSong.show()
    },
    confirmClear() {
      this.deleteSongList()
      this.hide()
    },
    showConfirm() {
      this.$refs.confirm.show()
    },
    show() {
      this.showPlaylist = true
      setTimeout(() => {
        this.$refs.scroll.refresh()
        this.scrollToCurrent(this.currentSong)
      },20)
    },
    hide() {
      this.showPlaylist = false
    },
    getCurrentIcon(item) {
      return item.mid === this.currentSong.mid ? 'icon-play' : ''
    },
    selectItem(item, index) {
      if (this.mode === playMode.random ) {
          index = this.playlist.findIndex((song) => {
          return song.mid === item.mid
        })
      }
      this.setCurrentIndex(index)
    },
    deleteOne(item) {
      this.deleteSong(item)
      if(!this.playlist.length) {
        this.hide()
      }
    },
    scrollToCurrent(current) {
      let index = this.sequenceList.findIndex((item) => {
        return item.mid === current.mid
      })
      if (index === this.sequenceList.length - 1) {
        setTimeout(() => {
          this.$refs.scroll.refresh()
          this.$refs.scroll.scrollTo(0, this.$refs.scroll.scroll.maxScrollY)
        },30)
        return
      }
      this.$refs.scroll.scrollToElement(this.$refs.list.$el.children[index], 300)
    },
    ...mapMutations({
      setCurrentIndex: 'SET_CURRENT_INDEX'
    }),
    ...mapActions([
      'deleteSong',
      'deleteSongList'
    ])
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"
  .up-enter-active, &.up-leave-active
      transition: opacity 0.3s
      .list-wrapper
        transition: all 0.3s
  .up-enter, &.up-leave-to
      opacity: 0
      .list-wrapper
        transform: translate3d(0, 100%, 0)
  .playlist
    position: fixed
    left: 0
    right: 0
    top: 0
    bottom: 0
    z-index: 200
    background-color: $color-background-d
    .list-wrapper
      position: absolute
      left: 0
      bottom: 0
      width: 100%
      background-color: $color-highlight-background
      .list-header
        position: relative
        padding: 20px 30px 10px 20px
        .title
          display: flex
          align-items: center
          .icon
            margin-right: 10px
            font-size: 30px
            color: $color-theme-d
          .text
            flex: 1
            font-size: $font-size-medium
            color: $color-text-l
          .clear
            extend-click()
            .icon-clear
              font-size: $font-size-medium
              color: $color-text-d
      .list-content
        max-height: 240px
        overflow: hidden
        .item
          display: flex
          align-items: center
          height: 40px
          padding: 0 30px 0 20px
          overflow: hidden
          &.list-enter-active, &.list-leave-active
            transition: all 0.1s
          &.list-enter, &.list-leave-to
            height: 0
          .current
            flex: 0 0 20px
            width: 20px
            font-size: $font-size-small
            color: $color-theme-d
          .text
            flex: 1
            no-wrap()
            font-size: $font-size-medium
            color: $color-text-d
          .like
            extend-click()
            margin-right: 15px
            font-size: $font-size-small
            color: $color-theme
            .icon-favorite
              color: $color-sub-theme
          .delete
            extend-click()
            font-size: $font-size-small
            color: $color-theme
      .list-operate
        width: 140px
        margin: 20px auto 30px auto
        .add
          display: flex
          align-items: center
          padding: 8px 16px
          border: 1px solid $color-text-l
          border-radius: 100px
          color: $color-text-l
          .icon-add
            margin-right: 5px
            font-size: $font-size-small-s
          .text
            font-size: $font-size-small
      .list-close
        text-align: center
        line-height: 50px
        background: $color-background
        font-size: $font-size-medium-x
        color: $color-text-l
</style>
