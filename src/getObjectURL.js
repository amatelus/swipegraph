const URL = window.URL || window.webkitURL;

export default (url, cb) => {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.onload = (e) => cb(URL.createObjectURL(e.target.response));
  xhr.send();
}
