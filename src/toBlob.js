export default (canvas, callback, type, quality) => {
  if (canvas.toBlob) {
    canvas.toBlob(callback, type, quality);
  } else {
    const binStr = atob(canvas.toDataURL(type, quality).split(',')[1]);
    const len = binStr.length;
    const arr = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      arr[i] = binStr.charCodeAt(i);
    }

    callback(new Blob([arr], { type }));
  }
}
