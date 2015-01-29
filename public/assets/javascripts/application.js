function Application() {
  this.logoSrcUrl_ = 'images/title_logo.png';
  // cache
  this.logoImg_ = new CachableImage(this.logoSrcUrl_);
  this.containerEl_ = null;

  //this.popularApiUrl_ = 'popular_json.json';
  this.popularApiUrl_ = 'assets/json/cute.json';

  //this.cuteApiUrl_ = 'cute_json.json';
  this.cuteApiUrl_ = 'assets/json/cute.json';

  this.bodyEl_ = document.body;
  this.mainEl_ = document.getElementById('main');
  this.placingStrategy_ = new PlacingStrategy();
  this.viewportWidth_ = this.bodyEl_.offsetWidth;
  this.viewportHeight_ = this.bodyEl_.offsetHeight;

  var self = this;
  $(window).resize(function () {
    self.viewportWidth_ = self.bodyEl_.offsetWidth;
    self.viewportHeight_ = self.bodyEl_.offsetHeight;
  });
}

Application.prototype.start = function start() {
  var app = this;
  var serial = 0;
  var forceLoopTime = 40000;
  app.phaseOfOpening(serial++, function () {
        app.phaseOfLoop(serial++, function loop() {
          app.phaseOfLoop(serial++, loop, forceLoopTime);
        }, forceLoopTime);
      }
  );
};

function appendSocialEl(containerRect, containerEl, imageSize, leftMargin, topMargin) {
  var socialEl_ = document.createElement('li');
  var socialX = containerRect.width - 2;
  var socialY = containerRect.height - 1;
  var socialRect = new TileRect(socialX, socialY, 2, 1);
  containerEl.appendChild(socialEl_);
  Style.setRect(socialEl_.style, socialRect, imageSize, leftMargin, topMargin);
  socialEl_.style.zIndex = 300;

  var likeWidth = 200;
  var facebookLikeEl = document.createElement('iframe');
  facebookLikeEl.className = 'facebook';
  facebookLikeEl.src = 'http://www.facebook.com/plugins/like.php?href=' + encodeURIComponent('http://pinupselfie.com/') + '&layout=button_count&show_faces=true&width=' + encodeURIComponent(likeWidth) + '&action=like&colorscheme=light&height=80&colorscheme=dark';
  facebookLikeEl.style.width = likeWidth + 'px';
  facebookLikeEl.setAttribute('allowTransparency', "true");
  facebookLikeEl.setAttribute('frameBorder', "0");
  facebookLikeEl.setAttribute('scrolling', "no");
  socialEl_.appendChild(facebookLikeEl);

  var tweetEl = document.createElement('a');
  tweetEl.setAttribute('data-count', 'horizontal');
  tweetEl.setAttribute('data-lang', navigator.language || navigator.userLanguage);
  tweetEl.setAttribute('data-text', 'Pin-up Selfie - Japanese cute girls on Twitter.');
  tweetEl.setAttribute('data-url', 'http://pinupselfie.com/');
  tweetEl.className = 'twitter-share-button';
  socialEl_.appendChild(tweetEl);

  var scriptEl = document.createElement('script');
  scriptEl.src = 'http://platform.twitter.com/widgets.js';
  scriptEl.type = 'text/javascript';
  socialEl_.appendChild(scriptEl);

  return socialEl_
}

function appendLinks() {
  var ancDiv = document.createElement('div');
  ancDiv.className = "pfj";
  var ancEl = document.createElement('a');
  ancEl.href = "https://github.com/ts-3156/pinupselfie/wiki/About-Design";
  ancEl.style.color = "#FFFFFF";
  ancEl.appendChild(document.createTextNode("About Design"));
  ancDiv.appendChild(ancEl);

  return ancDiv
}

function createCachableImage(rect, urlInfo) {
  var img = null;
  if (rect.width === 1 && rect.height === 1) {
    img = new CachableImage(urlInfo.url);
  }
  else if (rect.width === 2 && rect.height === 2) {
    img = new CachableImage(Util.getLargeUrl(urlInfo.url));
  }
  else {
    DEBUG && assert(false);
  }
  return img;
}

