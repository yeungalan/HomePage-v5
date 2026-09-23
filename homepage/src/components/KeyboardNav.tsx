"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from '@/i18n';
import { HEADER_MENU_CONFIG } from '@/data/navigation';

/**
 * Site-wide keyboard navigation.
 *
 * - ← / → cycle through the header sections (Home → Places I visited → Goals →
 *   Posts → Projects → Friends → Architecture, wrapping around).
 * - Any key press switches into "keyboard mode": every visible button and link
 *   gets a small hint badge on its right edge. Typing that hint clicks it.
 *   Section links always use their number (1–7); everything else gets letters.
 * - Moving or clicking the mouse, touching the screen or pressing Esc leaves
 *   keyboard mode.
 * - Post pages opt out entirely: there ← / → mean previous / next post (see
 *   PostNavigation) and no hints are shown, so reading stays undisturbed.
 */

/** Every navigable section, in header order (the "More" submenu flattened in). */
const SECTIONS: string[] = HEADER_MENU_CONFIG.flatMap((item) => [
  ...(item.path !== '#' ? [item.path] : []),
  ...(item.subMenu?.map((sub) => sub.path) ?? []),
]);

/** Home row first, so the most common hints are the easiest to reach. */
const ALPHABET = 'asdfghjklqwertyuiopzxcvbnm';

const CLICKABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  '[role="button"]',
  '[role="tab"]',
  '[role="menuitem"]',
  'summary',
].join(',');

/** How far the mouse must travel before we assume the user went back to it. */
const MOUSE_EXIT_DISTANCE = 8;

interface Hint {
  el: HTMLElement;
  label: string;
  x: number;
  y: number;
}

