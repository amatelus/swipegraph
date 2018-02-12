import utils from './utils';

const { addStyle } = utils;

export default class {
  constructor() {
    this.loaded = 0;
    this.total = 1;
    const container = document.createElement('div');
    addStyle(container, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%,70px)',
    });

    const text = document.createElement('div');
    addStyle(text, {
      textAlign: 'center',
      color: '#555',
      fontSize: '12px',
    });
    text.innerText = '/';
    container.appendChild(text);

    const barFrame = document.createElement('div');
    addStyle(barFrame, {
      width: '200px',
      height: '5px',
      background: '#ccc',
      marginTop: '5px',
      position: 'relative',
    });
    container.appendChild(barFrame);

    const bar = document.createElement('div');
    addStyle(bar, {
      width: '0px',
      height: '100%',
      background: '#5699d2',
      position: 'absolute',
      top: 0,
      left: 0,
    });
    barFrame.appendChild(bar);

    this.container = container;
    this.textElem = text;
    this.barElem = bar;
  }

  update(loaded, total) {
    this.textElem.innerText = `${Math.floor(loaded / 102.4 / 1024) / 10} / ${Math.floor(total / 102.4 / 1024) / 10}MB`;
    this.barElem.style.width = `${loaded / total * 100}%`;
  }
}
