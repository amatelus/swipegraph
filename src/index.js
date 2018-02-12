import RefObject from './RefObject';
import utils from './utils';
import loadingSvg from './loading.svg';
import ProgressBar from './ProgressBar';
import genImageData from './genImageData';
import setViewer from './setViewer';

const { initedClassName, formatValue, genInfo, addStyle } = utils;

const VERSION = process.env.VERSION;
const refObjectCache = [];
const imageDataCache = [];
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
      paddingTop: '56.25%',
      position: 'relative',
    });
    root.innerHTML = loadingSvg;
    elem.appendChild(root);

    const progress = new ProgressBar();
    root.appendChild(progress.container);

    const info = genInfo(param);
    refObject.$setInfo(info);

    const videoPath = `${info.iframeSrc}/${info.contentId}/video.mp4`;
    const cachedURL = imageDataCache.find(obj => obj.originPath === videoPath);

    if (cachedURL) {
      setViewer(cachedURL.data, root, info, cachedURL.width, cachedURL.height);
    } else {
      const cachedData = {
        originPath: videoPath,
        width: null,
        height: null,
        data: [],
      };
      imageDataCache.push(cachedData);

      const xhr = new XMLHttpRequest();
      xhr.open('GET', videoPath);
      xhr.responseType = 'blob';
      xhr.onload = (e) => {
        genImageData(e.target.response, cachedData.data, info, root, (width, height) => {
          cachedData.width = width;
          cachedData.height = height;
          setViewer(cachedData.data, root, info, width, height);
        });
      };

      xhr.onprogress = (evt) => {
        if (evt.lengthComputable) progress.update(evt.loaded, evt.total);
      };
      xhr.send();
    }

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
