import { onBeforeUnmount } from 'vue';

export const useDebounce = (callback, delay = 300) => {
  let timerId = null;

  const run = (...args) => {
    if (timerId) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      callback(...args);
    }, delay);
  };

  const cancel = () => {
    if (!timerId) {
      return;
    }

    clearTimeout(timerId);
    timerId = null;
  };

  onBeforeUnmount(() => {
    cancel();
  });

  return {
    run,
    cancel,
  };
};

export default useDebounce;
