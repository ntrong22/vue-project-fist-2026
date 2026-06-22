/**
 * Mẫu JS thư viện tải về (UMD) — đặt trong public/vendor/
 * URL: /vendor/sample-lib/sample-lib.js
 * Khai báo: nuxt.config.js → app.head.script
 *
 * Sau khi load: window.SampleLib.init('[data-sample-lib]')
 */
(function (global) {
  'use strict';

  var SampleLib = {
    version: '1.0.0-sample',

    init: function (selector) {
      if (!global.document) {
        return 0;
      }

      var query = selector || '[data-sample-lib]';
      var nodes = global.document.querySelectorAll(query);
      var i;

      for (i = 0; i < nodes.length; i += 1) {
        nodes[i].classList.add('sample-lib-ready');
      }

      return nodes.length;
    },
  };

  global.SampleLib = SampleLib;
})(typeof window !== 'undefined' ? window : this);
