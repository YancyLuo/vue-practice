<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script>
import BScroll from 'better-scroll'
export default {
  name: 'scroll',
  props: {
    probeType: {
        type: Number,
        default: 1
      },
      click: {
        type: Boolean,
        default: true
      },
      listenScroll: {
        type: Boolean,
        default: false
      },
      asyncData: {
        type: Array,
        default: null
      }
  },
  // data() {
  //   return {
  //     scroll: null
  //   }
  // },
  mounted() {
    setTimeout(() => {
      this._initScroll()
    }, 20)
  },
  methods: {
    _initScroll() {
      if (!this.$refs.wrapper) return
      this.scroll = new BScroll(this.$refs.wrapper, {
        probeType: this.probeType,
        click: this.click
      })
      if (this.listenScroll) {
        let me = this
        this.scroll.on('scroll', (pos) => {
          me.$emit('scroll', pos)
        })
      }
    },
    disable() {
      this.scroll && this.scroll.disable()
    },
    enable() {
      this.scroll && this.scroll.enable()
    },
    refresh() {
      console.log('refresh')
      this.scroll && this.scroll.refresh()
    },
    scrollToElement(el, time) {
      this.scroll && this.scroll.scrollToElement(el, time)
    },
    scrollTo(x, y, time) {
      this.scroll && this.scroll.scrollTo(x, y, time)
    }
  },
  watch: {
    asyncData() {
      setTimeout(() => {
        this.refresh()
      }, 20)
    }
  }
}
</script>

