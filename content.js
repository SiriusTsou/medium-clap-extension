function main() {
  window.isHookFetch = false;
  window.hookFetch = function() {
    if (window.isHookFetch == false) {
      window.isHookFetch = true;
      console.log("hook start");
      _hookFetch();
    }
  };

  ! function(ob) {
    ob.hookFetch = function(funs) {
      window._fetch = window.fetch
      window.fetch = function(path, obj) {

        if (path.indexOf('https://medium.com/_/graphql') == 0) {
          if (obj.body) {
            var body = JSON.parse(obj.body)
            if (body.operationName && body.operationName === 'MultiVote_clap') {
              body.variables.numClaps = window.numClaps
              obj.body = JSON.stringify(body);
            }
            
          }
        }

        return window._fetch(path, obj)
      }
    }
  }(window);
}

function updateNumClaps(num) {
  window.numClaps = num
}

function injectJs(src) {
  var script = document.createElement('script');
  script.appendChild(document.createTextNode(src));
  (document.head || document.body || document.documentElement).appendChild(script);
  document.scripts[document.scripts.length-1].remove()
}

injectJs('(' + main + ')(); hookFetch();')

chrome.storage.sync.get(['clapOption'],function(result) {
  var numClaps = result.clapOption || 'clap'
  var OPTIONS = {
    'clap': 1,
    'clapclap': 10,
    'clapclapclap': 50,
  }

  injectJs('(' + updateNumClaps + ')('+OPTIONS[numClaps]+');')
})

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    var data = request.data || {};
    injectJs('(' + updateNumClaps + ')('+data+');')

    sendResponse({data: data, success: true});
});