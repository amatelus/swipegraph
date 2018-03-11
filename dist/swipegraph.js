(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.swipegraph = factory());
}(this, (function () { 'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

function sendMessage(refObject, type, value) {
  if (refObject.$iframe && refObject.$iframe.contentWindow) {
    refObject.$iframe.contentWindow.postMessage({
      type: type,
      value: value
    }, '*');
  } else refObject.dispatch('$' + type, value);
}

var _class = function () {
  function _class(elem) {
    classCallCheck(this, _class);

    this.elem = elem;
    this.readyState = 'waiting';
    this.$iframe = null;
    this.$isInit = false;
    this.$info = null;
    this.$eventList = {};
  }

  createClass(_class, [{
    key: '$setInfo',
    value: function $setInfo(info, originalInfo) {
      this.$info = info;
      this.readyState = 'loadedinfo';
      this.dispatch('loadedinfo', originalInfo);
      if (info.autoplay) this.$init();
    }
  }, {
    key: '$setMounted',
    value: function $setMounted() {
      this.readyState = 'mounted';
      this.dispatch('mounted', null);
    }
  }, {
    key: '$setIframe',
    value: function $setIframe(iframe) {
      if (this.readyState !== 'mounted') this.$setMounted(); // autoplay or play before lazyloaded
      this.$iframe = iframe;
      this.readyState = 'loading';
      this.dispatch('loadstart', null);
    }
  }, {
    key: '$iframeDidMount',
    value: function $iframeDidMount() {
      this.readyState = 'loaded';
      this.dispatch('loaded', null);
      this.requestFullscreen();
    }
  }, {
    key: '$init',
    value: function $init() {
      this.$isInit = true;
    }
  }, {
    key: 'addSrcIndex',
    value: function addSrcIndex(value) {
      sendMessage(this, 'addSrcIndex', value);
      return this;
    }
  }, {
    key: 'setSrcIndex',
    value: function setSrcIndex(value) {
      sendMessage(this, 'setSrcIndex', value);
      return this;
    }
  }, {
    key: 'setFilter',
    value: function setFilter(value) {
      sendMessage(this, 'setFilter', value);
      return this;
    }
  }, {
    key: 'setPosterIndex',
    value: function setPosterIndex(value) {
      sendMessage(this, 'setPosterIndex', value);
      return this;
    }
  }, {
    key: 'detach',
    value: function detach() {
      if (this.$iframe) {
        this.$iframe.contentWindow.postMessage({ type: 'detach' }, '*');
      }
      this.dispatch('$detach');
    }
  }, {
    key: 'on',
    value: function on(type, callback) {
      this.$eventList[type] = this.$eventList[type] || [];
      this.$eventList[type].push(callback);
      return this;
    }
  }, {
    key: 'off',
    value: function off(type, callback) {
      if (this.$eventList[type]) {
        var index = this.$eventList[type].indexOf(callback);
        if (index !== -1) this.$eventList[type].splice(index, 1);
      }

      return this;
    }
  }, {
    key: 'one',
    value: function one(type, callback) {
      var _this = this;

      var fn = function fn(e) {
        callback.call(_this, e);
        _this.off(type, fn);
      };
      this.on(type, fn);
      return this;
    }
  }, {
    key: 'getInfo',
    value: function getInfo(callback) {
      var _this2 = this;

      if (this.readyState === 'waiting') this.one('loadedinfo', function (e) {
        callback.call(_this2, e.value);
      });else callback.call(this, this.$info);
      return this;
    }
  }, {
    key: 'dispatch',
    value: function dispatch(type, value) {
      var _this3 = this;

      if (this.$eventList[type]) {
        this.$eventList[type].forEach(function (callback) {
          callback.call(_this3, { type: type, value: value, target: _this3 });
        });
      }

      return this;
    }
  }]);
  return _class;
}();

var initedClassName = 'swipegraph-isinit';

function getVisiblePlayer(list) {
  var result = [];

  list.forEach(function (refObject) {
    if (!refObject.$info || !refObject.$info.autoswipe) return;
    var bounding = refObject.elem.getBoundingClientRect();
    var wh = window.innerHeight;

    if (bounding.top < wh && bounding.top > -bounding.height) result.push(refObject);
  });

  return result;
}

var utils = {
  initedClassName: initedClassName,
  formatValue: function formatValue(elem, val) {
    var tmpVal = Object.assign(['cid', 'src', 'ref', 'filter'].reduce(function (prev, key) {
      return Object.assign({}, prev, defineProperty({}, key, elem.getAttribute('data-' + key)));
    }, {}), ['fps', 'quality', 'head', 'lazyload', 'swipingwidth', 'autoswipe'].reduce(function (prev, key) {
      return Object.assign({}, prev, defineProperty({}, key, JSON.parse(elem.getAttribute('data-' + key))));
    }, {}), val);

    var param = {};
    Object.keys(tmpVal).forEach(function (key) {
      var value = tmpVal[key];
      if (value === null) return;

      switch (key) {
        case 'src':
          {
            var fileNameLike = value.match(/\/([^/]+?\.[^/]+?)($|\?)/);
            if (fileNameLike === null) param.src = /\/$/.test(value) ? value.slice(0, -1) : value;else param.src = value.slice(0, fileNameLike.index);
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
  genInfo: function genInfo(param) {
    var queryString = param.$auth ? '?' + param.$auth : '';
    return Object.assign({
      queryString: queryString,
      cdnQueryString: param.$cdnAuth ? '?' + param.$cdnAuth : queryString,
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
      autoswipe: true
    }, param);
  },
  initAutoSwipe: function initAutoSwipe(refList) {
    var prevScrollY = 0;

    window.addEventListener('scroll', function () {
      var scrollY = window.scrollY;
      if (Math.abs(scrollY - prevScrollY) < 20) return;

      var value = scrollY - prevScrollY < 0 ? -1 : 1;

      getVisiblePlayer(refList).forEach(function (refObject) {
        refObject.addSrcIndex(value);
      });

      prevScrollY = scrollY;
    }, false);
  },
  addStyle: function addStyle(elem, style) {
    Object.keys(style).forEach(function (name) {
      elem.style[name] = style[name];
    });
  }
};

var loadingSvg = "<svg style=\"position:absolute;top:50%;left:50%;margin:-100px 0 0 -100px;\" width=\"200\" height=\"200\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"0 0 100 100\" preserveAspectRatio=\"xMidYMid\"><g transform=\"rotate(0 50 50)\">\n<rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#5699d2\">\n  <animate attributeName=\"opacity\" values=\"1;0\" times=\"0;1\" dur=\"1s\" begin=\"-0.9166666666666666s\" repeatCount=\"indefinite\"></animate>\n</rect>\n</g><g transform=\"rotate(30 50 50)\">\n<rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#5699d2\">\n  <animate attributeName=\"opacity\" values=\"1;0\" times=\"0;1\" dur=\"1s\" begin=\"-0.8333333333333334s\" repeatCount=\"indefinite\"></animate>\n</rect>\n</g><g transform=\"rotate(60 50 50)\">\n<rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#5699d2\">\n  <animate attributeName=\"opacity\" values=\"1;0\" times=\"0;1\" dur=\"1s\" begin=\"-0.75s\" repeatCount=\"indefinite\"></animate>\n</rect>\n</g><g transform=\"rotate(90 50 50)\">\n<rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#5699d2\">\n  <animate attributeName=\"opacity\" values=\"1;0\" times=\"0;1\" dur=\"1s\" begin=\"-0.6666666666666666s\" repeatCount=\"indefinite\"></animate>\n</rect>\n</g><g transform=\"rotate(120 50 50)\">\n<rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#5699d2\">\n  <animate attributeName=\"opacity\" values=\"1;0\" times=\"0;1\" dur=\"1s\" begin=\"-0.5833333333333334s\" repeatCount=\"indefinite\"></animate>\n</rect>\n</g><g transform=\"rotate(150 50 50)\">\n<rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#5699d2\">\n  <animate attributeName=\"opacity\" values=\"1;0\" times=\"0;1\" dur=\"1s\" begin=\"-0.5s\" repeatCount=\"indefinite\"></animate>\n</rect>\n</g><g transform=\"rotate(180 50 50)\">\n<rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#5699d2\">\n  <animate attributeName=\"opacity\" values=\"1;0\" times=\"0;1\" dur=\"1s\" begin=\"-0.4166666666666667s\" repeatCount=\"indefinite\"></animate>\n</rect>\n</g><g transform=\"rotate(210 50 50)\">\n<rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#5699d2\">\n  <animate attributeName=\"opacity\" values=\"1;0\" times=\"0;1\" dur=\"1s\" begin=\"-0.3333333333333333s\" repeatCount=\"indefinite\"></animate>\n</rect>\n</g><g transform=\"rotate(240 50 50)\">\n<rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#5699d2\">\n  <animate attributeName=\"opacity\" values=\"1;0\" times=\"0;1\" dur=\"1s\" begin=\"-0.25s\" repeatCount=\"indefinite\"></animate>\n</rect>\n</g><g transform=\"rotate(270 50 50)\">\n<rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#5699d2\">\n  <animate attributeName=\"opacity\" values=\"1;0\" times=\"0;1\" dur=\"1s\" begin=\"-0.16666666666666666s\" repeatCount=\"indefinite\"></animate>\n</rect>\n</g><g transform=\"rotate(300 50 50)\">\n<rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#5699d2\">\n  <animate attributeName=\"opacity\" values=\"1;0\" times=\"0;1\" dur=\"1s\" begin=\"-0.08333333333333333s\" repeatCount=\"indefinite\"></animate>\n</rect>\n</g><g transform=\"rotate(330 50 50)\">\n<rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#5699d2\">\n  <animate attributeName=\"opacity\" values=\"1;0\" times=\"0;1\" dur=\"1s\" begin=\"0s\" repeatCount=\"indefinite\"></animate>\n</rect>\n</g></svg>";

var addStyle = utils.addStyle;

var _class$1 = function () {
  function _class() {
    classCallCheck(this, _class);

    this.loaded = 0;
    this.total = 1;
    var container = document.createElement('div');
    addStyle(container, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%,70px)'
    });

    var text = document.createElement('div');
    addStyle(text, {
      textAlign: 'center',
      color: '#555',
      fontSize: '12px'
    });
    text.innerText = '/';
    container.appendChild(text);

    var barFrame = document.createElement('div');
    addStyle(barFrame, {
      width: '200px',
      height: '5px',
      background: '#ccc',
      marginTop: '5px',
      position: 'relative'
    });
    container.appendChild(barFrame);

    var bar = document.createElement('div');
    addStyle(bar, {
      width: '0px',
      height: '100%',
      background: '#5699d2',
      position: 'absolute',
      top: 0,
      left: 0
    });
    barFrame.appendChild(bar);

    this.container = container;
    this.textElem = text;
    this.barElem = bar;
  }

  createClass(_class, [{
    key: 'update',
    value: function update(loaded, total) {
      this.textElem.innerText = Math.floor(loaded / 102.4 / 1024) / 10 + ' / ' + Math.floor(total / 102.4 / 1024) / 10 + 'MB';
      this.barElem.style.width = loaded / total * 100 + '%';
    }
  }]);
  return _class;
}();

var addStyle$1 = utils.addStyle;

var _class$2 = function () {
  function _class() {
    classCallCheck(this, _class);

    this.loaded = 0;
    this.total = 1;
    var container = document.createElement('div');
    addStyle$1(container, {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0
    });

    var bar = document.createElement('div');
    addStyle$1(bar, {
      width: '0%',
      height: '5px',
      background: '#f00'
    });
    container.appendChild(bar);

    this.container = container;
    this.barElem = bar;
  }

  createClass(_class, [{
    key: 'update',
    value: function update(loaded, total) {
      this.barElem.style.width = loaded / total * 100 + '%';
    }
  }]);
  return _class;
}();

var toBlob = (function (canvas, callback, type, quality) {
  if (canvas.toBlob) {
    canvas.toBlob(callback, type, quality);
  } else {
    var binStr = atob(canvas.toDataURL(type, quality).split(',')[1]);
    var len = binStr.length;
    var arr = new Uint8Array(len);

    for (var i = 0; i < len; i++) {
      arr[i] = binStr.charCodeAt(i);
    }

    callback(new Blob([arr], { type: type }));
  }
});

var genImageData = (function (videoData, imageDataList, info, root, onSetViewer) {
  var videoSrc = URL.createObjectURL(videoData);
  var transcodingBar = new _class$2();

  var tmpList = [];
  var totalCount = 0;
  var createImg = function createImg(n, video, ctx, canvas) {
    video.ontimeupdate = function () {
      video.ontimeupdate = null;
      ctx.drawImage(video, 0, 0);

      toBlob(canvas, function (blob) {
        tmpList[n] = URL.createObjectURL(blob);
        imageDataList.length = 0;
        Array.prototype.push.apply(imageDataList, tmpList.filter(function (data) {
          return !!data;
        }));
        if (imageDataList.length === totalCount) {
          tmpList = null;
          root.removeChild(transcodingBar.container);
          URL.revokeObjectURL(videoSrc);
        } else {
          transcodingBar.update(imageDataList.length, totalCount);
        }
      }, 'image/jpeg', info.quality);

      if (n < totalCount - 1) createImg(n + 1, video, ctx, canvas);
    };

    video.currentTime = n / info.fps;
  };

  var video = document.createElement('video');
  totalCount = Math.floor(video.duration * info.fps);
  video.playsinline = 1;
  video.oncanplaythrough = function (e) {
    var video = e.target;
    onSetViewer(video.videoWidth, video.videoHeight);
    root.appendChild(transcodingBar.container);
    video.oncanplaythrough = null;
    totalCount = Math.floor(video.duration * info.fps);
    var canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    createImg(0, video, canvas.getContext('2d'), canvas);
  };
  video.src = videoSrc;
  video.load();
});

var addStyle$3 = utils.addStyle;


var setViewer = (function (imageDataList, root, info, videoWidth, videoHeight) {
  var initSwiped = false;
  var swiping = false;
  var prevX = null;
  var prevY = null;
  var srcIndex = 0;

  root.innerHTML = '';
  root.style.paddingTop = videoHeight / videoWidth * 100 + '%';

  var image = new Image();
  addStyle$3(image, {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    backfaceVisibility: 'hidden'
  });
  root.appendChild(image);

  var touchElem = document.createElement('div');
  addStyle$3(touchElem, {
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 1000000,
    top: 0,
    left: 0
  });
  root.appendChild(touchElem);

  var swipeStart = function swipeStart(e) {
    e.preventDefault();
    initSwiped = true;
    swiping = true;
    touchElem.style.position = 'fixed';
  };

  var swipeEnd = function swipeEnd() {
    swiping = false;
    touchElem.style.position = 'absolute';
  };

  touchElem.addEventListener('mousedown', swipeStart, false);
  touchElem.addEventListener('touchstart', swipeStart, false);

  touchElem.addEventListener('mouseup', swipeEnd, false);
  touchElem.addEventListener('touchend', swipeEnd, false);

  var addSrcIndex = function addSrcIndex(value) {
    if (imageDataList.length === 0) return;
    var swipedIndex = (srcIndex + value) % imageDataList.length;
    if (swipedIndex < 0) {
      swipedIndex += imageDataList.length;
    }
    srcIndex = swipedIndex;
  };

  var update = function update() {
    var i = srcIndex === 0 ? 1 : srcIndex; // > 1 for iOS Safari
    if (!imageDataList[i]) {
      setTimeout(update, 16);
      return;
    }
    image.src = imageDataList[i];
  };

  var handleSwipe = function handleSwipe(e) {
    if (!swiping && (initSwiped || !info.autoswipe)) return;

    var x = typeof e.clientX === 'number' ? e.clientX : e.touches[0].pageX;
    var y = typeof e.clientY === 'number' ? e.clientY : e.touches[0].pageY;

    if (prevX === null) {
      prevX = x;
      prevY = y;
    } else if (Math.abs(x - prevX) > Math.abs(y - prevY)) {
      addSrcIndex(x - prevX > 0 ? -1 : 1);
      var pX = prevX;
      setTimeout(function () {
        return addSrcIndex(x - pX > 0 ? -1 : 1);
      }, 33);
      update();
      prevX = x;
      prevY = y;
    } else {
      addSrcIndex(y - prevY > 0 ? -1 : 1);
      var pY = prevY;
      setTimeout(function () {
        return addSrcIndex(y - pY > 0 ? -1 : 1);
      }, 33);
      update();
      prevX = x;
      prevY = y;
    }
  };

  touchElem.addEventListener('mousemove', handleSwipe, false);
  touchElem.addEventListener('touchmove', handleSwipe, false);

  update();
});

if (!Array.prototype.find) {
  Array.prototype.find = function (predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

var initedClassName$1 = utils.initedClassName;
var formatValue = utils.formatValue;
var genInfo = utils.genInfo;
var addStyle$4 = utils.addStyle;


var VERSION = "0.1.0";
var refObjectCache = [];
var imageDataCache = [];
utils.initAutoSwipe(refObjectCache);

var swipegraph = {
  version: VERSION,
  config: { autoEmbed: true },
  refs: {},
  attach: function attach(elem, value) {
    if (new RegExp(initedClassName$1).test(elem.className)) {
      return refObjectCache.find(function (ref) {
        return ref.elem === elem;
      });
    }

    elem.classList.add(initedClassName$1);

    var param = formatValue(elem, value);

    var refObject = new _class(elem);
    refObjectCache.push(refObject);

    if (param.ref) swipegraph.refs[param.ref] = refObject;

    var root = document.createElement('div');
    addStyle$4(root, {
      paddingTop: '56.25%',
      position: 'relative'
    });
    root.innerHTML = loadingSvg;
    elem.appendChild(root);

    var progress = new _class$1();
    root.appendChild(progress.container);

    var info = genInfo(param);
    refObject.$setInfo(info);

    var videoPath = info.iframeSrc + '/' + info.contentId + '/video.mp4';
    var cachedURL = imageDataCache.find(function (obj) {
      return obj.originPath === videoPath;
    });

    if (cachedURL) {
      setViewer(cachedURL.data, root, info, cachedURL.width, cachedURL.height);
    } else {
      var cachedData = {
        originPath: videoPath,
        width: null,
        height: null,
        data: []
      };
      imageDataCache.push(cachedData);

      var xhr = new XMLHttpRequest();
      xhr.open('GET', videoPath);
      xhr.responseType = 'blob';
      xhr.onload = function (e) {
        genImageData(e.target.response, cachedData.data, info, root, function (width, height) {
          cachedData.width = width;
          cachedData.height = height;
          setViewer(cachedData.data, root, info, width, height);
        });
      };

      xhr.onprogress = function (evt) {
        if (evt.lengthComputable) progress.update(evt.loaded, evt.total);
      };
      xhr.send();
    }

    refObject.on('$detach', function (_ref) {
      var target = _ref.target;

      target.elem.classList.remove(initedClassName$1);
      var index = refObjectCache.indexOf(target);
      if (index !== -1) refObjectCache.splice(index, 1);
      Object.keys(swipegraph.refs).forEach(function (ref) {
        if (swipegraph.refs[ref] === target) {
          swipegraph.refs[ref] = null;
          delete swipegraph.refs[ref];
        }
      });

      target.elem.removeChild(root);
    });

    return refObject;
  },
  detach: function detach(elem) {
    var refObject = refObjectCache.find(function (t) {
      return t.elem === elem;
    });
    if (refObject) refObject.detach();
  }
};

if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object') {
  var embed = function embed() {
    Array.prototype.forEach.call(document.querySelectorAll('.swipegraph'), function (elem) {
      swipegraph.attach(elem);
    });
  };

  // setTimeout for rewriting config
  setTimeout(function () {
    if (swipegraph.config.autoEmbed) {
      if (document.readyState !== 'loading') embed();else window.addEventListener('DOMContentLoaded', embed, false);
    }
  });

  /* eslint-disable no-console */
  console.log('SwipeGraph v' + VERSION);
}

return swipegraph;

})));
