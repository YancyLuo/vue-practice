<template>
  <scroll class="listview" 
          :asyncData="data" 
          :listenScroll="true" 
          :probeType="3"
          ref="scroll"
          @scroll="scroll">
     <ul>
      <li v-for="group in data" class="list-group" ref="listGroup" :key="group.title">
        <h2 class="list-group-title">{{group.title}}</h2>
        <uL>
          <li v-for="item in group.items" class="list-group-item" :key="item.name">
            <img class="avatar" v-lazy="item.avatar">
            <span class="name">{{item.name}}</span>
          </li>
        </uL>
      </li>
    </ul>
    <div class="list-shortcut" @touchstart.stop.prevent="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
      <ul>
        <li class="item"
            :class="{'current':curIndex===index}"
            v-for="(item, index) in shortcutList" 
            :data-index="index" 
            :key="index">
          {{item}}
        </li>
      </ul>
    </div>
    <div class="list-fixed" ref="fixed" v-show="fixedTitle">
      <div class="fixed-title">{{fixedTitle}}</div>
    </div>
  </scroll>
</template>

<script>
import { getData } from 'common/js/dom.js'
import Scroll from '@/base/scroll/scroll'
import { setTimeout } from 'timers';
// import { setTimeout } from 'timers';

const ANCHOR_HEIGHT = 18
const TITLE_HEIGHT = 30
export default {
  name: 'listview',
  created() {
    this.touch = {}
    this.listHeight = []
  },
  props: {
    data: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      scrollY: -1,
      curIndex: 0
    }
  },
  computed: {
    shortcutList() {
      return this.data.map((item) => {
        return item.title.slice(0, 1)
      })
    },
    fixedTitle() {
      if (this.scrollY > 0) return ''
      return this.data[this.curIndex] ? this.data[this.curIndex].title : ''
    }
  },
  watch: {
    data() {
      setTimeout(() => {
        this._calculateHeight()
      },20)
    },
    // scrollY(newY) {
    //   console.log('new',newY)
    // }
  },
  components: {
    Scroll
  },
  methods: {
    onShortcutTouchStart(e) {
      let index = parseInt(getData(e.target, 'index'))
      if (!index && index !=0) return
      this.touch.y1 = e.touches[0].pageY
      this.touch.firstTouch = index || 0
      this._scrollTo(index)
    },
    onShortcutTouchMove(e) {
      this.touch.y2 = e.touches[0].pageY
      let delta = Math.floor((this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT)
      this._scrollTo(this.touch.firstTouch + delta)
    },
    scroll(pos) {
      let scrollY = pos.y
      this.scrollY = scrollY
      const listHeight = this.listHeight
      if (scrollY > 0) {
        this.curIndex = 0 
        return
      }
      if (scrollY <= -listHeight[listHeight.length - 1]) {
         this.curIndex = this.data[this.data - 1]
         return
      }
      
      for (var i = 0 ; i < listHeight.length - 1; i++) {
        let height1 = listHeight[i]
        let height2 = listHeight[i + 1] 
        let diff = height2 + scrollY
        if (diff > TITLE_HEIGHT) diff = 30
        if (diff <= TITLE_HEIGHT) this.$refs.fixed.style.transform = `translate3d(0,-${TITLE_HEIGHT - diff}px,0)`
        if (-scrollY > height1 && -scrollY < height2 ) {
          this.curIndex = i
          return
        }
      }
    },
    _scrollTo(index) {
      if (index < 0) index = 0
      if (index > this.listHeight.length - 1) index = this.listHeight.length - 2
      this.curIndex = index
      this.$refs.scroll.scrollToElement(this.$refs.listGroup[index])
    },
    _calculateHeight() {
      this.listHeight = []
      const list = this.$refs.listGroup
      let height = 0
      this.listHeight.push(height)
      for ( var i = 0 ; i < list.length ; i++ ) {
        height += list[i].clientHeight
        this.listHeight.push(height)
      }
    }
  },
  mounted() {
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
 @import "~common/stylus/variable"
  .listview
    position: fixed
    top:88px
    left:0
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
