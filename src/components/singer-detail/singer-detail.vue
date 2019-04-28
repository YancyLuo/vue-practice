<template>
  <transition name="slide" appear>
    <music-list :songs="songs" :title="singer.name" :bgImage="singer.avatar"></music-list>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'
import { getSingerDetail } from '@/api/singer'
import { ERR_OK } from '@/api/config'
import { createSong, isValidMusic, processSongsUrl } from 'common/js/song'
import MusicList from 'components/music-list/music-list'

export default {
  name: 'singer-detail',
  props: ['mid'],
  beforeRouteEnter(to, from, next) {
    if (from.path !== '/singer') next('/singer')
    else next()
  },
  components: {
    MusicList
  },
  data() {
    return {
      songs: []
    }
  },
  computed: {
    ...mapGetters([
      'singer'
    ])
  },
  created() {
    this._getSingerDetail(this.mid).then((res) => {
      if (res.code === ERR_OK) {
        // this.songs = this._normalizeSongs(res.data.list)
        processSongsUrl(this._normalizeSongs(res.data.list)).then((songs) => {
          this.songs = songs
        })
      }
    })
  },
  methods: {
    _getSingerDetail(mid) {
      return getSingerDetail(mid)
    },
    // _normalizeSongs(list) {
    //   let ret = []
    //     list.forEach((item) => {
    //       let { musicData } = item
    //       if (musicData.songid && musicData.albummid) {
    //         ret.push(createSong(musicData))
    //       }
    //     })
    //   return ret
    // }
    _normalizeSongs(list) {
        let ret = []
        list.forEach((item) => {
          let {musicData} = item
          if (isValidMusic(musicData)) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
  }
}
</script>

<style scoped lang="stylus">
  .slide-enter-active,.slide-leave-active
    transition: all .3s
  .slide-enter,.slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