Application.prototype.phaseOfOpening = function (serial, callbackFn, forceLoopTime) {
  var app = this;

  $.getJSON(this.popularApiUrl_ + '?seed=' + Math.random())
      .done(function (json) {
        afterGetUrlList(Util.shuffle(json));
      });

  function afterGetUrlList(urlInfoList) {
    var layout = app.calcLayout();
    var containerRect = layout[0];
    var imageSize = layout[1];
    var leftMargin = layout[2];
    var topMargin = layout[3];
    var containerEl = document.createElement('ul');
    app.mainEl_.appendChild(containerEl);
    app.containerEl_ = containerEl;

    var logoX = Math.ceil(containerRect.width / 2) - 1;
    var logoY = Math.ceil(containerRect.height / 2) - 1;
    var logoRect = new TileRect(logoX, logoY, 2, 1);
    var logoEl = app.logoImg_.getElement();
    var logoWrapper = new Wrapper(logoEl, 'http://pinupselfie.com/', logoRect, imageSize, leftMargin, topMargin);
    var logoWrapperStyle = logoWrapper.getWrapperStyle();
    containerEl.appendChild(logoWrapper.getWrapperElement());
    Style.setOpacity(logoWrapperStyle, 0);
    var fade = new Fade(function (pos) {
      Style.setOpacity(logoWrapperStyle, Util.sinoidal(pos));
    }, 0.08);
    fade.start(function () {
    });

    var socialEl = appendSocialEl(containerRect, containerEl, imageSize, leftMargin, topMargin);
    socialEl.appendChild(appendLinks());

    var rectList = app.placingStrategy_.execute(containerRect, logoRect);
    var imageLength = Math.min(rectList.length, urlInfoList.length);
    var loadFinishCount = 0;
    var isTimeout = false;

    for (var i = 0; i < imageLength; i++) {
      var rect = rectList[i];
      var urlInfo = urlInfoList[i];
      var img = createCachableImage(rect, urlInfo);

      var imageEl = img.getElement();
      var wrapper = new Wrapper(imageEl, urlInfo, rect, imageSize, leftMargin, topMargin);
      containerEl.appendChild(wrapper.getWrapperElement());
      var imageStyle = wrapper.getWrapperStyle();
      Style.setOpacity(imageStyle, 0);
      (function handleLoad(img, imageStyle) {
        img.attachLoadEvent(function () {
          // This code below is called asynchronously because this block is called when the image is loaded.
          var fade = new Fade(function (pos) {
            Style.setOpacity(imageStyle, Util.sinoidal(pos));
          }, 0.08);
          fade.start(function () {
            loadFinishCount++;
            if (loadFinishCount >= imageLength) {
              // If all images are loaded, stop the timer and call specified callback fn.
              if (!isTimeout) {
                clearTimeout(timeoutId);
                callbackFn();
              }
            }
          });
        });
      })(img, imageStyle);
    }

    var timeoutId = setTimeout(function () {
      // Normally the callback fn is called when all images are loaded.
      // If images load very slowly, the callback fn is called automatically.
      isTimeout = true;
      callbackFn();
    }, forceLoopTime);
  }
};

