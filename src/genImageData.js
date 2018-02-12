import utils from './utils';
import TranscodingBar from './TranscodingBar';
import toBlob from './toBlob';
const { addStyle } = utils;

export default (videoData, imageDataList, info, root, onSetViewer) => {
  const videoSrc = URL.createObjectURL(videoData);
  const transcodingBar = new TranscodingBar();

  let tmpList = [];
  let totalCount = 0;
  let completed = 0;

  const createImg = (n, video, ctx, canvas) => {
    video.ontimeupdate = () => {
      video.ontimeupdate = null;
      ctx.drawImage(video, 0, 0);

      toBlob(canvas, (blob) => {
        tmpList[n] = URL.createObjectURL(blob);
        imageDataList.length = 0;
        Array.prototype.push.apply(imageDataList, tmpList.filter(data => !!data));
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
  }

  const video = document.createElement('video');
  totalCount = Math.floor(video.duration * info.fps);
  video.playsinline = 1;
  video.oncanplaythrough = (e) => {
    const video = e.target;
    onSetViewer(video.videoWidth, video.videoHeight);
    root.appendChild(transcodingBar.container);
    video.oncanplaythrough = null;
    totalCount = Math.floor(video.duration * info.fps);
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    createImg(0, video, canvas.getContext('2d'), canvas);
  };
  video.src = videoSrc;
  video.load();
}
