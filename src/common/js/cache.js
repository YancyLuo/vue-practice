import storage from 'good-storage'

const SEARCH_KEY = '__search__'
const SEARCH_MAX_LEN = 15 

const PLAY_KEY = '__play__'
const PLAY_MAX_LEN = 200

const FAVORITE_KEY = '__favorite__'
const FAVORITE_MAX_LEN = 200

function insertArray(arr, val, compare, maxLen) {
  let index = arr.findIndex(compare)

  if (index === 0) {
    return
  }
  if (index > 0) {
    arr.splice(index, 1)
  }
  arr.unshift(val)
  if (maxLen && arr.length > SEARCH_MAX_LEN) {
    arr.pop()
  }
}

function deleteFromArray(arr, compare) {
  let index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)
  }
}

export function saveSearch(query) {
  let searches = storage.get(SEARCH_KEY, [])
  insertArray(searches, query, (item)=>{
    return item === query
  }, SEARCH_MAX_LEN)
  storage.set(SEARCH_KEY, searches)
  return searches
}

export function deleteSearch(query) {
  let searches = storage.get(SEARCH_KEY, [])
  deleteFromArray(searches,(item)=>{
    return item === query
  })
  storage.set(SEARCH_KEY, searches)
  return searches
}

export function clearSearch() {
  storage.remove(SEARCH_KEY)
  return []
}

export function loadSearch() {
  return storage.get(SEARCH_KEY, [])
}

export function loadPlay() {
  return storage.get(PLAY_KEY, [])
}

export function savePlay(song) {
  let playHistory = storage.get(PLAY_KEY, [])
  insertArray(playHistory, song, (item)=> {
    return item.mid === song.mid
  },PLAY_MAX_LEN)
  storage.set(PLAY_KEY, playHistory)
  return playHistory
}

export function saveFavorite(song) {
  let favoriteList = storage.get(FAVORITE_KEY, [])
  insertArray(favoriteList, song, (item) => {
    return item.mid === song.mid
  },FAVORITE_MAX_LEN)
  storage.set(FAVORITE_KEY, favoriteList)
  return favoriteList
}

export function deleteFavorite(song) {
  let favoriteList = storage.get(FAVORITE_KEY, [])
  deleteFromArray(favoriteList, (item) => {
    return item.mid === song.mid
  })
  storage.set(FAVORITE_KEY, favoriteList)
  return favoriteList
}

export function loadFavorite() {
  return storage.get(FAVORITE_KEY, [])
}
