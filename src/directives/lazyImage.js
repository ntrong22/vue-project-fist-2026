const setImageSource = (element, src = '') => {
  if (!src) {
    return;
  }

  if (element.tagName.toLowerCase() === 'img') {
    element.src = src;
    return;
  }

  element.style.backgroundImage = `url("${src}")`;
};

export const lazyImageDirective = {
  mounted(element, binding) {
    const imageSource = typeof binding.value === 'string' ? binding.value : '';

    if (!imageSource) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setImageSource(element, imageSource);
      return;
    }

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          setImageSource(element, imageSource);
          currentObserver.unobserve(entry.target);
        });
      },
      {
        rootMargin: '100px 0px',
        threshold: 0.01,
      },
    );

    element.__lazyObserver__ = observer;
    observer.observe(element);
  },
  unmounted(element) {
    if (element.__lazyObserver__) {
      element.__lazyObserver__.disconnect();
      delete element.__lazyObserver__;
    }
  },
};

export default lazyImageDirective;