const sectionIndexOf = (pathname: string) =>
  SECTIONS.findIndex((path) =>
    path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`)
  );

const isPostPage = (pathname: string) => pathname.startsWith('/posts/');

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
};

/**
 * Prefix-free hint labels (Vimium style): as many single letters as possible,
 * the rest two letters long using the remaining letters as prefixes.
 */
const makeLabels = (count: number): string[] => {
  const k = ALPHABET.length;
  if (count <= k) return ALPHABET.slice(0, count).split('');
  const singles = Math.max(0, Math.floor((k * k - count) / (k - 1)));
  const labels = ALPHABET.slice(0, singles).split('');
  for (const prefix of ALPHABET.slice(singles)) {
    for (const c of ALPHABET) {
      if (labels.length >= count) return labels;
      labels.push(prefix + c);
    }
  }
  return labels;
};

/** Internal section path an element links to, if any. */
const sectionPathOf = (el: HTMLElement): string | undefined => {
  if (!(el instanceof HTMLAnchorElement)) return undefined;
  const url = new URL(el.href, window.location.href);
  if (url.origin !== window.location.origin || url.hash) return undefined;
  return SECTIONS.includes(url.pathname) ? url.pathname : undefined;
};

const isVisible = (el: HTMLElement, rect: DOMRect) => {
  if (rect.width === 0 || rect.height === 0) return false;
  if (rect.bottom <= 0 || rect.right <= 0) return false;
  if (rect.top >= window.innerHeight || rect.left >= window.innerWidth) return false;
  if (el.closest('[aria-hidden="true"], [inert]')) return false;
  // Skip elements covered by something else (e.g. content under the header).
  const x = Math.min(Math.max(rect.left + rect.width / 2, 0), window.innerWidth - 1);
  const y = Math.min(Math.max(rect.top + rect.height / 2, 0), window.innerHeight - 1);
  const top = document.elementFromPoint(x, y);
  return !!top && (el === top || el.contains(top));
};

/** Where a hint sits for an element: on its right edge, vertically centred. */
const anchorOf = (rect: DOMRect) => ({
  x: Math.min(rect.right, window.innerWidth - 12),
  y: rect.top + rect.height / 2,
});

/** Combined inline opacity of an element and its ancestors (motion animates this). */
const opacityOf = (el: HTMLElement) => {
  let opacity = 1;
  for (let node: HTMLElement | null = el; node && node !== document.body; node = node.parentElement) {
    if (node.style.opacity) opacity *= parseFloat(node.style.opacity);
  }
  return opacity;
};

/**
 * A button that wraps a link usually does nothing itself; the link is the
 * real target, so hint that instead.
 */
const wrapsLink = (el: HTMLElement) =>
  !(el instanceof HTMLAnchorElement) && !!el.querySelector('a[href]');

const collectHints = (): Hint[] => {
  const found: { el: HTMLElement; rect: DOMRect; section?: string }[] = [];
  document.querySelectorAll<HTMLElement>(CLICKABLE_SELECTOR).forEach((el) => {
    if (el.closest('[data-keyboard-nav-overlay]')) return;
    if (el.getAttribute('href') === '#') return;
    if (wrapsLink(el)) return;
    // Only hint the outermost clickable (e.g. a button wrapped in a link),
    // unless that outer one was skipped in favour of its link.
    const outer = el.parentElement?.closest<HTMLElement>(CLICKABLE_SELECTOR);
    if (outer && !wrapsLink(outer)) return;
    const rect = el.getBoundingClientRect();
    if (!isVisible(el, rect)) return;
    found.push({ el, rect, section: sectionPathOf(el) });
  });

  const letters = makeLabels(found.filter((f) => !f.section).length);
  let next = 0;
  return found.map(({ el, rect, section }) => ({
    el,
    label: section ? String(SECTIONS.indexOf(section) + 1) : letters[next++],
    ...anchorOf(rect),
  }));
};

export function KeyboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslation();
  const [active, setActive] = useState(false);
  const [typed, setTyped] = useState('');
  const [hints, setHints] = useState<Hint[]>([]);

  // Refs so the (once-registered) key handler always sees the latest values.
  const state = useRef({ active, typed, hints, pathname });
  state.current = { active, typed, hints, pathname };
  const mouseOrigin = useRef<{ x: number; y: number } | null>(null);
  const badges = useRef<(HTMLElement | null)[]>([]);

  const exit = useCallback(() => {
    setActive(false);
    setTyped('');
    mouseOrigin.current = null;
  }, []);

  const goToSection = useCallback(
    (step: number) => {
      const current = sectionIndexOf(state.current.pathname);
      const from = current === -1 ? (step > 0 ? -1 : 0) : current;
      const target = (from + step + SECTIONS.length) % SECTIONS.length;
      router.push(SECTIONS[target]);
    },
    [router]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
      if (isTypingTarget(e.target)) return;
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) return;

      const { active, typed, hints, pathname } = state.current;
      if (isPostPage(pathname)) return;

      if (e.key === 'Escape') {
        if (typed) setTyped('');
        else if (active) exit();
        return;
      }

      if (!active) setActive(true);

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        setTyped('');
        goToSection(e.key === 'ArrowRight' ? 1 : -1);
        return;
      }

      if (e.key === 'Backspace' && typed) {
        e.preventDefault();
        setTyped(typed.slice(0, -1));
        return;
      }

      // The press that turns keyboard mode on only reveals the hints.
      if (!active || e.key.length !== 1) return;

      const next = typed + e.key.toLowerCase();
      const matches = hints.filter((h) => h.label.startsWith(next));
      if (matches.length === 0) return;
      e.preventDefault();

      const exact = matches.find((h) => h.label === next);
      if (exact) {
        setTyped('');
        exact.el.focus({ preventScroll: true });
        exact.el.click();
      } else {
        setTyped(next);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!state.current.active) return;
      const origin = mouseOrigin.current;
      if (!origin) {
        mouseOrigin.current = { x: e.clientX, y: e.clientY };
        return;
      }
      if (Math.hypot(e.clientX - origin.x, e.clientY - origin.y) > MOUSE_EXIT_DISTANCE) exit();
    };

    const onPointerDown = () => {
      if (state.current.active) exit();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onPointerDown, { passive: true });
    window.addEventListener('touchstart', onPointerDown, { passive: true });
    // Lets E2E tests wait until the hotkeys are live.
    document.documentElement.dataset.keyboardNav = 'ready';
    return () => {
      delete document.documentElement.dataset.keyboardNav;
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('touchstart', onPointerDown);
    };
  }, [exit, goToSection]);

  // Leave keyboard mode when opening a post (e.g. by its hint from /posts).
  useEffect(() => {
    if (isPostPage(pathname)) exit();
  }, [pathname, exit]);

  // While in keyboard mode, keep the hints in sync with the page.
  useEffect(() => {
    if (!active) {
      setHints([]);
      return;
    }

    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setHints(collectHints()));
    };
    const refreshSoon = () => {
      clearTimeout(timer);
      timer = setTimeout(refresh, 100);
    };

    refresh();
    // Entry animations move things around right after a route change.
    const settle = setTimeout(refresh, 600);
    const observer = new MutationObserver(refreshSoon);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
    window.addEventListener('scroll', refresh, { passive: true, capture: true });
    window.addEventListener('resize', refresh);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      clearTimeout(settle);
      observer.disconnect();
      window.removeEventListener('scroll', refresh, { capture: true });
      window.removeEventListener('resize', refresh);
    };
  }, [active, pathname]);

  // Glue each badge to its element every frame, so it follows hover, entry and
  // layout animations. Styles are written directly to avoid re-rendering.
  useEffect(() => {
    if (!active || hints.length === 0) return;
    let frame = 0;
    const track = () => {
      hints.forEach((hint, i) => {
        const badge = badges.current[i];
        if (!badge) return;
        const rect = hint.el.getBoundingClientRect();
        const { x, y } = anchorOf(rect);
        badge.style.left = `${x}px`;
        badge.style.top = `${y}px`;
        badge.style.opacity = rect.width && rect.height ? String(opacityOf(hint.el)) : '0';
      });
      frame = requestAnimationFrame(track);
    };
    track();
    return () => cancelAnimationFrame(frame);
  }, [active, hints]);

  if (!active) return null;

  return (
    <div
      data-keyboard-nav-overlay
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 1000 }}
    >
      {hints.map((hint, i) => {
        if (!hint.label.startsWith(typed)) return null;
        return (
          <kbd
            key={i}
            ref={(node) => {
              badges.current[i] = node;
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-md border border-zinc-900/10 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase leading-none text-white shadow-md dark:border-white/20 dark:bg-white dark:text-zinc-900"
            style={{ left: hint.x, top: hint.y }}
          >
            <span className="opacity-40">{hint.label.slice(0, typed.length)}</span>
            {hint.label.slice(typed.length)}
          </kbd>
        );
      })}

      <div className="absolute bottom-4 left-1/2 hidden sm:flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-full border border-zinc-900/10 bg-white/90 px-4 py-2 text-xs text-zinc-600 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/90 dark:text-zinc-300">
        <span>
          <kbd className="font-mono font-semibold">← →</kbd> {t('hotkeys.switchSection')}
        </span>
        <span className="opacity-40">·</span>
        <span>{t('hotkeys.pressToClick')}</span>
        <span className="opacity-40">·</span>
        <span>
          <kbd className="font-mono font-semibold">Esc</kbd> {t('hotkeys.exit')}
        </span>
      </div>
    </div>
  );
}
