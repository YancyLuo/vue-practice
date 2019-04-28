//获取歌曲地址时需要的guid，copy qq音乐的获取方法并去掉cookie 的部分

let _uid = ''

export function getUid() {
  if (_uid) {
    return _uid
  }
  if (!_uid) {
    const t = (new Date()).getUTCMilliseconds()
    _uid = '' + Math.round(2147483647 * Math.random()) * t % 1e10
  }
  return _uid
}
