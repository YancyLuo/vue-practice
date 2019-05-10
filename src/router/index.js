import Vue from 'vue'
import Router from 'vue-router'
import Rank from 'components/rank/rank'
import Recommend from 'components/recommend/recommend'
import Search from 'components/search/search'
import Singer from 'components/singer/singer'
import SingerDetail from 'components/singer-detail/singer-detail'
import Disc from 'components/disc/disc'
import TopList from 'components/top-list/top-list'
import UserCenter from 'components/user-center/user-center'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/recommend',
    },
    {
      path: '/recommend',
      component: Recommend,
      children: [
        {
          path: ':id',
          component: Disc
        }
      ]
    },
    {
      path: '/search',
      component: Search,
      children: [
        {
          path: ':mid',
          component: SingerDetail,
          props: true
        }
      ]
    },
    {
      path: '/rank',
      component: Rank,
      children:[
        {
        path: ':id',
        component: TopList
        }
      ]
    },
    {
      path: '/singer',
      component: Singer,
      children: [
        {
          path: ':mid',
          component: SingerDetail,
          props: true
        }
      ]
    },
    {
      path: '/user',
      component: UserCenter
    }
  ]
})
