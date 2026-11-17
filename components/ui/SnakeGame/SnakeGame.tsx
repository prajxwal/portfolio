'use client';

/* ------------------------------------------------------------------ *
 *  Snake — based on "Snake Grid" by Originkit, extended to be playable.
 *
 *  Modes:
 *    demo     the snake plays itself (BFS to the food), as in the original
 *    playing  arrow keys / WASD / swipe steer it; walls and self kill it
 *    over     blinks, then waits for any direction to start again
 * ------------------------------------------------------------------ */

import { useEffect, useRef, type CSSProperties } from 'react';

export type SnakeStatus = 'demo' | 'playing' | 'over';

interface SnakeGameProps {
    snakeColor?: string;
    foodColor?: string;
    boardColor?: string;
    cellSize?: number;
    gap?: number;
    /** 0–20; 20 = perfect circles */
    rounded?: number;
    /** steps per second while the demo plays */
    demoSpeed?: number;
    /** steps per second when a player starts; ramps up as they eat */
    playSpeed?: number;
    /** % the tail fades to */
    fade?: number;
    onScore?: (score: number) => void;
    onStatus?: (status: SnakeStatus) => void;
    style?: CSSProperties;
}

const DEATH_BLINKS = 3;
const BLINK_MS = 180;
const START_LENGTH = 3;

const STEPS: Array<[number, number]> = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
];

const KEY_DIRS: Record<string, [number, number]> = {
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    w: [0, -1],
    s: [0, 1],
    a: [-1, 0],
    d: [1, 0],
};

function parseColor(color: string): [number, number, number, number] {
    const value = (color ?? '').trim();
    const hex = value.replace('#', '');
    if (/^[0-9a-f]{6}$/i.test(hex)) {
        return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16), 1];
    }
    const match = value.match(/rgba?\(([^)]+)\)/i);
    if (match) {
        const p = match[1].split(',').map((x) => parseFloat(x));
        return [p[0] || 0, p[1] || 0, p[2] || 0, p[3] === undefined ? 1 : p[3]];
    }
    return [255, 255, 255, 1];
}

const rgba = (c: [number, number, number, number], alpha: number) =>
    `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${c[3] * alpha})`;

