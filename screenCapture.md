# 在electron下实现屏幕截屏
* 获取屏幕id
```js
desktopCapturer.getSources({
  types: ['screen']
});
```
* 获取视频流对象
```js
getScreenAccess().then((sources) => {
  let selectSource = sources.filter((source) => source.display_id + '' === curScreen.id + '')[0];
  return navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: selectSource ? selectSource.id : 'screen:0:0',
        minWidth: 1280,
        minHeight: 720,
        maxWidth: 8000,
        maxHeight: 8000
      },
    }
  }).then((currentStream) => {
    stream = currentStream;
    resolve();
  }).catch(handleError);
});
```
* 将视频流绘制在video标签，使用canvas截取一帧图像
```js
let video = document.createElement('video');
video.srcObject = stream;
video.onloadedmetadata = () => {
  // 只能先生成全屏图片再截取
  video.play();
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
  video.pause();
  video = null;
  resolve(canvas.toDataURL('image/png'));
};
video.onerror = reject;
```

首先使用electron的`systemPreferences.getMediaAccessStatus('screen') !== 'granted'`判断mac端是否有权限
