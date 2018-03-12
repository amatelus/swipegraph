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

var _class = function () {
  function _class(elem) {
    classCallCheck(this, _class);

    this.elem = elem;
    this.readyState = 'waiting';
    this.$eventList = {};
  }

  createClass(_class, [{
    key: '$setMounted',
    value: function $setMounted(value) {
      this.readyState = 'mounted';
      this.dispatch('mounted', value);
    }
  }, {
    key: 'addSrcIndex',
    value: function addSrcIndex(value) {
      this.dispatch('addSrcIndex', value);
      return this;
    }
  }, {
    key: 'setSrcIndex',
    value: function setSrcIndex(value) {
      this.dispatch('setSrcIndex', value);
      return this;
    }
  }, {
    key: 'detach',
    value: function detach() {
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
    key: 'dispatch',
    value: function dispatch(type, value) {
      var _this2 = this;

      if (this.$eventList[type]) {
        this.$eventList[type].forEach(function (callback) {
          callback.call(_this2, { type: type, value: value, target: _this2 });
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
    var bounding = refObject.elem.getBoundingClientRect();
    var wh = window.innerHeight;

    if (bounding.top < wh && bounding.top > -bounding.height) result.push(refObject);
  });

  return result;
}

var utils = {
  initedClassName: initedClassName,
  formatValue: function formatValue(elem, val) {
    return Object.assign(['id', 'src', 'ref'].reduce(function (prev, key) {
      return Object.assign({}, prev, defineProperty({}, key, elem.getAttribute('data-' + key)));
    }, {}), ['length', 'autoswipe'].reduce(function (prev, key) {
      return Object.assign({}, prev, defineProperty({}, key, JSON.parse(elem.getAttribute('data-' + key))));
    }, {}), val);
  },
  genInfo: function genInfo(param) {
    var queryString = param.$auth ? '?' + param.$auth : '';
    return Object.assign({
      queryString: queryString,
      cdnQueryString: param.$cdnAuth ? '?' + param.$cdnAuth : queryString,
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

var URL$1 = window.URL || window.webkitURL;

var getObjectURL = (function (url, cb) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.onload = function (e) {
    return cb(URL$1.createObjectURL(e.target.response));
  };
  xhr.send();
});

var addStyle = utils.addStyle;


var setViewer = (function (root, info, refObject) {
  var initSwiped = false;
  var swiping = false;
  var prevX = null;
  var prevY = null;
  var nextDelta = 1;
  var srcIndex = -1;
  var urlCache = [];

  var image = new Image();
  root.appendChild(image);

  image.onload = function (e) {
    var target = e.target;
    var height = target.naturalHeight;
    var width = target.naturalWidth;
    root.style.paddingTop = height / width * 100 + '%';
    target.onload = null;

    addStyle(image, {
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      backfaceVisibility: 'hidden'
    });

    refObject.$setMounted({
      width: width,
      height: height
    });
  };

  var touchElem = document.createElement('div');
  addStyle(touchElem, {
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

  var canceler = setInterval(function () {
    if (nextDelta === 0) return;

    var swipedIndex = (srcIndex + nextDelta) % info.length;
    if (swipedIndex < 0) {
      swipedIndex += info.length;
    }

    var i = srcIndex = swipedIndex;
    if (!urlCache[i]) {
      getObjectURL(info.src + '/' + info.id + '/' + (i + 1) + '.jpg' + info.queryString, function (url) {
        urlCache[i] = url;
        image.src = url;
      });
    } else image.src = urlCache[i];

    nextDelta = 0;
  }, 33);

  var handleSwipe = function handleSwipe(e) {
    if (!swiping && initSwiped) return;

    var x = typeof e.clientX === 'number' ? e.clientX : e.touches[0].pageX;
    var y = typeof e.clientY === 'number' ? e.clientY : e.touches[0].pageY;

    if (prevX === null) {
      prevX = x;
      prevY = y;
    } else if (Math.abs(x - prevX) > Math.abs(y - prevY)) {
      nextDelta = x - prevX > 0 ? -1 : 1;
      prevX = x;
      prevY = y;
    } else {
      nextDelta = y - prevY > 0 ? -1 : 1;
      prevX = x;
      prevY = y;
    }
  };

  refObject.on('addSrcIndex', function (e) {
    return nextDelta = e.value;
  });
  refObject.on('$detach', function () {
    urlCache.forEach(function (url) {
      return URL.revokeObjectURL(url);
    });
    clearInterval(canceler);
  });

  touchElem.addEventListener('mousemove', handleSwipe, false);
  touchElem.addEventListener('touchmove', handleSwipe, false);
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
var addStyle$1 = utils.addStyle;


var VERSION = "0.2.0";
var refObjectCache = [];
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
    addStyle$1(root, {
      position: 'relative'
    });
    elem.appendChild(root);

    var info = genInfo(param);
    setViewer(root, info, refObject);

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
