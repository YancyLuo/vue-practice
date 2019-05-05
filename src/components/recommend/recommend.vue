<template>
  <div class="recommend" ref="recommend">
    <scroll class="recommend-content" ref="scroll">
      <div>
        <swiper :options="swiperOption" v-if="swiperSlides.length>0" class="swiper">
          <swiper-slide v-for="(slide, index) in swiperSlides" :key="index">
            <a :href="slide.linkUrl">
              <img :src="slide.picUrl" @load="loadImage">
            </a>
          </swiper-slide>
          <div class="swiper-pagination" slot="pagination"></div>
        </swiper>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li v-for="(item, index) in discList" 
                class="item" :key="index" 
                @click="selectItem(item)">
              <div class="icon">
                <img width="60" height="60"  v-lazy="item.imgurl">
              </div>
              <div class="text">
                <h2 class="name" v-html="item.creator.name"></h2>
                <p class="desc" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    <loading v-if="!discList.length"></loading>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script>
import Scroll from '@/base/scroll/scroll'
import 'swiper/dist/css/swiper.css'
import Loading from '@/base/loading/loading'
import { swiper, swiperSlide } from 'vue-awesome-swiper'
import { getRecommend, getDiscList } from '@/api/recommend'
import { ERR_OK } from '@/api/config.js'
import { playlistMixin } from 'common/js/mixin'
import { mapMutations } from 'vuex'

export default {
  name: 'recommend',
  mixins: [playlistMixin],
  data () {
    return {
      swiperOption: {
        pagination: {
          el: '.swiper-pagination'
        },
        width: window.innerWidth,
        autoplay: true,
        loop: true
      },
      swiperSlides: [],
      discList: [],
      checkLoad: false
    }
  },
  components: {
    swiper,
    swiperSlide,
    Loading,
    Scroll
  },
  created () {
    this._getRecommend().then((res) => {
      if (res.code === ERR_OK) {
        this.swiperSlides = res.data.slider
      }
    })
    getDiscList().then((res) => {
      if (res.code === ERR_OK) {
        this.discList = res.data.list
      }
    })
  },
  methods: {
    selectItem(item) {
      this.$router.push(`/recommend/${item.dissid}`)
      this.setDisc(item)
    },
    handlePlaylist(playlist) {
      let bottom = playlist.length > 0 ? '60px' : '0px'
      this.$refs.recommend.style.bottom = bottom
      this.$refs.scroll.refresh()
    },
    loadImage () {
      if (!this.checkLoad) {
        this.$refs.scroll.refresh()
        this.checkLoad = true
      }
    },
    _getRecommend () {
      return getRecommend()
    },
    ...mapMutations({
      setDisc: 'SET_DISC'
    })
  },
}
</script>

<style lang="stylus" scoped>
 @import "~common/stylus/variable"
.recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .swiper
        img
          width:100%
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
</style>
