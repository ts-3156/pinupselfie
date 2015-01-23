function Application() {
  this.logoSrcUrl_ = 'http://bijostagram.com/img/title_logo.png';
  // cache
  this.logoImg_ = new CachableImage(this.logoSrcUrl_);
  this.containerEl_ = null;

  //this.popularApiUrl_ = 'popular_json.json';
  this.popularApiUrl_ = 'assets/json/cute.json';

  //this.cuteApiUrl_ = 'cute_json.json';
  this.cuteApiUrl_ = 'assets/json/cute.json';

  this.bodyEl_ = document.body;
  this.mainEl_ = document.getElementById('main');
  this.mainStyle_ = this.mainEl_.style;
  this.placingStrategy_ = new PlacingStrategy();
  this.viewportWidth_ = this.bodyEl_.offsetWidth;
  this.viewportHeight_ = this.bodyEl_.offsetHeight;
  var self = this;
  Evt.attach(window, 'resize', function() {
    self.viewportWidth_ = self.bodyEl_.offsetWidth;
    self.viewportHeight_ = self.bodyEl_.offsetHeight;
  });
}

Application.prototype.start = function start() {
  var app = this;
  var serial = 0;
  app.phaseOfOpening(serial++,
      function() {
        app.phaseOfLoop(serial++, function loop() {
              app.phaseOfLoop(serial++, loop, function() {
                // TODO
              });
            },
            function() {
              // TODO
            });
      },
      function(err) {
        // TODO
      }
  );
};

