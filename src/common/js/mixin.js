import { mapGetters, mapMutations, mapActions} from 'vuex'
import { playMode } from 'common/js/config'
import { shuffle } from 'common/js/util'

export const playlistMixin = {
  computed: {
    ...mapGetters(['playlist'])
  },
  mounted() {
    this.handlePlaylist(this.playlist)
  },
  activated() {
    this.handlePlaylist(this.playlist)
  },
  watch: {
    playlist(newVal) {
      this.handlePlaylist(newVal)
    }
  },
  methods: {
    handlePlaylist() {
      throw new Error('component must implement handlePlaylist method')
    }
  }
}

export const playerMixin = {
  computed: {
    iconMode() {
      switch (this.mode) {
        case playMode.sequence : return 'icon-sequence'
        case playMode.loop : return 'icon-loop'
        default :return 'icon-random'
      }
    },
    ...mapGetters([
      'mode',
      'sequenceList',
    ])
  },
  methods: {
    changeMode(){
      this.setPlayMode((this.mode + 1) % 3)
      let list = this.sequenceList
      if (this.mode === playMode.random) {
        list = shuffle(this.sequenceList)
      }
      this._resetCurrentIndex(list)
      this.setPlayList(list)
    },
    _resetCurrentIndex(list) {
      let index = list.findIndex((item) => {
        return item.mid === this.currentSong.mid
      })
       this.setCurrentIndex(index)
    },
    ...mapMutations({
      setPlayList: 'SET_PLAYLIST' ,
      setPlayMode: 'SET_PLAY_MODE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
    })
  }
}

export const searchMixin = {
  data() {
    return {
      query: ''
    }
  },
  computed: {
    ...mapGetters([
      'searchHistory'
    ])
  },
  methods: {
    saveSearch() {
      this.saveSearchHistory(this.query)
      if(this.$el.className === 'add-song') {
        this.$refs.topTip.show()
        this.setFullScreen(false)
      }
    },
    blurInput() {
      this.$refs.searchBox.blur()
    },
    onQueryChange(query) {
      this.query = query
    },
    addQuery(query) {
      this.$refs.searchBox.setQuery(query)
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory'
    ]),
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN'
    })
  }
}