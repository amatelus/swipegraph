import utils from './utils';
const { addStyle } = utils;

export default (imageDataList, root, info, videoWidth, videoHeight) => {
  let initSwiped = false;
  let swiping = false;
  let prevX = null;
  let prevY = null;
  let srcIndex = 0;

  root.innerHTML = '';
  root.style.paddingTop = videoHeight / videoWidth * 100 + '%';

  const image = new Image();
  addStyle(image, {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    backfaceVisibility: 'hidden',
  });
  root.appendChild(image);

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

  const addSrcIndex = (value) => {
    if (imageDataList.length === 0) return;
    let swipedIndex = (srcIndex + value) % imageDataList.length;
    if (swipedIndex < 0) {
      swipedIndex += imageDataList.length;
    }
    srcIndex = swipedIndex;
  }

  const update = () => {
    const i = srcIndex === 0 ? 1 : srcIndex; // > 1 for iOS Safari
    if (!imageDataList[i]) {
      setTimeout(update, 16);
      return;
    }
    image.src = imageDataList[i];
  }

  const handleSwipe = (e) => {
    if (!swiping && (initSwiped || !info.autoswipe)) return;

    const x = typeof e.clientX === 'number' ? e.clientX : e.touches[0].pageX;
    const y = typeof e.clientY === 'number' ? e.clientY : e.touches[0].pageY;
    
    if (prevX === null) {
      prevX = x;
      prevY = y;
    } else if (Math.abs(x - prevX) > Math.abs(y - prevY)) {
      addSrcIndex(x - prevX > 0 ? -1 : 1);
      const pX = prevX;
      setTimeout(() => addSrcIndex(x - pX > 0 ? -1 : 1), 33);
      update();
      prevX = x;
      prevY = y;
    } else {
      addSrcIndex(y - prevY > 0 ? -1 : 1);
      const pY = prevY;
      setTimeout(() => addSrcIndex(y - pY > 0 ? -1 : 1), 33);
      update();
      prevX = x;
      prevY = y;
    }
  };

  touchElem.addEventListener('mousemove', handleSwipe, false);
  touchElem.addEventListener('touchmove', handleSwipe, false);

  update();
}