<template>
  <scroll class="suggest" 
          :asyncData="result" 
          :pullup="true"
          @scrollToEnd="searchMore"
          ref="suggest"
          :beforeScroll="true"
          @beforeScroll="listScroll">
    <ul class="suggest-list">
      <li class="suggest-item" @click="selectItem(item)" v-for="(item, index) in result" :key="index">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading title="" v-show="hasMore"></loading>
    </ul>
    <div class="no-result-wrapper" v-show="showNo">
      <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
  </scroll>
</template>

<script>
import { search } from '@/api/search'
import { ERR_OK } from '@/api/config'
import { createSong, isValidMusic, processSongsUrl } from 'common/js/song'
import Scroll from '@/base/scroll/scroll'
import Loading from '@/base/loading/loading'
import { Singer } from 'common/js/singer'
import { mapMutations, mapActions } from 'vuex'
import NoResult from '@/base/no-result/no-result'

const TYPE_SINGER = 'singer'
const perpage = 20

export default {
  components: {
    Scroll,
    Loading,
    NoResult
  },
  props: {
    query: {
      type: String,
      default: ''
    },
    isShowSinger: {
      type: Boolean,
      default :true
    }
  },
  data() {
    return {
      page: 1,
      result: [],
      hasMore: true,
      showNo: false
    }
  },
  watch: {
    query(n) {
      this._search()
    }
  },
  methods: {
    refresh(){
      this.$refs.suggest.refresh()
    },
    listScroll() {
      this.$emit('listScroll')
    },
    selectItem(item) {
      if (item.type === TYPE_SINGER) {
       let singer = new Singer({
          name: item.singername,
          mid: item.singermid
        })
        this.setSinger(singer)
        this.$router.push(`/search/${singer.mid}`)
      } else {
        this.insertSong(item)
      }
      this.$emit('select')
    },
    getIconCls(item) {
      if (item.type === TYPE_SINGER) {
        return 'icon-mine'
      } else {
        return 'icon-music'
      }
    },
    getDisplayName(item) {
      if (item.type === TYPE_SINGER) {
        return item.singername
      } else {
        return `${item.singer}`
      }
    },
    searchMore() {
      if (!this.hasMore) {
        return
      }
      this.page++
      search(this.query, this.page, this.isShowSinger, perpage).then(res => {
        if (res.code === ERR_OK) {
          this._genResult(res.data)
        }
      })
    },
    _search() {
      this.page = 1
      this.hasMore = true
      this.result = []
      this.showNo = false
      search(this.query, this.page, this.isShowSinger, perpage).then(res => {
        if (res.code === ERR_OK) {
          this._genResult(res.data)
        }
      })
    },
    _checkMore(data) { 
      let songs = data.song
      if (perpage * songs.curpage >= songs.totalnum) {
        this.hasMore = false
      }
    },
     _genResult(data) {
      let ret = []
      if (data.zhida && data.zhida.singerid) {
        ret.push({...data.zhida,...{type: TYPE_SINGER}})
      }
      if (data.song) {
        processSongsUrl(this._normalizeList(data.song.list)).then(songs => {
          this.result = this.result.concat(ret.concat(songs))
          // console.log(this.result)
          if (!this.result.length) {
            this.showNo = true
            return
          }
          if(this.result.length<20) {
            this.searchMore()
          }
        }).catch(err=>{
          // console.log(this.result.length)
          if (!this.result.length) {
             this.showNo = true
          } else {
            if(this.result.length<20) {
              this.searchMore()
            }
          }
        })
      }
      this._checkMore(data)
    },
    _normalizeList(list) {
      let songs = []
      list.forEach(musicData => {
        if (isValidMusic(musicData)) {
          songs.push(createSong(musicData))
        }  
      })
      return songs
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    }),
    ...mapActions([
      'insertSong'
    ])
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
