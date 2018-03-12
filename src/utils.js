const initedClassName = 'swipegraph-isinit';

function getVisiblePlayer(list) {
  const result = [];

  list.forEach((refObject) => {
    const bounding = refObject.elem.getBoundingClientRect();
    const wh = window.innerHeight;

    if (bounding.top < wh && bounding.top > -bounding.height) result.push(refObject);
  });

  return result;
}

export default {
  initedClassName,
  formatValue(elem, val) {
    return Object.assign(
      ['id', 'src', 'ref']
        .reduce((prev, key) => (Object.assign({}, prev, { [key]: elem.getAttribute(`data-${key}`) })), {}),
      ['length', 'autoswipe']
        .reduce((prev, key) => (Object.assign({}, prev, { [key]: JSON.parse(elem.getAttribute(`data-${key}`)) })), {}),
      val,
    );
  },
  genInfo(param) {
    const queryString = param.$auth ? `?${param.$auth}` : '';
    return Object.assign(
      {
        queryString,
        cdnQueryString: param.$cdnAuth ? `?${param.$cdnAuth}` : queryString,
        autoswipe: true,
      },
      param,
    );
  },
  initAutoSwipe(refList) {
    let prevScrollY = 0;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (Math.abs(scrollY - prevScrollY) < 20) return;

      const value = scrollY - prevScrollY < 0 ? -1 : 1;

      getVisiblePlayer(refList).forEach((refObject) => {
        refObject.addSrcIndex(value);
      });

      prevScrollY = scrollY;
    }, false);
  },
  addStyle(elem, style) {
    Object.keys(style).forEach(function(name) {
      elem.style[name] = style[name];
    });
  },
};
