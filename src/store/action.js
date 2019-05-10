import * as types from './mutation-types'
import { playMode } from 'common/js/config'
import { shuffle } from 'common/js/util'
import { saveSearch, deleteSearch, clearSearch, savePlay} from 'common/js/cache'
import { stat } from 'fs';

export function selectPlay({ commit, state }, { list, index }) {
  commit(types.SET_SEQUENCE_LIST, list)
  if(state.mode === playMode.random) {
    var curIndex = state.playlist.findIndex((song) => {
      return song.mid === list[index].mid
    })
    commit(types.SET_CURRENT_INDEX, curIndex)
  } else {
    curIndex = index
    commit(types.SET_PLAYLIST, list)
  }
  commit(types.SET_CURRENT_INDEX, curIndex)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export function randomPlay({ commit }, { list }) {
  commit(types.SET_PLAY_MODE, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list)
  let randomList = shuffle(list) 
  commit(types.SET_PLAYLIST, randomList)
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export function insertSong({ commit, state }, song) {
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  let currentSong = playlist[currentIndex]

  let fpIndex = playlist.findIndex(item => {
    return item.mid === song.mid
  })
  // currentIndex++
  playlist.splice(++currentIndex, 0, song) 
  if (fpIndex>-1) {
    if(fpIndex < currentIndex) {
      playlist.splice(fpIndex, 1)
      currentIndex--
    } else {
      playlist.splice(fpIndex + 1, 1)
    }
  }

  let currentSIndex = sequenceList.findIndex(item => {
    return item.mid === currentSong.mid
  })
  let fsIndex = sequenceList.findIndex(item => {
    return item.mid === song.mid
  })
  sequenceList.splice(++currentSIndex, 0, song)
  if (fsIndex > -1) {
    if(fsIndex < currentSIndex) {
      sequenceList.splice(fsIndex, 1)
    } else {
      sequenceList.splice(fsIndex + 1, 1)
    }
  console.log(sequenceList)
  }
  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export function saveSearchHistory({ commit, state}, query) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

export function deleteSearchHistory({ commit }, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

export function clearSearchHistory({ commit }) {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}

export function deleteSong({ commit, state}, song) {
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex

  let fpIndex = playlist.findIndex(item => {
    return item.mid === song.mid
  })
  playlist.splice(fpIndex, 1)

  let fsIndex = sequenceList.findIndex(item => {
    return item.mid === song.mid
  })
  sequenceList.splice(fsIndex, 1)

  if(currentIndex > fpIndex || currentIndex === playlist.length) {
    currentIndex--
  }
  if(!sequenceList.length) {
    commit(types.SET_PLAYING_STATE, false)
  }

  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
}

export function deleteSongList({ commit }) {
  commit(types.SET_PLAYLIST,[])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_PLAYING_STATE, false)
  commit(types.SET_CURRENT_INDEX, -1)
}

export function savePlayHistory({ commit } ,song) {
  commit(types.SET_PLAT_HISTORY, savePlay(song))
}
 