export default class {
  constructor(elem) {
    this.elem = elem;
    this.readyState = 'waiting';
    this.$eventList = {};
  }

  $setMounted(value) {
    this.readyState = 'mounted';
    this.dispatch('mounted', value);
  }

  addSrcIndex(value) {
    this.dispatch('addSrcIndex', value);
    return this;
  }

  setSrcIndex(value) {
    this.dispatch('setSrcIndex', value);
    return this;
  }

  detach() {
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

  dispatch(type, value) {
    if (this.$eventList[type]) {
      this.$eventList[type].forEach((callback) => {
        callback.call(this, { type, value, target: this });
      });
    }

    return this;
  }
}
