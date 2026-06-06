import { lazyImageDirective } from '@/directives/lazyImage';

export const registerDirectives = (app) => {
  app.directive('lazy-image', lazyImageDirective);
};

export default registerDirectives;
