export function getData(el, name, val) {
  var attr = 'data-' + name
  if (val) {
    el.setAttribute(attr, val)
  } else {
    return el.getAttribute(attr)
  }
}