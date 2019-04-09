<template>
  <div class="singer">
    <listview :data="singers" @select="selectSinger"></listview>
    <loading v-if="!singers.length && $route.path ===   '/singer'"/>
    <!-- <transition name="slide"> -->
      <router-view/>
    <!-- </transition> -->
  </div>
</template>

<script>
import { getSingerList } from "@/api/singer.js"
import { ERR_OK } from '@/api/config.js'
import { Singer } from 'common/js/singer.js'
import Listview from '@/base/listview/listview'
import Loading from '@/base/loading/loading'
import { setTimeout } from 'timers';
import { mapMutations } from 'vuex'
const HOT_NAME = '热门'
const HOT_LIST_LEN = 10
export default {
  name: 'singer',
  data () {
    return {
      singers:[]
    }
  },
  components: {
    Listview,
    Loading
  },
  methods: {
    selectSinger(Singer) {
      this.$router.push(`/singer/${Singer.mid}`)
      this.setSinger(Singer)
    },
    _getSingerList() {
      getSingerList().then((res) => {
        if (res.code === ERR_OK) {
          let list = res.data.list
          this.singers = this._normalizeSingerList(list)
        }  
      })
    },
    _normalizeSingerList(list) {
      let singerList = {
        hot: {
          title: HOT_NAME,
          items: [],
        }
      }
      list.forEach((item,index) => {
        if (index < HOT_LIST_LEN ) {
          singerList.hot.items.push(new Singer({
            name:item.Fsinger_name,
            mid: item.Fsinger_mid
          }))
        }
        if (!singerList[item.Findex]) {
          singerList[item.Findex] = {
            title: item.Findex,
            items: []
          }
        }
        singerList[item.Findex].items.push(new Singer({
          name:item.Fsinger_name,
          mid: item.Fsinger_mid
        }))
      })
      // 为了得到有序列表，我们需要处理 map
      let ret = []
      let hot = []
      for (let key in singerList) {
        let val = singerList[key]
        if (val.title.match(/[a-zA-Z]/)) {
          ret.push(val)
        } else if (val.title === HOT_NAME) {
          hot.push(val)
        }
      }
      ret.sort((a, b) => {
        return a.title.charCodeAt(0) - b.title.charCodeAt(0)
      })
      return hot.concat(ret)
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    })
  },
  created() {
    this._getSingerList();
  },
  mounted() {
  }
}
</script>

<style lang="stylus" scoped>
  .slide-enter-active,.slide-leave-active
    transition: all .3s
  .slide-enter,.slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
