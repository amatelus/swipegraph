function sendMessage(refObject, type, value) {
  if (refObject.$iframe && refObject.$iframe.contentWindow) {
    refObject.$iframe.contentWindow.postMessage({
      type,
      value,
    }, '*');
  } else refObject.dispatch(`$${type}`, value);
}

export default class {
  constructor(elem) {
    this.elem = elem;
    this.readyState = 'waiting';
    this.$iframe = null;
    this.$isInit = false;
    this.$info = null;
    this.$eventList = {};
  }

  $setInfo(info, originalInfo) {
    this.$info = info;
    this.readyState = 'loadedinfo';
    this.dispatch('loadedinfo', originalInfo);
    if (info.autoplay) this.$init();
  }

  $setMounted() {
    this.readyState = 'mounted';
    this.dispatch('mounted', null);
  }

  $setIframe(iframe) {
    if (this.readyState !== 'mounted') this.$setMounted(); // autoplay or play before lazyloaded
    this.$iframe = iframe;
    this.readyState = 'loading';
    this.dispatch('loadstart', null);
  }

  $iframeDidMount() {
    this.readyState = 'loaded';
    this.dispatch('loaded', null);
    this.requestFullscreen();
  }

  $init() {
    this.$isInit = true;
  }

  addSrcIndex(value) {
    sendMessage(this, 'addSrcIndex', value);
    return this;
  }

  setSrcIndex(value) {
    sendMessage(this, 'setSrcIndex', value);
    return this;
  }

  setFilter(value) {
    sendMessage(this, 'setFilter', value);
    return this;
  }

  setPosterIndex(value) {
    sendMessage(this, 'setPosterIndex', value);
    return this;
  }

  detach() {
    if (this.$iframe) {
      this.$iframe.contentWindow.postMessage({ type: 'detach' }, '*');
    }
    this.dispatch('$detach');
  }

  on(type, callback) {
    this.$eventList[type] = this.$eventList[type] || [];
    this.$eventList[type].push(callback);
    return this;
  }

  off(type, callback) {
    if (this.$eventList[type]) {
      const index = this.$eventList[type].indexOf(callback);
      if (index !== -1) this.$eventList[type].splice(index, 1);
    }

    return this;
  }

  one(type, callback) {
    const fn = (e) => {
      callback.call(this, e);
      this.off(type, fn);
    };
    this.on(type, fn);
    return this;
  }

  getInfo(callback) {
    if (this.readyState === 'waiting') this.one('loadedinfo', (e) => { callback.call(this, e.value); });
    else callback.call(this, this.$info);
    return this;
  }

  dispatch(type, value) {
    if (this.$eventList[type]) {
      this.$eventList[type].forEach((callback) => {
        callback.call(this, { type, value, target: this });
      });
    }

    return this;
  }
}
