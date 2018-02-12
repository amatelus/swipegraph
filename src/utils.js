const initedClassName = 'swipegraph-isinit';

function getVisiblePlayer(list) {
  const result = [];

  list.forEach((refObject) => {
    if (!refObject.$info || !refObject.$info.autoswipe) return;
    const bounding = refObject.elem.getBoundingClientRect();
    const wh = window.innerHeight;

    if (bounding.top < wh && bounding.top > -bounding.height) result.push(refObject);
  });

  return result;
}

export default {
  initedClassName,
  formatValue(elem, val) {
    const tmpVal = Object.assign(
      ['cid', 'src', 'ref', 'filter']
        .reduce((prev, key) => (Object.assign({}, prev, { [key]: elem.getAttribute(`data-${key}`) })), {}),
      ['fps', 'quality', 'head', 'lazyload', 'swipingwidth', 'autoswipe']
        .reduce((prev, key) => (Object.assign({}, prev, { [key]: JSON.parse(elem.getAttribute(`data-${key}`)) })), {}),
      val,
    );

    const param = {};
    Object.keys(tmpVal).forEach((key) => {
      const value = tmpVal[key];
      if (value === null) return;

      switch (key) {
        case 'src': {
          const fileNameLike = value.match(/\/([^/]+?\.[^/]+?)($|\?)/);
          if (fileNameLike === null) param.src = /\/$/.test(value) ? value.slice(0, -1) : value;
          else param.src = value.slice(0, fileNameLike.index);
          param.iframeSrc = value;
          break;
        }
        case 'cid':
          param.contentId = value;
          break;
        case 'head':
          param.headIndex = value;
          break;
        case 'swipingwidth':
          param.swipingWidth = value;
          break;
        default:
          param[key] = value;
          break;
      }
    });

    return param;
  },
  genInfo(param) {
    const queryString = param.$auth ? `?${param.$auth}` : '';
    return Object.assign(
      {
        queryString,
        cdnQueryString: param.$cdnAuth ? `?${param.$cdnAuth}` : queryString,
        contentId: '',
        headIndex: 0,
        quality: 0.5,
        loop: false,
        muted: false,
        controls: true,
        autoplay: false,
        showingTitle: true,
        swipingWidth: 20,
        filter: '',
        iconcolor: '#E60014',
        iconhover: false,
        allowfullscreen: true,
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
