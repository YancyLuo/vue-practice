<template>
  <div class="player" v-show="playlist.length > 0">
    <transition name="normal" 
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave">
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle" 
             @touchstart="middleTouchStart"
             @touchmove="middleTouchMove"
             @touchend="middleTouchEnd">
          <div class="middle-l" ref="cd">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdRotate">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :asyncData="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine"
                   class="text"
                   :class="{'current': currentLineNum == index}"
                   v-for="(line, index) in currentLyric.lines"
                   :key="index">{{line.txt}}</p>
              </div>
            </div>
            <div v-if="!currentLyric" class="no-lyric">{{noLyric}}</div>
          </scroll>
        </div>

        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active' : currentShow === 'cd'}"></span>
            <span class="dot" :class="{'active' : currentShow === 'lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{_format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" 
                            @percentChange="onProgressBarChange"
                            @percentChanging="onProgressBarChanging">
              </progress-bar>
            </div>
            <span class="time time-r">{{_format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" :class="disableCls">
              <i :class="iconMode" @click="changeMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i class="icon-prev" @click="prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i :class="playIcon" @click="togglePlaying"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i class="icon-next" @click="next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon" 
                 :class="getFavoriteIcon(currentSong)" 
                 @click.stop="toggleFavorite(currentSong)">
              </i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img :src="currentSong.image" width="40" height="40"  :class="cdRotate">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="32" :percent="percent">
            <i :class="miniPlayIcon" class="icon-mini" @click.stop="togglePlaying"></i>
          </progress-circle>
        </div>
        <div class="control">
          <i class="icon-playlist" @click.stop="showPlaylist"></i>
        </div>
      </div>
    </transition>
    <playlist ref="playlist"></playlist>
    <audio @canplay="ready" 
           @error="error" 
           @timeupdate="updateTime"
           :src="currentSong.url" 
           ref="audio"
           @ended="end"></audio>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import animations from 'create-keyframe-animation'
import { prefix } from 'common/js/dom'
import ProgressBar from '@/base/progress-bar/progress-bar'
import ProgressCircle from '@/base/progress-circle/progress-circle'
import { playMode } from 'common/js/config'
import Lyric from 'lyric-parser'
import Scroll from '@/base/scroll/scroll'
import Playlist from 'components/playlist/playlist'
import { playerMixin } from 'common/js/mixin'
import { clearTimeout } from 'timers';

const transform = prefix('transform')
const transition = prefix('transition')

export default {
  name: 'player',
  mixins: [playerMixin],
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll,
    Playlist
  },
  data() {
    return {
      songReady: false,
      currentTime: 0,
      currentLyric: null,
      currentLineNum: 0,
      currentShow: 'cd',
      playingLyric: '',
      noLyric: '此歌曲为没有填词的纯音乐，请您欣赏'
    }
  },
  created() {
    this.touch = {}
  },
  computed: {
    playIcon() {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    miniPlayIcon() {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    cdRotate() {
      return this.playing ? 'play' : 'play pause'
    },
    disableCls() {
      return this.songReady ? '' : 'disable'
    },
    percent() {
      return this.currentTime / this.currentSong.duration
    },
    ...mapGetters([
      'fullScreen', 
      'playlist', 
      'currentSong', 
      'playing',
      'currentIndex',
    ])
  },
  methods:{
    showPlaylist() {
      this.$refs.playlist.show()
    },
    middleTouchStart(e) {
      this.touch.initiated = true
      let touch = e.touches[0]
      this.touch.startX = touch.pageX
      this.touch.startY = touch.pageY
    },
    middleTouchMove(e) {
      if (!this.touch.initiated) return
      let touch = e.touches[0]
      let deltaX = touch.pageX - this.touch.startX
      let deltaY = touch.pageY - this.touch.startY
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        return
      }
      let left = this.currentShow === 'cd' ? 0 : -window.innerWidth
      let offsetLeft = Math.min(Math.max(-window.innerWidth, left + deltaX), 0)
      this.touch.percent = Math.abs(offsetLeft / window.innerWidth)
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetLeft}px, 0, 0)`
      this.$refs.cd.style.opacity = 1 - this.touch.percent
      this.$refs.cd.style[transition] = 'opcaty 0s'
      this.$refs.lyricList.$el.style[transition] = 'transform 0s'
    },
    middleTouchEnd(e) {
      if (!this.touch.percent) return
      let offsetLeft
      let currentShow
      let percent
      if (this.currentShow === 'cd') {
        if (this.touch.percent > 0.1) {
          offsetLeft = -window.innerWidth
          currentShow = 'lyric'
          percent = 1
        } else {
          offsetLeft = 0
          currentShow = 'cd'
          percent = 0
        }
      }
      if (this.currentShow === 'lyric') {
        if (this.touch.percent < 0.9) {
          offsetLeft = 0
          currentShow = 'cd'
          percent = 0
        } else {
           offsetLeft = -window.innerWidth
           currentShow = 'lyric'
           percent = 1
        }
      }
      this.currentShow = currentShow
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetLeft}px, 0, 0)`
      this.$refs.lyricList.$el.style[transition] = 'transform .3s'
      this.$refs.cd.style.opacity = 1 - percent
      this.$refs.cd.style[transition] = 'opcaty .3s'
      this.touch = {}
    },
    // changeMode(){
    //   this.setPlayMode((this.mode + 1) % 3)
    //   console.log(this.sequenceList)
    //   let list = this.sequenceList
    //   if (this.mode === playMode.random) {
    //     list = shuffle(this.sequenceList)
    //   }
    //   this._resetCurrentIndex(list)
    //   this.setPlayList(list)
    // }, 
    back() {
      this.setFullscreen(false)
    },
    open() {
      this.setFullscreen(true)
    },
    togglePlaying() {
      if(this.disableCls) return
      this.setPlaying(!this.playing)
      if (this.currentLyric) {
        this.currentLyric.togglePlay()
      }
    },
    ready() {
      this.songReady = true
      this.savePlayHistory(this.currentSong)
    },
    error() {
      this.songReady = true
    },
    updateTime(e) {
      this.currentTime = e.target.currentTime
    },
    end() {
      if (this.mode === playMode.loop) {
        this.loop()
      } else {
        this.next()
      }
    },
    loop() {
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()
      if (this.currentLyric) {
        this.currentLyric.seek(0)
      }
    },
    prev() {
      if(this.disableCls) return
      if (this.mode === playMode.loop) {
        this.loop()
      } else {
        if(this.playlist.length === 1) {
          this.loop()
          return
        } 
        if (!this.songReady) return
        let index = this.currentIndex - 1
        if (index<0) {
          index = this.playlist.length - 1
        }
        this.setCurrentIndex(index)
        this.songReady = false
      }
    },
    next() {
      if(this.disableCls) return
      if (this.mode === playMode.loop) {
        this.loop()
      } else {
        if(this.playlist.length === 1) {
          this.loop()
          return
        } 
        if (!this.songReady) return
        let index = this.currentIndex + 1
        if (index > this.playlist.length - 1) {
          index = 0
        }
        this.setCurrentIndex(index)
        this.songReady = false
      }
    },
    onProgressBarChange(percent) {
      if (!this.playing) this.togglePlaying()
      if (this.currentLyric) {
        this.currentLyric.seek(this.currentSong.duration * percent * 1000)
      }
      this.$refs.audio.currentTime = this.currentSong.duration * percent
    },
    onProgressBarChanging(percent) {
      if (this.currentLyric) {
        this.currentLyric.seek(this.currentSong.duration * percent * 1000)
      }
    },
    enter(el, done) {
      const {x, y, scale} = this._getPosAndScale()
      let animation = {
        0: {
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        },
        60: {
          transform: `scale(1.1)`
        },
        100: {
          transform: `scale(1)`
        }
      }
      animations.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 400,
          easing: 'linear'
        }
      })
      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },
    afterEnter() {
      animations.unregisterAnimation('move')
      this.$refs.cdWrapper.style.animation = ''
    },
    leave(el, done) {
      this.$refs.cdWrapper.style.transition = 'all 0.4s'
      const {x, y, scale} = this._getPosAndScale()
      this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
      this.$refs.cdWrapper.addEventListener('transitionend', done)
    },
    afterLeave() {
      this.$refs.cdWrapper.style.transition = ''
      this.$refs.cdWrapper.style[transform] = ''
    },
    getLyric() {
      this.currentSong.getLyric().then((lyric) => {
        console.log(lyric)
        if(lyric !== this.currentSong.lyric) return
        if(lyric.length <= 100 || lyric.slice(0,1) !== '[') {
          this.playingLyric = this.noLyric
          return
        }
        this.currentLyric = new Lyric(lyric, this.handleLyric) //歌词每一行发生改变的时候触发回调函数
        if (this.playing) {
          this.currentLyric.play()
        }
        // console.log(this.currentLyric)
      }).catch((e) => {
        this.currentLyric = null
        this.playingLyric = ''
        this.currentLineNum = 0
        this.noLyric = '抱歉，暂未获取到歌词'
        console.log(e)
      })
    },
    handleLyric({lineNum, txt}) {
      
      this.currentLineNum = lineNum
      this.playingLyric = txt
      if (lineNum > 5) {
        let lineEl = this.$refs.lyricLine[lineNum - 5]
        this.$refs.lyricList.scrollToElement(lineEl, 1000)
      } else {
        this.$refs.lyricList.scrollTo(0, 0, 1000)
      }
    },
    ...mapMutations({
      setFullscreen: 'SET_FULL_SCREEN',
      setPlaying: 'SET_PLAYING_STATE',
    }),
    ...mapActions([
      'savePlayHistory'
    ]),
    _getPosAndScale() {
      const targetWidth = 40
      const width = window.innerWidth * 0.8
      const paddingLeft = 40
      const paddingBottom = 30
      const paddingTop = 80
      const x = -(window.innerWidth / 2 - paddingLeft)
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
      const scale = targetWidth / width
      return {
        x,
        y,
        scale
      }
    },
    _format(time) {
      let min = Math.floor(time / 60)
      let sec = Math.floor(time % 60)
      if(sec.toString().length === 1) {
        sec = '0' + sec
      }
      return min + ':' + sec
    },
  },
  watch: {
    currentSong(newSong, oldSong) {
      if (newSong.mid === oldSong.mid || !newSong.mid) return
      this.setPlaying(true)
      this.currentTime = 0
      if (this.currentLyric) {
        this.currentLyric.stop()
        this.currentLyric = null
        this.playingLyric = ''
        this.currentLineNum = 0
      }
      // window.clearTimeout(this.timer)
      // this.timer = setTimeout(() => {
        this.$nextTick(()=> {
          this.$refs.audio.play()
          this.getLyric()
        })
        
      // },5000)
    },
    playing() {
      let audio = this.$refs.audio
      this.$nextTick(() => {
        this.playing ? audio.play() : audio.pause()
      })
    },
    fullScreen(newVal) {
      if (newVal) {
        setTimeout(() => {
          this.$refs.lyricList.refresh()
        },20)
      }
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
          .no-lyric
            color: $color-text-l
            position: absolute
            top: 50%
            margin-top: -16px
            line-height: 32px
            width: 100%
            text-align: center
            font-size: $font-size-medium
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        // margin-top: -10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>

