import RefObject from './RefObject';
import utils from './utils';
import setViewer from './setViewer';
import './polyfill-find';
import './polyfill-assign';

const { initedClassName, formatValue, genInfo, addStyle } = utils;

const VERSION = process.env.VERSION;
const refObjectCache = [];
utils.initAutoSwipe(refObjectCache);

const swipegraph = {
  version: VERSION,
  config: { autoEmbed: true },
  refs: {},
  attach: (elem, value) => {
    if (new RegExp(initedClassName).test(elem.className)) {
      return refObjectCache.find(ref => ref.elem === elem);
    }

    elem.classList.add(initedClassName);

    const param = formatValue(elem, value);

    const refObject = new RefObject(elem);
    refObjectCache.push(refObject);

    if (param.ref) swipegraph.refs[param.ref] = refObject;

    const root = document.createElement('div');
    addStyle(root, {
      position: 'relative',
    });
    elem.appendChild(root);

    const info = genInfo(param);
    setViewer(root, info, refObject);

    refObject.on('$detach', ({ target }) => {
      target.elem.classList.remove(initedClassName);
      const index = refObjectCache.indexOf(target);
      if (index !== -1) refObjectCache.splice(index, 1);
      Object.keys(swipegraph.refs).forEach((ref) => {
        if (swipegraph.refs[ref] === target) {
          swipegraph.refs[ref] = null;
          delete swipegraph.refs[ref];
        }
      });

      target.elem.removeChild(root);
    });

    return refObject;
  },
  detach: (elem) => {
    const refObject = refObjectCache.find(t => t.elem === elem);
    if (refObject) refObject.detach();
  },
};

if (typeof window === 'object') {
  const embed = () => {
    Array.prototype.forEach.call(document.querySelectorAll('.swipegraph'), (elem) => { swipegraph.attach(elem); });
  };

  // setTimeout for rewriting config
  setTimeout(() => {
    if (swipegraph.config.autoEmbed) {
      if (document.readyState !== 'loading') embed();
      else window.addEventListener('DOMContentLoaded', embed, false);
    }
  });

  /* eslint-disable no-console */
  console.log(`SwipeGraph v${VERSION}`);
};

export default swipegraph;