Application.prototype.phaseOfLoop = function (serial, callbackFn, forceLoopTime) {
  var app = this;
  var startTime = new Date().getTime();
  var prevContainerEl = app.containerEl_;
  prevContainerEl.className = 'prev';
  app.containerEl_ = null;

  $.getJSON(this.cuteApiUrl_ + '?seed=' + Math.random())
      .done(function (json) {
        afterGetUrlList(Util.shuffle(json));
      });

  var imgRectList = [];

  function afterGetUrlList(urlInfoList) {
    var layout = app.calcLayout();
    var containerRect = layout[0];
    var imageSize = layout[1];
    var leftMargin = layout[2];
    var topMargin = layout[3];
    var containerEl = document.createElement('ul');
    app.mainEl_.appendChild(containerEl);
    app.containerEl_ = containerEl;

    var logoX = Math.ceil(containerRect.width / 2) - 1;
    var logoY = Math.ceil(containerRect.height / 2) - 1;
    var logoRect = new TileRect(logoX, logoY, 2, 1);
    var logoEl = app.logoImg_.getElement().cloneNode(false);
    var logoWrapper = new Wrapper(logoEl, 'http://pinupselfie.com/', logoRect, imageSize, leftMargin, topMargin);
    var logoWrapperStyle = logoWrapper.getWrapperStyle();
    containerEl.appendChild(logoWrapper.getWrapperElement());

    var socialEl = appendSocialEl(containerRect, containerEl, imageSize, leftMargin, topMargin);
    socialEl.appendChild(appendLinks());

    var rectList = app.placingStrategy_.execute(containerRect, logoRect);
    var imageLength = Math.min(rectList.length, urlInfoList.length);
    var isTimeout = false;

    var timeoutId = setTimeout(function () {
      isTimeout = true;
      afterLoad();
    }, forceLoopTime);

    var loadFinishCount = 0;
    for (var i = 0; i < imageLength; i++) {
      var rect = rectList[i];
      var urlInfo = urlInfoList[i];
      var img = createCachableImage(rect, urlInfo);

      var imageEl = img.getElement();
      var wrapper = new Wrapper(imageEl, urlInfo, rect, imageSize, leftMargin, topMargin);
      containerEl.appendChild(wrapper.getWrapperElement());

      (function handleLoad(img) {
        img.attachLoadEvent(function () {
          loadFinishCount++;
          if (loadFinishCount >= imageLength) {
            if (!isTimeout) {
              clearTimeout(timeoutId);
              afterLoad();
            }
          }
        });
      })(img);
    }
  }

  function afterLoad() {
    var timeSpan = new Date().getTime() - startTime;
    setTimeout(function () {
      var style = prevContainerEl.style;
      var fade = new Fade(function (pos) {
        Style.setOpacity(style, Util.sinoidal(1 - pos));
      }, 0.06);
      fade.start(function () {
        app.mainEl_.removeChild(prevContainerEl);
        callbackFn();
      });
    }, Math.max(10000 - timeSpan, 1));
  }
};

Application.prototype.calcLayout = function () {
  function imageSize(){
    var size = 120;
    var agent = navigator.userAgent;
    if (agent.search(/iPhone/) != -1) {
      size *= 1.5;
    } else if (agent.search(/iPad/) != -1) {
    } else if (agent.search(/Android/) != -1) {
      size *= 1.5;
    }
    return size;
  }

  var topMargin, leftMargin, rect, numberOfImageY, realImageSize, numberOfImageX;

  if (this.viewportHeight_ < this.viewportWidth_) {
    numberOfImageY = Math.floor(this.viewportHeight_ / imageSize());
    realImageSize = this.viewportHeight_ / numberOfImageY;
    numberOfImageX = Math.floor(this.viewportWidth_ / realImageSize);
    rect = new TileRect(0, 0, numberOfImageX, numberOfImageY);
    leftMargin = (this.viewportWidth_ - numberOfImageX * realImageSize) / 2;
    topMargin = 0;
  }
  else {
    numberOfImageX = Math.floor(this.viewportWidth_ / imageSize());
    realImageSize = this.viewportWidth_ / numberOfImageX;
    numberOfImageY = Math.floor(this.viewportHeight_ / realImageSize);
    rect = new TileRect(0, 0, numberOfImageX, numberOfImageY);
    leftMargin = 0;
    topMargin = (this.viewportHeight_ - numberOfImageY * realImageSize) / 2;
  }
  return [rect, realImageSize, leftMargin, topMargin];
};

