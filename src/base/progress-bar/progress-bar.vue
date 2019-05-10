<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn">
        <div class="progress-btn"
             ref="progressBtnInner"
             @touchstart.prevent="progressStart"
             @touchmove.prevent="progressMove"
             @touchend="progressEnd"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { prefix } from 'common/js/dom'

const transform = prefix('transform')
const progressBtnWidth = 16

export default {
  name: 'progress-bar',
  props: {
    percent: {
      type: Number,
      default: 0
    }
  },
  watch: {
    percent(newPercent) {
      if (newPercent>0 && !this.touch.initiated) {
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        let offsetWidth = barWidth * newPercent
        this._offset(offsetWidth)
      }
    }
  },
  created() {
    this.touch = {}
  },
  methods: {
    progressStart(e) {
      this.touch.initiated = true
      this.touch.startX = e.touches[0].pageX
      this.touch.left = this.$refs.progress.clientWidth
    },
    progressMove(e) {
      if (!this.touch.initiated) return
      // if (document.elementFromPoint(e.touches[0].pageX, e.touches[0].pageY)!== this.$refs.progressBtnInner) return
      this.touch.endX = e.touches[0].pageX
      let delta = this.touch.endX - this.touch.startX
      let offsetWidth = Math.min(Math.max(0, delta + this.touch.left),this.$refs.progressBar.clientWidth - progressBtnWidth)
      this._offset(offsetWidth)
    },  
    progressEnd() {
      this.touch.initiated = false
      this._triggerPercent()
    },
    progressClick(e) {
      let rect = this.$refs.progressBar.getBoundingClientRect()
      let offsetWidth = e.pageX - rect.left
      this._offset(offsetWidth)
      this._triggerPercent()
    },
    _offset(offsetWidth){
      this.$refs.progress.style.width = offsetWidth + 'px'
      this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
    },
    _triggerPercent() {
      let percent = this.$refs.progress.clientWidth / (this.$refs.progressBar.clientWidth - progressBtnWidth)
      this.$emit('percentChange', percent)
    }
  }
}
</script>

<style lang="stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>

