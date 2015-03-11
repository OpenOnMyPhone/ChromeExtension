function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, function(tabs) {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

var API_URL = "http://p2mp.illvili.me/";

function getContent(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  
  xhr.onreadystatechange = function() {//Call a function when the state changes.
    if(xhr.readyState == 4 && xhr.status == 200) {
      callback(xhr.responseText);
    }
  }
  
  xhr.send();
}

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

var uniqueid = null;
document.addEventListener('DOMContentLoaded', function() {
  if (!localStorage['CODE']) {
    getContent(API_URL + '?a=i', function (result) {
      document.getElementById('uniqueid').textContent = localStorage['CODE'] = uniqueid = result;
      renderStatus('Please set above id to you phone and reclick extension button');
    });
  } else {
    document.getElementById('uniqueid').textContent = uniqueid = localStorage['CODE'];
    renderStatus('Sending...');
    
    getCurrentTabUrl(function(url) {
      if (!/http/.test(url)) {
        renderStatus('Not a http url');
      } else {
        getContent(API_URL + '?a=p&i=' + uniqueid + '&u=' + encodeURIComponent(url), function (result) {
          var return_data = JSON.parse(result);
          console.log(return_data);
          
          if (!!return_data.error) {
            renderStatus(return_data.error.message);
          } else {
            renderStatus('Sent!');
          }
        });
      }
    });
  }
});