Application.prototype.phaseOfOpening = function(serial, callbackFn, errorbackFn) {
  var app = this;
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      try {
        var urlList = JSON.parse(xhr.responseText);
      }
      catch (e) {
        DEBUG && assert(false);
        errorbackFn('JSON Parse Error', xhr.responseText);
      }
      afterGetUrlList(Util.shuffle(urlList));
    }
  };
  xhr.open('GET', this.popularApiUrl_ + '?seed=' + Math.random());
  xhr.send(null);

  function afterGetUrlList(urlInfoList) {
    var layout = app.calcLayout();
    var containerRect = layout[0];
    var imageSize = layout[1];
    var leftMargin = layout[2];
    var topMargin = layout[3];
    var containerEl = document.createElement('ul');
    app.mainEl_.appendChild(containerEl);
    app.containerEl_  = containerEl;

    var logoX = Math.ceil(containerRect.width / 2) - 1;
    var logoY = Math.ceil(containerRect.height / 2) - 1;
    var logoRect = new TileRect(logoX, logoY, 2, 1);
    var logoEl = app.logoImg_.getElement();
    var logoWrapper = new Wrapper(logoEl, 'http://bijostagram.com/', logoRect, imageSize, leftMargin, topMargin);
    var logoWrapperStyle = logoWrapper.getWrapperStyle();
    containerEl.appendChild(logoWrapper.getWrapperElement());
    Style.setOpacity(logoWrapperStyle, 0);
    var fade = new Fade(function(pos) {
      Style.setOpacity(logoWrapperStyle, Util.sinoidal(pos));
    }, 0.08);
    fade.start(function() {  });

    var socialEl_ = document.createElement('li');
    var socialX = containerRect.width - 2;
    var socialY = containerRect.height - 1;
    var socialRect = new TileRect(socialX, socialY , 2, 1);
    containerEl.appendChild(socialEl_);
    Style.setRect(socialEl_.style, socialRect, imageSize, leftMargin, topMargin);
    socialEl_.style.zIndex = 300;

    var likeWidth = 200;
    var facebookLikeEl = document.createElement('iframe');
    facebookLikeEl.className = 'facebook';
    facebookLikeEl.src = 'http://www.facebook.com/plugins/like.php?href=' + encodeURIComponent('http://bijostagram.com/') + '&layout=button_count&show_faces=true&width=' + encodeURIComponent(likeWidth) + '&action=like&colorscheme=light&height=80&colorscheme=dark';
    facebookLikeEl.style.width = likeWidth + 'px';
    facebookLikeEl.setAttribute('allowTransparency', "true");
    facebookLikeEl.setAttribute('frameBorder', "0");
    facebookLikeEl.setAttribute('scrolling', "no");
    socialEl_.appendChild(facebookLikeEl);

    var tweetEl = document.createElement('a');
    tweetEl.setAttribute('data-count', 'horizontal');
    tweetEl.setAttribute('data-lang', navigator.language || navigator.userLanguage);
    tweetEl.setAttribute('data-text', 'Bijostagram - Cute girls on Instagram.');
    tweetEl.setAttribute('data-url', 'http://bijostagram.com/');
    tweetEl.className = 'twitter-share-button';
    socialEl_.appendChild(tweetEl);

    var scriptEl = document.createElement('script');
    scriptEl.src = 'http://platform.twitter.com/widgets.js';
    scriptEl.type ='text/javascript';
    socialEl_.appendChild(scriptEl);

    var ancDiv = document.createElement('div');
    ancDiv.className = "pfj";
    socialEl_.appendChild(ancDiv);

    var ancEl2 = document.createElement('a');
    ancEl2.href = "/popular.html";
    ancEl2.style.color = "#FFFFFF";
    ancEl2.appendChild(document.createTextNode("Popular girls"));
    ancDiv.appendChild(ancEl2);

    var ancEl = document.createElement('a');
    ancEl.href = "http://calosearch.jp/";
    ancEl.style.color = "#000000";
    ancEl.appendChild(document.createTextNode("."));
    ancDiv.appendChild(ancEl);

    var rectList = app.placingStrategy_.execute(containerRect, logoRect);
    var imageLength = Math.min(rectList.length, urlInfoList.length);
    var loadFinishCount = 0;
    var isTimeout = false;

    for (var i = 0; i < imageLength; i++) {
      var rect = rectList[i];
      var urlInfo = urlInfoList[i];
      if (rect.width === 1 && rect.height === 1) {
        var img = new CachableImage(urlInfo.url);
      }
      else if (rect.width === 2 && rect.height === 2) {
        var img = new CachableImage(Util.getLargeUrl(urlInfo.url));
      }
      else {
        DEBUG && assert(false);
      }

      var imageEl = img.getElement();
      var wrapper = new Wrapper(imageEl, urlInfo.link, rect, imageSize, leftMargin, topMargin);
      containerEl.appendChild(wrapper.getWrapperElement());
      var imageStyle = wrapper.getWrapperStyle();
      Style.setOpacity(imageStyle, 0);
      (function handleLoad(img, imageStyle) {
        img.attachLoadEvent(function() {
          var fade = new Fade(function(pos) {
            Style.setOpacity(imageStyle, Util.sinoidal(pos));
          }, 0.08);
          fade.start(function() {
            loadFinishCount++;
            if (loadFinishCount >= imageLength) {
              if (!isTimeout) {
                clearTimeout(timeoutId);
                callbackFn();
              }
            }
          });
        });
      })(img, imageStyle);
    }

    var timeoutId = setTimeout(function() {
      isTimeout = true;
      callbackFn();
    }, 40000);
  }
};

