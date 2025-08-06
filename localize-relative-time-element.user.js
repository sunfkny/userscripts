// ==UserScript==
// @name         Localize relative-time-element
// @namespace    sunfkny
// @version      1.0
// @description  Enable localization for all relative-time-element
// @match        https://github.com/*
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    /**
     * github/relative-time-element supports localization but requires a lang attribute.
     * See RelativeTimeElement#lang
     * https://github.com/github/relative-time-element/blob/main/src/relative-time-element.ts
     */
    function localizeElement(el) {
        if (el.tagName !== 'RELATIVE-TIME') return;
        el.lang = navigator.language;
    }

    // document.documentElement.setAttribute("lang", navigator.language);

    document.querySelectorAll('relative-time').forEach(localizeElement);

    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.tagName === 'RELATIVE-TIME') {
                        localizeElement(node);
                    }
                    node.querySelectorAll?.('relative-time')?.forEach(localizeElement);
                }
            });
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
