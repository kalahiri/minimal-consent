"use strict";

import Utils from "./Utils";
import Request from "./background/Request";
import History from "./background/History";
import Icon from "./background/Icon"
import URL from "./entities/URL";

const dateFormat = require('dateformat'); // from library
let request = new Request();
let history = new History();
let icon = new Icon();

/**
 * This Listener is required to receive message from the Content-Script. Out of th Listener we trigger the backend Call.
 */

chrome.runtime.onMessage.addListener(messageHandler);

function messageHandler(request, sender, sendResponse) {
    Utils.log("Request: " + JSON.stringify(request));
    Utils.log("sender: " + JSON.stringify(sender));
    Utils.log("sendResponse: " + JSON.stringify(sendResponse));

    switch (request.from) {
        case "contentscript":
            handleContentScript(request, sender, sendResponse);
            break;
        case "popupScript":
            Utils.log("sendResponse: " + JSON.stringify(sendResponse));
            handlePopupScript(request, sender, sendResponse);
            break;
        case "optionsScript":
            handleOptionsScript(request, sender, sendResponse);
            break;
        default:
            break;
    }

    return true;
}


async function handleContentScript(request, sender, sendResponse) {
    Utils.log("handleContentScript");
    let link = await getUrl();

    // check, if we have already something in the local storage.
    let lastFound = await history.getLastFound(link.host);

    // if there is already something, don't process further.
    if (Object.entries(lastFound).length !== 0) {
        Utils.log("The Page is already in the History. Don't consider further");
    }
    // only HTTP Pages will be supported
    else if (link.isHttp) {
        if (request.cmp && request.cmpScripUrl && typeof request.pingResult !== 'undefined' && typeof request.implemented !== 'undefined') {
            // for Security Reasons, we pass each Element separably over to the insert Method.
            let requestJson = {};
            requestJson.date = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss');
            requestJson.url = link.host;
            requestJson.cmp = request.cmp;
            requestJson.cmpScriptUrl = request.cmpScripUrl;
            requestJson.pingResult = request.pingResult;
            requestJson.implemented = request.implemented;
            logBackend(requestJson);
            storeRequest(requestJson);
            switchIcon(requestJson.implemented);
        }
    } else {
        Utils.log("handleContentScript: Current Page is not HTTP/HTTPS");
    }
}

async function handlePopupScript(request, sender, sendResponse) {
    let url = await getUrl();
    Utils.log("handlePopupScript: Current URL: " + JSON.stringify(url));

    let lastFound = {};

    // only HTTP Pages will be supported
    if (url.isHttp) {
        lastFound = await history.getLastFound(url.host);
    } else {
        Utils.log("handlePopupScript: Current Page is not HTTP/HTTPS");
    }

    // counting all elements we blocked.
    let count = await history.getAmountOfUrlsBlocked();

    let responseJson = {};
    responseJson.count = count;
    responseJson.lastFound = lastFound;
    responseJson.currentUrl = url;


    /*
    {"count":1,"lastFound":{"cmp":"TrustArc Inc","cmpScriptUrl":"//consent.truste.com/notice?domain=forbes.com&c=teconsent","date":"2020-02-29 18:51:35","implemented":true,"pingResult":{"cmpId":41},"url":"www.forbes.com"},"currentUrl":{"_host":"www.forbes.com","_isHttp":true}}
     */

    Utils.log("Response to send: " + JSON.stringify(responseJson));
    Utils.log("Fcuntion: " + JSON.stringify(sendResponse));
    sendResponse(responseJson);
}

async function handleOptionsScript(request, sender, sendResponse) {
    if (request.cmd === "getHistory") {
        let hist = await history.load();
        sendResponse(hist);
    } else if (request.cmd === "clearHistory") {
        await history.clearStorage();
    }
}

function getUrl() {
    return new Promise(function (resolve, reject) {
        chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
            if (tabs.length > 0) {
                let url = new URL(tabs[0].url);
                resolve(url);
            } else {
                Utils.log("Tabs length is 0");
                reject();
            }
        });
    });
}

function logBackend(requestJson) {
    request.send(requestJson);
}

async function storeRequest(requestJson) {
    await history.save(requestJson);
}

function switchIcon(implemented) {
    icon.switchIcon(implemented);
}

/*** Init CRITICAL Event ***/
chrome.runtime.onInstalled.addListener(function (details) {

    let pages = [
        "/test/test-page/integration.html",
        "/options/options.html"
    ];

    // Only when the extension is installed for the first time
    if (details.reason === "install") {
        pages.forEach((url) => {
            chrome.tabs.create({
                active: false,
                url: chrome.extension.getURL(url),
            });
        });
    } else if (details.reason === "update") {
        pages.forEach((url) => {
            chrome.tabs.create({
                active: false,
                url: chrome.extension.getURL(url),
            });
        });
    }
});
