export type Theme = 'dark' | 'light';

export const THEME_KEY = 'theme';

/** Runs in <head> before first paint so a saved light theme never flashes dark. */
export const THEME_INIT_SCRIPT = `try{if(localStorage.getItem('${THEME_KEY}')==='light')document.documentElement.dataset.theme='light'}catch(e){}`;

export function getTheme(): Theme {
    if (typeof document === 'undefined') return 'dark';
    return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export function setTheme(theme: Theme) {
    const root = document.documentElement;
    // Briefly cross-fade colours everywhere so the flip doesn't snap
    root.classList.add('theme-switching');
    window.setTimeout(() => root.classList.remove('theme-switching'), 600);

    if (theme === 'light') root.dataset.theme = 'light';
    else delete root.dataset.theme;

    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#ffffff' : '#000000');
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch {}
}

/** Foreground as "r, g, b", for canvases drawing with rgba(). Cheap enough to call per frame. */
export function fgRGB(): string {
    return getTheme() === 'light' ? '0, 0, 0' : '255, 255, 255';
}
