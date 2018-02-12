import utils from './utils';

const { addStyle } = utils;

export default class {
  constructor() {
    this.loaded = 0;
    this.total = 1;
    const container = document.createElement('div');
    addStyle(container, {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
    });

    const bar = document.createElement('div');
    addStyle(bar, {
      width: '0%',
      height: '5px',
      background: '#f00',
    });
    container.appendChild(bar);

    this.container = container;
    this.barElem = bar;
  }

  update(loaded, total) {
    this.barElem.style.width = `${loaded / total * 100}%`;
  }
}
