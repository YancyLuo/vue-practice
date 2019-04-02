import originJSONP from 'jsonp'

export default function jsonp(url, data, option) {
  let path = joinPath(url, data)
  return new Promise((resolve, reject) => {
    originJSONP(path, option, (err, res) => {
      if(!err) {
        resolve(res)
      }else {
        reject(err)
      }
    })
  })
}

function joinPath(url, data) {
  if(data == {})  return
  for(var i in data) {
    url += `${i == 0 ? '?' : '&'}${data[i] !== undefined ? data[i] : ''}`
  }
}