function Wrapper(el, urlInfo, rect, size, leftMargin, topMargin) {
  this.el_ = el;
  var params = {id: urlInfo.status_id, photo_id: urlInfo.photo_id};
  this.anchorEl_ = $('<a />').attr('href', '/tweets/?' + $.param(params)).append(this.el_);
  this.wrapperEl_ = $('<li />').css(Style.getRect(rect, size, leftMargin, topMargin)).append(this.anchorEl_);
}

Wrapper.prototype.getElement = function () {
  return this.el_;
};

Wrapper.prototype.getAnchorElement = function () {
  return this.anchorEl_;
};

Wrapper.prototype.getWrapperElement = function () {
  return this.wrapperEl_[0];
};

Wrapper.prototype.getWrapperStyle = function () {
  return this.wrapperEl_[0].style;
};

function TileRect(x, y, w, h) {
  this.left = x;
  this.top = y;
  this.width = w;
  this.height = h;
}

TileRect.prototype.intersects = function intersects(rect) {
  return (this.left <= rect.left + rect.width && rect.left <= this.left + this.width &&
  this.top <= rect.top + rect.height && rect.top <= this.top + this.height);
};

TileRect.prototype.contains = function contains(rect) {
  return this.left <= rect.left &&
      this.left + this.width >= rect.left + rect.width &&
      this.top <= rect.top &&
      this.top + this.height >= rect.top + rect.height;
};

TileRect.prototype.toString = function () {
  return 'Rect(' + [this.left, this.top, this.width, this.height].join(', ') + ')';
};

TileRect.prototype.toArray = function toArray(fill) {
  var array = [];
  for (var x = 0; x < this.width; x++) {
    array.push([]);
    for (var y = 0; y < this.height; y++) {
      array[x][y] = fill;
    }
  }
  return array;
};

function Util() {
}

Util.getLargeUrl = function getLargeUrl(url) {
  return url;
};

Util.sinoidal = function sinoidal(pos) {
  return (-Math.cos(pos * Math.PI) / 2) + 0.5;
};

Util.shuffle = function (list) {
  var i = list.length;
  while (i) {
    var j = Math.floor(Math.random() * i);
    var t = list[--i];
    list[i] = list[j];
    list[j] = t;
  }
  return list;
};

function PlacingStrategy() {
}

PlacingStrategy.prototype.execute = function execute(containerRect, logoRect) {
  DEBUG && assert(containerRect.left === 0);
  DEBUG && assert(containerRect.top === 0);
  DEBUG && assert(containerRect.width > 0);
  DEBUG && assert(containerRect.height > 0);
  DEBUG && assert(containerRect.contains(logoRect));

  var maxWidth = 2;
  var maxHeight = 2;
  var map = containerRect.toArray(false);
  var tileRectList = [];

  // ロゴの箇所を埋める
  for (var posX = logoRect.left; posX < logoRect.left + logoRect.width; posX++) {
    for (var posY = logoRect.top; posY < logoRect.top + logoRect.height; posY++) {
      map[posX][posY] = true;
    }
  }

  // ソーシャルボタンの箇所を埋める
  var socialPanel = [];
  socialPanel.width = 2;
  socialPanel.height = 1;
  for (var posX = containerRect.width - socialPanel.width; posX < containerRect.width; posX++) {
    for (var posY = containerRect.height - socialPanel.height; posY < containerRect.height; posY++) {
      map[posX][posY] = true;
    }
  }

  for (var x = 0; x < containerRect.width; x++) {
    for (var y = 0; y < containerRect.height; y++) {

      // 座標に何もない場合
      if (map[x][y] === false) {

        var width = 1;
        var height = 1;
        var rect = new TileRect(x, y, width, height);

        // 1 / 6 の確立で大きな矩形を作る
        var probeOfLarge = Math.floor(Math.random() * 8);
        if (probeOfLarge === 0) {

          var largeRect = new TileRect(x, y, maxWidth, maxHeight);
          // 大きな矩形が containerRect に含まれている
          if (containerRect.contains(largeRect)) {
            var isLarge = true;
            // 矩形がどことも重ならない
            for (var posX = largeRect.left; posX < largeRect.left + largeRect.width; posX++) {
              for (var posY = largeRect.top; posY < largeRect.top + largeRect.height; posY++) {
                if (map[posX][posY]) {
                  isLarge = false;
                  break;
                }
              }
            }
            if (isLarge) {
              rect.width = maxWidth;
              rect.height = maxHeight;
            }
          }
        }

        for (var posX = rect.left; posX < rect.left + rect.width; posX++) {
          for (var posY = rect.top; posY < rect.top + rect.height; posY++) {
            map[posX][posY] = true;
          }
        }

        tileRectList.push(rect);
      }
    }
  }
  return tileRectList;
};

