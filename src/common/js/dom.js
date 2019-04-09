export function getData(el, name, val) {
  var attr = 'data-' + name
  if (val) {
    el.setAttribute(attr, val)
  } else {
    return el.getAttribute(attr)
  }
}



export function prefix() {
  let prefix = {
    '-webkit-': '-webkit-transform',
    '-moz-': '-moz-transform',
    '-o-': '-o-transform',
    '-ms-': '-ms-transform',
    'standard': 'transform'
  }
  let elStyle = document.createElement('div').style
  for (let key in prefix) {
    if (elStyle[prefix[key]]=== '') return key
  }
  return false
}
