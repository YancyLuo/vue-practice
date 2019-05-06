// 排行榜详情页
<template>
  <transition appear name="slide">
    <music-list :title="title" :bgImage="bgImage" :songs="songs" :rank="true"></music-list>
  </transition>
  
</template>

<script>
import MusicList from 'components/music-list/music-list'
import { mapGetters } from 'vuex' 
import { getMusicList } from '@/api/rank'
import { ERR_OK } from '@/api/config'
import { createSong, isValidMusic, processSongsUrl } from 'common/js/song'

export default {
  beforeRouteEnter(to, from, next) {
    if (from.path !== '/rank') next('/rank')
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
    title() {
      return this.topList.topTitle
    },
    bgImage() {
      if(this.songs.length) {
        return this.songs[0].image
      }
    },
    ...mapGetters([
      'topList'
    ])
  },
  created() {
    this._getMusicLIst(this.topList.id)
  },
  methods: {
    _getMusicLIst(topid) {
      getMusicList(topid).then(res => {
        if ( res.code === ERR_OK) {
          processSongsUrl(this._normalizeList(res.songlist)).then(songs => {
            this.songs = songs
          })
        }
      })
    },
    _normalizeList(list) {
      let ret = []
      list.forEach(item => {
        let musicData = item.data
        if (isValidMusic(musicData)) {
          let song = createSong(musicData)
          ret.push(song)
        } 
      })
      return ret
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s ease

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>