function CachableImage(src) {
  var self = this;
  this.el_ = new Image();
  this.loaded_ = false;
  Evt.attach(this.el_, 'load', function onload() {
    self.handleLoad_();
  });
  this.src_ = src;
  this.el_.src = src;
}

CachableImage.prototype.handleLoad_ = function () {
  this.loaded_ = true;
};

CachableImage.prototype.attachLoadEvent = function (fn) {
  if (this.loaded_) {
    fn();
  }
  else {
    Evt.attach(this.el_, 'load', fn);
  }
};

CachableImage.prototype.getElement = function () {
  return this.el_;
};

function Style() {
}

Style.setRect = function (style, rect, size, leftMargin, topMargin) {
  style.left = rect.left * size + leftMargin + 'px';
  style.top = rect.top * size + topMargin + 'px';
  style.width = rect.width * size + 'px';
  style.height = rect.height * size + 'px';
};

Style.getRect = function (rect, size, leftMargin, topMargin) {
  return {
    left: rect.left * size + leftMargin + 'px',
    top: rect.top * size + topMargin + 'px',
    width: rect.width * size + 'px',
    height: rect.height * size + 'px'
  }
};

Style.setOpacity = function (style, opacity) {
  if (opacity < 0.001) {
    style.display = 'none';
    style.opacity = '';
    style.filter = '';
  }
  else if (opacity > 0.999) {
    style.display = '';
    style.opacity = '';
    style.filter = '';
  }
  else {
    style.display = '';
    style.opacity = opacity;
    style.filter = 'alpha(opacity=' + Math.floor(opacity * 100) + ')';
  }
};

function Fade(fn, speed) {
  this.fn = fn;
  this.speed = speed;
}

Fade.fnIndex = 0;

Fade.fnMap = {};

Fade.intervalId = setInterval(function () {
  for (var name in Fade.fnMap) {
    if (Fade.fnMap.hasOwnProperty(name)) {
      Fade.fnMap[name]();
    }
  }
}, 40);

Fade.prototype.start = function (callbackFn) {
  this.pos = 0;
  this.fnIndex = Fade.fnIndex++;
  var fade = this;

  fade.fn(fade.pos);
  Fade.fnMap[fade.fnIndex] = function () {
    fade.pos += fade.speed;
    if (fade.pos > 0.999) {
      fade.pos = 1;
      delete Fade.fnMap[fade.fnIndex];
      fade.fn(fade.pos);
      callbackFn();
    }
    else {
      fade.fn(fade.pos);
    }
  };
};

function Evt() {
}

if (document.addEventListener) {
  Evt.attach = function attach(el, type, fn) {
    el.addEventListener(type, fn, false);
  };
}
else if (document.attachEvent) {
  Evt.attach = function attach(el, type, fn) {
    el.attachEvent('on' + type, fn);
  };
}
else {
  DEBUG && assert(false);
}


var DEBUG = true;

function assert(condition, opt_message) {
  if (!condition) {

    if (window.console) {

      // メッセージの表示
      console.log('Assertion Failure');
      if (opt_message) console.log('Message: ' + opt_message);

      // スタックトレースの表示
      if (console.trace) console.trace();
      if (Error().stack) console.log(Error().stack);
    }

    // デバッガーを起動し、ブレークする
    debugger;
  }
}

// エントリーポイント
var app = new Application();
app.start();
