import { useEffect } from 'react';

function setMeta(selector, attr, value) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    const [, key, val] = selector.match(/\[(\w+:?\w*)="(.+)"\]/);
    el.setAttribute(key, val);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

// Atualiza título e meta tags por página (SEO básico + Open Graph)
export function useSeo({ title, description, image }) {
  useEffect(() => {
    if (title) {
      document.title = title;
      setMeta('meta[property="og:title"]', 'content', title);
    }
    if (description) {
      setMeta('meta[name="description"]', 'content', description);
      setMeta('meta[property="og:description"]', 'content', description);
    }
    if (image) setMeta('meta[property="og:image"]', 'content', image);
  }, [title, description, image]);
}
