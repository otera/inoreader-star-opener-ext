var ISO_TABCOUNT_DEF = 8;

function normalized_iso_tabcount(raw_value) {
  var tabcount = parseInt(raw_value);
  if (isNaN(tabcount) || tabcount <= 0 || tabcount > 20) {
    // Use default value if invalid
    tabcount = ISO_TABCOUNT_DEF;
  }
  return tabcount;
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.method == 'getOptions') {
    var raw_tabcount = null;
    chrome.storage.local.get('iso_tabcount', function (value) {
      raw_tabcount = value.iso_tabcount;
      var tabcount = normalized_iso_tabcount(raw_tabcount);
      sendResponse({ iso_tabcount: tabcount });
    });
    return true;
  } else if (request.method == 'setOptions') {
    var tabcount = normalized_iso_tabcount(request.tabcount);
    chrome.storage.local.set({ iso_tabcount: tabcount }, function () {
      sendResponse({ farewell: 'goodbye' });
    });
    return true;
  } else {
    sendResponse({});
    return true;
  }
});
