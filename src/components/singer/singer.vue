<template>
  <div class="singer">
    <listview :data="singers"></listview>
  </div>
</template>

<script>
import { getSingerList } from "@/api/singer.js"
import { ERR_OK } from '@/api/config.js'
import { Singer } from 'common/js/singer.js'
import Listview from '@/base/listview/listview'
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
    Listview
  },
  methods: {
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
            id:item.Fsinger_id,
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
          id:item.Fsinger_id,
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
    }
  },
  created() {
    this._getSingerList();
  },
  mounted() {
  }
}
</script>

<style lang="stylus">

</style>
