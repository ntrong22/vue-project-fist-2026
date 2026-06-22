/**
 * Mẫu plugin client — gọi thư viện JS trong public/vendor/ sau khi script đã load.
 * Cần bật script trong nuxt.config.js → app.head.script
 */
export default defineNuxtPlugin(() => {
  const run = () => {
    if (typeof window.SampleLib?.init !== 'function') {
      return;
    }

    window.SampleLib.init('[data-sample-lib]');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
    return;
  }

  run();
});
