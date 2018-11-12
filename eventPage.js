var points = [],
    currentTab;

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        points[sender.tab.id] = request;
    }
);

function checkForValidUrl(tabId, changeInfo, tabInfo) {
    if (tabInfo.url.match(/.*zezo.org.*chart.pl.*/)) {
        currentTab = tabId;
        chrome.pageAction.show(tabId);
    }
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function (tab) {
        checkForValidUrl(activeInfo.tabId, null, tab);
    });
});

chrome.tabs.onUpdated.addListener(checkForValidUrl);
