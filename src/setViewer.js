import utils from './utils';
import getObjectURL from './getObjectURL';
const { addStyle } = utils;

export default (root, info, refObject) => {
  let initSwiped = false;
  let swiping = false;
  let prevX = null;
  let prevY = null;
  let nextDelta = 1;
  let srcIndex = -1;
  const urlCache = [];

  const image = new Image();
  root.appendChild(image);

  image.onload = (e) => {
    const target = e.target;
    const height = target.naturalHeight;
    const width = target.naturalWidth;
    root.style.paddingTop = height / width * 100 + '%';
    target.onload = null;

    addStyle(image, {
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      backfaceVisibility: 'hidden',
    });

    refObject.$setMounted({
      width,
      height,
    })
  };

  const touchElem = document.createElement('div');
  addStyle(touchElem, {
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 1000000,
    top: 0,
    left: 0,
  });
  root.appendChild(touchElem);

  const swipeStart = (e) => {
    e.preventDefault();
    initSwiped = true;
    swiping = true;
    touchElem.style.position = 'fixed';
  };

  const swipeEnd = () => {
    swiping = false;
    touchElem.style.position = 'absolute';
  };

  touchElem.addEventListener('mousedown', swipeStart, false);
  touchElem.addEventListener('touchstart', swipeStart, false);

  touchElem.addEventListener('mouseup', swipeEnd, false);
  touchElem.addEventListener('touchend', swipeEnd, false);

  const canceler = setInterval(() => {
    if (nextDelta === 0) return;

    let swipedIndex = (srcIndex + nextDelta) % info.length;
    if (swipedIndex < 0) {
      swipedIndex += info.length;
    }
    
    const i = srcIndex = swipedIndex;
    if (!urlCache[i]) {
      getObjectURL(`${info.src}/${info.id}/${i + 1}.jpg${info.queryString}`, (url) => {
        urlCache[i] = url;
        image.src = url;
      });
    } else image.src = urlCache[i];

    nextDelta = 0;
  }, 33);

  const handleSwipe = (e) => {
    if (!swiping && initSwiped) return;

    const x = typeof e.clientX === 'number' ? e.clientX : e.touches[0].pageX;
    const y = typeof e.clientY === 'number' ? e.clientY : e.touches[0].pageY;
    
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

  refObject.on('addSrcIndex', e => nextDelta = e.value);
  refObject.on('$detach', () => {
    urlCache.forEach(url => URL.revokeObjectURL(url));
    clearInterval(canceler);
  });

  touchElem.addEventListener('mousemove', handleSwipe, false);
  touchElem.addEventListener('touchmove', handleSwipe, false);
}