Application.prototype.phaseOfLoop = function(serial, callbackFn, errorbackFn) {
  var app = this;
  var startTime = new Date().getTime();
  var prevContainerEl = app.containerEl_;
  prevContainerEl.className = 'prev';
  app.containerEl_ = null;
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      try {
        var urlList = JSON.parse(xhr.responseText);
      }
      catch (e) {
        DEBUG && assert(false);
        errorbackFn('JSON Parse Error', xhr.responseText);
      }
      afterGetUrlList(Util.shuffle(urlList));
    }
  };
  xhr.open('GET', this.cuteApiUrl_ + '?seed=' + Math.random());
  xhr.send(null);

  var imgRectList = [];

  function afterGetUrlList(urlInfoList) {
    var layout = app.calcLayout();
    var containerRect = layout[0];
    var imageSize = layout[1];
    var leftMargin = layout[2];
    var topMargin = layout[3];
    var containerEl = document.createElement('ul');
    app.mainEl_.appendChild(containerEl);
    app.containerEl_  = containerEl;

    var logoX = Math.ceil(containerRect.width / 2) - 1;
    var logoY = Math.ceil(containerRect.height / 2) - 1;
    var logoRect = new TileRect(logoX, logoY, 2, 1);
    var logoEl = app.logoImg_.getElement().cloneNode(false);
    var logoWrapper = new Wrapper(logoEl, 'http://bijostagram.com/', logoRect, imageSize, leftMargin, topMargin);
    var logoWrapperStyle = logoWrapper.getWrapperStyle();
    containerEl.appendChild(logoWrapper.getWrapperElement());

    var socialEl_ = document.createElement('li');
    var socialX = containerRect.width - 2;
    var socialY = containerRect.height - 1;
    var socialRect = new TileRect(socialX, socialY , 2, 1);
    containerEl.appendChild(socialEl_);
    Style.setRect(socialEl_.style, socialRect, imageSize, leftMargin, topMargin);
    socialEl_.style.zIndex = 300;

    var likeWidth = 200;
    var facebookLikeEl = document.createElement('iframe');
    facebookLikeEl.className = 'facebook';
    facebookLikeEl.src = 'http://www.facebook.com/plugins/like.php?href=' + encodeURIComponent('http://bijostagram.com/') + '&layout=button_count&show_faces=true&width=' + encodeURIComponent(likeWidth) + '&action=like&colorscheme=light&height=80&colorscheme=dark';
    facebookLikeEl.style.width = likeWidth + 'px';
    facebookLikeEl.setAttribute('allowTransparency', "true");
    facebookLikeEl.setAttribute('frameBorder', "0");
    facebookLikeEl.setAttribute('scrolling', "no");
    socialEl_.appendChild(facebookLikeEl);

    var tweetEl = document.createElement('a');
    tweetEl.setAttribute('data-count', 'horizontal');
    tweetEl.setAttribute('data-lang', navigator.language || navigator.userLanguage);
    tweetEl.setAttribute('data-text', 'Bijostagram - Cute girls on Instagram.');
    tweetEl.setAttribute('data-url', 'http://bijostagram.com/');
    tweetEl.className = 'twitter-share-button';
    socialEl_.appendChild(tweetEl);

    var scriptEl = document.createElement('script');
    scriptEl.src = 'http://platform.twitter.com/widgets.js';
    scriptEl.type ='text/javascript';
    socialEl_.appendChild(scriptEl);

    var ancDiv = document.createElement('div');
    ancDiv.className = "pfj";
    socialEl_.appendChild(ancDiv);

    var ancEl2 = document.createElement('a');
    ancEl2.href = "/popular.html";
    ancEl2.style.color = "#FFFFFF";
    ancEl2.appendChild(document.createTextNode("Popular girls"));
    ancDiv.appendChild(ancEl2);

    var ancEl = document.createElement('a');
    ancEl.href = "http://calosearch.jp/";
    ancEl.style.color = "#000000";
    ancEl.appendChild(document.createTextNode("."));
    ancDiv.appendChild(ancEl);

    var rectList = app.placingStrategy_.execute(containerRect, logoRect);
    var imageLength = Math.min(rectList.length, urlInfoList.length);
    var loadFinishCount = 0;
    var isTimeout = false;

    var timeoutId = setTimeout(function() {
      isTimeout = true;
      afterLoad();
    }, 40000);

    var loadFinishCount = 0;
    for (var i = 0; i < imageLength; i++) {
      var rect = rectList[i];
      var urlInfo = urlInfoList[i];
      if (rect.width === 1 && rect.height === 1) {
        var img = new CachableImage(urlInfo.url);
      }
      else if (rect.width === 2 && rect.height === 2) {
        var img = new CachableImage(Util.getLargeUrl(urlInfo.url));
      }
      else {
        DEBUG && assert(false);
      }

      var imageEl = img.getElement();
      var wrapper = new Wrapper(imageEl, urlInfo.link, rect, imageSize, leftMargin, topMargin);
      containerEl.appendChild(wrapper.getWrapperElement());

      (function handleLoad(img) {
        img.attachLoadEvent(function() {
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
    setTimeout(function() {
      style = prevContainerEl.style;
      var fade = new Fade(function(pos) {
        Style.setOpacity(style, Util.sinoidal(1 - pos));
      }, 0.06);
      fade.start(function() {
        app.mainEl_.removeChild(prevContainerEl);
        callbackFn();
      });
    }, Math.max(8000 - timeSpan, 1));
  }
};

Application.prototype.calcLayout = function() {
  var imageSize = 120;
  if (this.viewportHeight_ < this.viewportWidth_) {
    var numberOfImageY = Math.floor(this.viewportHeight_ / imageSize);
    var realImageSize = this.viewportHeight_ / numberOfImageY;
    var numberOfImageX = Math.floor(this.viewportWidth_ / realImageSize)
    var rect = new TileRect(0, 0, numberOfImageX, numberOfImageY);
    var leftMargin = (this.viewportWidth_ - numberOfImageX * realImageSize) / 2;
    var topMargin = 0;
  }
  else {
    var numberOfImageX = Math.floor(this.viewportWidth_ / imageSize);
    var realImageSize = this.viewportWidth_ / numberOfImageX;
    var numberOfImageY = Math.floor(this.viewportHeight_ / realImageSize)
    var rect = new TileRect(0, 0, numberOfImageX, numberOfImageY);
    var leftMargin = 0;
    var topMargin = (this.viewportHeight_ - numberOfImageY * realImageSize) / 2;
  }
  return [rect, realImageSize, leftMargin, topMargin];
};

function Wrapper(el, href, rect, size, leftMargin, topMargin) {
  this.el_ = el;
  this.anchorEl_ = document.createElement('a');
  this.anchorEl_.appendChild(this.el_);
  this.anchorEl_.href = href;
  this.wrapperEl_ = document.createElement('li');
  this.wrapperStyle_ = this.wrapperEl_.style;
  Style.setRect(this.wrapperStyle_, rect, size, leftMargin, topMargin);
  this.wrapperEl_.appendChild(this.anchorEl_);
}

Wrapper.prototype.getElement = function() {
  return this.el_;
};

Wrapper.prototype.getAnchorElement = function() {
  return this.anchorEl_;
};

Wrapper.prototype.getWrapperElement = function() {
  return this.wrapperEl_;
};

Wrapper.prototype.getWrapperStyle = function() {
  return this.wrapperStyle_;
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

TileRect.prototype.toString = function() {
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
  return url.replace(/_5/, '_6');
}

Util.sinoidal = function sinoidal(pos) {
  return (-Math.cos(pos*Math.PI)/2) + 0.5;
}

Util.shuffle = function(list) {
  var i = list.length;
  while(i){
    var j = Math.floor(Math.random()*i);
    var t = list[--i];
    list[i] = list[j];
    list[j] = t;
  }
  return list;
}

if (!window.XMLHttpRequest) {
  if (window.ActiveXObject) {
    window.XMLHttpRequest = function XMLHttpRequest() {
      try {
        return new ActiveXObject("Msxml2.XMLHTTP");
      }
      catch (e) {
        try {
          return new ActiveXObject("Microsoft.XMLHTTP");
        }
        catch (e2) {
          DEBUG && assert(false);
        }
      }
    };
  }
  else {
    DEBUG && assert(false);
  }
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
  for (var posX = containerRect.width - socialPanel.width; posX < containerRect.width; posX++){
    for (var posY = containerRect.height - socialPanel.height; posY < containerRect.height; posY++){
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
};

CachableImage.prototype.handleLoad_ = function() {
  this.loaded_ = true;
};

CachableImage.prototype.attachLoadEvent = function(fn) {
  if (this.loaded_) {
    fn();
  }
  else {
    Evt.attach(this.el_, 'load', fn);
  }
};

CachableImage.prototype.getElement = function() {
  return this.el_;
};

function Style() {
}

Style.setRect = function(style, rect, size, leftMargin, topMargin) {
  style.left = rect.left * size + leftMargin + 'px';
  style.top = rect.top * size + topMargin +  'px';
  style.width = rect.width * size + 'px';
  style.height = rect.height * size + 'px';
};

Style.setOpacity = function(style, opacity) {
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
}

function Fade(fn, speed) {
  this.fn = fn;
  this.speed = speed;
}

Fade.fnIndex = 0;

Fade.fnMap = {};

Fade.intervalId = setInterval(function() {
  for (var name in Fade.fnMap) {
    if (Fade.fnMap.hasOwnProperty(name)) {
      Fade.fnMap[name]();
    }
  }
}, 40);

Fade.prototype.start = function(callbackFn) {
  this.pos = 0;
  this.fnIndex = Fade.fnIndex++;
  var fade = this;

  fade.fn(fade.pos);
  Fade.fnMap[fade.fnIndex] = function() {
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