export default function SnakeGame({
    snakeColor = '#FFFFFF',
    foodColor = '#F9731A',
    boardColor = 'rgba(255, 255, 255, 0.06)',
    cellSize = 28,
    gap = 2,
    rounded = 20,
    demoSpeed = 10,
    playSpeed = 8,
    fade = 32,
    onScore,
    onStatus,
    style,
}: SnakeGameProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    // Keep latest callbacks without restarting the game loop
    const cbRef = useRef({ onScore, onStatus });
    cbRef.current = { onScore, onStatus };

    useEffect(() => {
        const canvasEl = canvasRef.current;
        if (!canvasEl) return;
        const context = canvasEl.getContext('2d');
        if (!context) return;
        const canvas: HTMLCanvasElement = canvasEl;
        const ctx: CanvasRenderingContext2D = context;

        const snakeRGB = parseColor(snakeColor);
        const foodRGB = parseColor(foodColor);
        const boardRGB = parseColor(boardColor);
        const pitch = cellSize + gap;
        const tailFade = fade / 100;

        let alive = true;
        let raf = 0;
        let last = 0;
        let acc = 0;
        let dpr = 1;
        let cols = 0;
        let rows = 0;
        let cellW = 0;
        let cellH = 0;
        let pitchX = 0;
        let pitchY = 0;
        let cellRadius = 0;
        let snake: number[] = [];
        let food = -1;
        let dying = 0;

        let mode: SnakeStatus = 'demo';
        let dir: [number, number] = [1, 0];
        const queue: Array<[number, number]> = [];
        let score = 0;

        const setMode = (m: SnakeStatus) => {
            mode = m;
            cbRef.current.onStatus?.(m);
        };
        const setScore = (n: number) => {
            score = n;
            cbRef.current.onScore?.(n);
        };

        const idx = (col: number, row: number) => row * cols + col;
        const colOf = (i: number) => i % cols;
        const rowOf = (i: number) => Math.floor(i / cols);

        function placeFood() {
            const body = new Set(snake);
            const free: number[] = [];
            for (let i = 0; i < cols * rows; i++) if (!body.has(i)) free.push(i);
            food = free.length ? free[Math.floor(Math.random() * free.length)] : -1;
        }

        function reset(length: number) {
            const midCol = Math.floor(cols / 2);
            const midRow = Math.floor(rows / 2);
            const len = Math.min(Math.max(1, length), Math.max(1, cols - 2));
            snake = [];
            for (let i = 0; i < len; i++) snake.push(idx(Math.max(0, midCol - i), midRow));
            dir = [1, 0];
            queue.length = 0;
            placeFood();
        }

        // ---------------------------------------------------- demo AI
        function blocked(ahead: number): Set<number> {
            return new Set(snake.slice(0, Math.max(0, snake.length - ahead)));
        }

        function neighbours(cell: number): number[] {
            const col = colOf(cell);
            const row = rowOf(cell);
            const out: number[] = [];
            for (const [dx, dy] of STEPS) {
                const nc = col + dx;
                const nr = row + dy;
                if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
                out.push(idx(nc, nr));
            }
            return out;
        }

        function stepTowardFood(): number {
            if (food < 0) return -1;
            const head = snake[0];
            const walls = blocked(1);
            const prev = new Map<number, number>();
            const seen = new Set<number>([head]);
            let frontier = [head];
            while (frontier.length) {
                const next: number[] = [];
                for (const cell of frontier) {
                    for (const n of neighbours(cell)) {
                        if (seen.has(n) || walls.has(n)) continue;
                        seen.add(n);
                        prev.set(n, cell);
                        if (n === food) {
                            let at = n;
                            while (prev.get(at) !== head) at = prev.get(at) as number;
                            return at;
                        }
                        next.push(n);
                    }
                }
                frontier = next;
            }
            return -1;
        }

        function room(from: number): number {
            const walls = blocked(1);
            const seen = new Set<number>([from]);
            let frontier = [from];
            let count = 0;
            while (frontier.length && count < cols * rows) {
                const next: number[] = [];
                for (const cell of frontier) {
                    count++;
                    for (const n of neighbours(cell)) {
                        if (seen.has(n) || walls.has(n)) continue;
                        seen.add(n);
                        next.push(n);
                    }
                }
                frontier = next;
            }
            return count;
        }

        function advanceDemo() {
            let target = stepTowardFood();
            if (target < 0) {
                const walls = blocked(1);
                let bestRoom = -1;
                for (const n of neighbours(snake[0])) {
                    if (walls.has(n)) continue;
                    const space = room(n);
                    if (space > bestRoom) {
                        bestRoom = space;
                        target = n;
                    }
                }
            }
            if (target < 0) {
                dying = DEATH_BLINKS * BLINK_MS * 2;
                return;
            }
            snake.unshift(target);
            if (target === food) placeFood();
            else snake.pop();
        }

        // ---------------------------------------------------- player
        function advancePlayer() {
            const next = queue.shift();
            if (next) dir = next;
            const col = colOf(snake[0]) + dir[0];
            const row = rowOf(snake[0]) + dir[1];
            const target = idx(col, row);
            const eating = target === food;
            // The tail moves out of the way this step unless we're growing
            const body = eating ? snake : snake.slice(0, -1);

            if (col < 0 || row < 0 || col >= cols || row >= rows || body.includes(target)) {
                dying = DEATH_BLINKS * BLINK_MS * 2;
                setMode('over');
                return;
            }

            snake.unshift(target);
            if (eating) {
                setScore(score + 1);
                placeFood();
            } else {
                snake.pop();
            }
        }

        function steer(dx: number, dy: number) {
            if (mode !== 'playing') {
                if (dying > 0 && mode === 'over') return; // let the death blink finish
                reset(START_LENGTH);
                setScore(0);
                setMode('playing');
                acc = 0;
                if (!(dx === -1 && dy === 0)) queue.push([dx, dy]);
                return;
            }
            const lastDir = queue.length ? queue[queue.length - 1] : dir;
            if ((dx === lastDir[0] && dy === lastDir[1]) || (dx === -lastDir[0] && dy === -lastDir[1])) return;
            if (queue.length < 2) queue.push([dx, dy]);
        }

        // ---------------------------------------------------- drawing
        function tile(col: number, row: number) {
            const x = col * pitchX;
            const y = row * pitchY;
            if (cellRadius > 0 && typeof ctx.roundRect === 'function') ctx.roundRect(x, y, cellW, cellH, cellRadius);
            else ctx.rect(x, y, cellW, cellH);
        }

        function drawSnake(alpha = 1) {
            for (let i = 0; i < snake.length; i++) {
                const along = snake.length > 1 ? i / (snake.length - 1) : 0;
                ctx.beginPath();
                tile(colOf(snake[i]), rowOf(snake[i]));
                ctx.fillStyle = rgba(snakeRGB, (1 - along * tailFade) * alpha);
                ctx.fill();
            }
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
            ctx.beginPath();
            for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) tile(col, row);
            ctx.fillStyle = rgba(boardRGB, 1);
            ctx.fill();

            if (dying > 0) {
                if (Math.floor(dying / BLINK_MS) % 2 === 0) drawSnake();
                return;
            }

            if (food >= 0) {
                ctx.beginPath();
                tile(colOf(food), rowOf(food));
                ctx.fillStyle = rgba(foodRGB, 1);
                ctx.fill();
            }

            drawSnake(mode === 'over' ? 0.3 : mode === 'demo' ? 0.55 : 1);
        }

        function build() {
            dpr = Math.min(2, window.devicePixelRatio || 1);
            const w = Math.max(1, Math.round(canvas.clientWidth));
            const h = Math.max(1, Math.round(canvas.clientHeight));
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            cols = Math.max(6, Math.floor((w + gap) / pitch));
            rows = Math.max(6, Math.floor((h + gap) / pitch));
            cellW = Math.max(1, (w - gap * (cols - 1)) / cols);
            cellH = Math.max(1, (h - gap * (rows - 1)) / rows);
            pitchX = cellW + gap;
            pitchY = cellH + gap;
            cellRadius = (Math.min(cellW, cellH) / 2) * (Math.min(20, Math.max(0, rounded)) / 20);
            // A resize mid-game invalidates every cell index, so fall back to the demo
            dying = 0;
            setMode('demo');
            reset(START_LENGTH);
        }

        function loop(time: number) {
            if (!alive) return;
            const dt = last ? Math.min(time - last, 200) : 0;
            last = time;

            if (dying > 0) {
                dying -= dt;
                if (dying <= 0) {
                    dying = 0;
                    acc = 0;
                    if (mode === 'demo') reset(START_LENGTH);
                }
            } else if (mode !== 'over') {
                const stepsPerSec = mode === 'playing' ? Math.min(18, playSpeed + score * 0.3) : demoSpeed;
                const stepEvery = 1000 / stepsPerSec;
                acc += dt;
                // advancePlayer() can flip mode to 'over' mid-loop
                while (acc >= stepEvery && dying <= 0 && (mode as SnakeStatus) !== 'over') {
                    acc -= stepEvery;
                    if (mode === 'playing') advancePlayer();
                    else advanceDemo();
                }
            }

            draw();
            raf = requestAnimationFrame(loop);
        }

        // ---------------------------------------------------- input
        const onKey = (e: KeyboardEvent) => {
            const d = KEY_DIRS[e.key] ?? KEY_DIRS[e.key.toLowerCase()];
            if (!d) return;
            e.preventDefault(); // stop arrows from scrolling the page
            steer(d[0], d[1]);
        };

        let touchStart: { x: number; y: number } | null = null;
        const onDown = (e: PointerEvent) => {
            touchStart = { x: e.clientX, y: e.clientY };
        };
        const onUp = (e: PointerEvent) => {
            if (!touchStart) return;
            const dx = e.clientX - touchStart.x;
            const dy = e.clientY - touchStart.y;
            touchStart = null;
            if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) {
                // A tap starts a game heading right
                if (mode !== 'playing') steer(1, 0);
                return;
            }
            if (Math.abs(dx) > Math.abs(dy)) steer(Math.sign(dx), 0);
            else steer(0, Math.sign(dy));
        };

        build();

        let built = `${canvas.clientWidth}x${canvas.clientHeight}`;
        const ro = new ResizeObserver(() => {
            const size = `${canvas.clientWidth}x${canvas.clientHeight}`;
            if (size === built) return;
            built = size;
            build();
        });
        ro.observe(canvas);

        window.addEventListener('keydown', onKey);
        canvas.addEventListener('pointerdown', onDown);
        canvas.addEventListener('pointerup', onUp);
        raf = requestAnimationFrame(loop);

        return () => {
            alive = false;
            cancelAnimationFrame(raf);
            ro.disconnect();
            window.removeEventListener('keydown', onKey);
            canvas.removeEventListener('pointerdown', onDown);
            canvas.removeEventListener('pointerup', onUp);
        };
    }, [snakeColor, foodColor, boardColor, cellSize, gap, rounded, demoSpeed, playSpeed, fade]);

    return (
        <div style={{ ...style, position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}>
            <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
            />
        </div>
    );
}
