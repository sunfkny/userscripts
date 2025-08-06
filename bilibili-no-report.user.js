// ==UserScript==
// @name         bilibili no report
// @description
// @namespace    sunfkny
// @version      1.0
// @match        *://*.bilibili.com/*
// @icon         https://www.bilibili.com/favicon.ico
// @exclude      https://message.bilibili.com/pages/nav/header_sync
// @run-at       document-body
// @grant        unsafeWindow
// ==/UserScript==

(function () {
    "use strict";

    const debug = false; // 是否开启调试日志
    const showCounter = true; // 是否显示请求计数器
    const name = "bilibili no report";

    let counter;
    if (showCounter) {
        const counterId = "user-script-sunfkny-report-counter";
        counter = document.createElement("div");
        counter.id = counterId;
        counter.textContent = "0";
        counter.style.position = "fixed";
        counter.style.bottom = "10px";
        counter.style.left = "10px";
        counter.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        counter.style.color = "white";
        counter.style.minWidth = "6px";
        counter.style.textAlign = "center";
        counter.style.padding = "3px 6px";
        counter.style.borderRadius = "3px";
        counter.style.fontSize = "12px";
        counter.style.zIndex = "1000";
        counter.style.transition = "transform 0.3s ease, opacity 0.3s ease";
        counter.style.opacity = "0.5";
        counter.style.pointerEvents = "none";
        counter.style.userSelect = "none";
        counter.style.fontFamily = "Consolas,monaco,monospace";
        document.body.appendChild(counter);
    }

    let skippedRequests = 0;
    function updateCounter() {
        if (!showCounter) {
            return;
        }
        skippedRequests++;
        counter.textContent = String(skippedRequests);
        counter.style.transform = "scale(1.1)";
        counter.style.opacity = "1";

        setTimeout(() => {
            counter.style.transform = "scale(1)";
            counter.style.opacity = "0.5";
        }, 500);
    }
    function log(...args) {
        if (!debug) {
            return;
        }
        console.log(`[user.js] [${name}]`, ...args);
    }

    const urlsShouldSkip = [
        new RegExp("^(?:https?:)?//data\\.bilibili\\.com/"),
        new RegExp("^(?:https?:)?//cm\\.bilibili\\.com/cm/api/"),
        new RegExp("^(?:https?:)?//data\\.bilivideo\\.com/log/web/"),
        new RegExp("^(?:https?:)?//s[01].hdslb.com/bfs/seed/log/report/"),
    ];
    function shouldSkipRequest(url) {
        if (typeof url !== "string") {
            return false;
        }
        const shouldSkip = urlsShouldSkip.some((r) => url.match(r));
        return shouldSkip;
    }

    const oldFetch = unsafeWindow.fetch;
    unsafeWindow.fetch = function (url, options) {
        if (shouldSkipRequest(url)) {
            log("fetch", url.split("?")[0]);
            updateCounter();
            return Promise.resolve(new Response());
        }
        return oldFetch.apply(this, arguments);
    };
    const oldSend = unsafeWindow.XMLHttpRequest.prototype.open;
    unsafeWindow.XMLHttpRequest.prototype.open = function (method, url) {
        if (shouldSkipRequest(url)) {
            this.send = function () {
                log("XMLHttpRequest", url.split("?")[0]);
                updateCounter();
            };
        }
        return oldSend.apply(this, arguments);
    };

    unsafeWindow.navigator.sendBeacon = (url, data) => {
        log("sendBeacon", url.split("?")[0]);
        updateCounter();
        return Promise.resolve();
    };
})();
