/*
 * Jellyfin Audiobook Speed Control
 * - Speed label in the now-playing bar (tap -> speed menu with -/+ and presets).
 * - Floating speed pill on the full-screen player page (where the bar is hidden).
 * - Steps configurable (default 0.25x, range 0.5x-3.0x).
 * - Keyboard: "[" slower, "]" faster, "\" reset to 1.0x.
 * Speed is remembered in localStorage and re-applied on every track change.
 */
(function () {
    'use strict';

    var STEP = __STEP__, FINE = __FINE__, MIN = __MIN__, MAX = __MAX__, KEY = 'audiobookPlaybackSpeed';
    var speed = clamp(parseFloat(localStorage.getItem(KEY)) || 1.0, FINE);

    function clamp(v, step) {
        step = step || STEP;
        var r = Math.round(v / step) * step;
        return Math.min(MAX, Math.max(MIN, Math.round(r * 1000) / 1000));
    }

    function fmt(v) {
        return v.toFixed(2).replace(/0$/, '') + 'x';
    }

    function apply() {
        // Only ever touch an <audio> element that actually has media loaded; never <video>.
        var a = document.querySelector('audio');
        if (a && (a.currentSrc || a.src) && a.playbackRate !== speed) {
            a.preservesPitch = true;
            a.playbackRate = speed;
        }
        Array.prototype.forEach.call(document.querySelectorAll('.abSpeedLabel'), function (el) {
            el.textContent = fmt(speed);
        });
        var sl = document.getElementById('abSlider');
        if (sl && parseFloat(sl.value) !== speed) sl.value = String(speed);
        var big = document.getElementById('abMenuValue');
        if (big) big.textContent = fmt(speed);
        Array.prototype.forEach.call(document.querySelectorAll('.abPreset'), function (el) {
            var on = Math.abs(parseFloat(el.dataset.v) - speed) < 0.001;
            el.style.background = on ? '#00a4dc' : 'rgba(255,255,255,.12)';
        });
    }

    function setSpeed(v, fine) {
        speed = clamp(v, fine ? FINE : STEP);
        try { localStorage.setItem(KEY, String(speed)); } catch (e) { /* ignore */ }
        apply();
    }

    function stop(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    function btnStyle(extra) {
        return 'color:#fff;border:0;border-radius:.4em;cursor:pointer;font-size:1.1em;padding:.6em .9em;' + (extra || '');
    }

    // ---- Speed menu -------------------------------------------------------
    function closeMenu() {
        var m = document.getElementById('abMenu');
        if (m) m.remove();
    }

    function openMenu() {
        closeMenu();
        var overlay = document.createElement('div');
        overlay.id = 'abMenu';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;';
        overlay.addEventListener('click', function (e) { stop(e); closeMenu(); });

        var box = document.createElement('div');
        box.style.cssText = 'background:#202020;color:#fff;border-radius:.8em;padding:1em;width:min(90vw,22em);max-height:90vh;overflow:auto;text-align:center;';
        box.addEventListener('click', function (e) { e.stopPropagation(); });

        var title = document.createElement('div');
        title.textContent = 'Playback speed  (v1.0.4)';
        title.style.cssText = 'opacity:.7;margin-bottom:.4em;';
        box.appendChild(title);

        var row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:.8em;margin-bottom:1em;';
        var minus = document.createElement('button');
        minus.type = 'button';
        minus.textContent = '−';
        minus.style.cssText = btnStyle('background:rgba(255,255,255,.12);font-size:1.6em;');
        minus.addEventListener('click', function (e) { stop(e); setSpeed(speed - STEP, speed % STEP > 0.0001 && speed % STEP < STEP - 0.0001 ? true : false); });
        var val = document.createElement('div');
        val.id = 'abMenuValue';
        val.style.cssText = 'font-size:2em;min-width:3.5em;';
        var plus = document.createElement('button');
        plus.type = 'button';
        plus.textContent = '+';
        plus.style.cssText = btnStyle('background:rgba(255,255,255,.12);font-size:1.6em;');
        plus.addEventListener('click', function (e) { stop(e); setSpeed(speed + STEP, speed % STEP > 0.0001 && speed % STEP < STEP - 0.0001 ? true : false); });
        row.appendChild(minus);
        row.appendChild(val);
        row.appendChild(plus);
        box.appendChild(row);

        var fineRow = document.createElement('div');
        fineRow.style.cssText = 'margin-bottom:1em;text-align:left;';
        var fineLbl = document.createElement('div');
        fineLbl.textContent = 'Fine-tune (' + FINE + 'x steps)';
        fineLbl.style.cssText = 'opacity:.7;font-size:.9em;margin-bottom:.3em;';
        var slider = document.createElement('input');
        slider.type = 'range';
        slider.id = 'abSlider';
        slider.min = String(MIN);
        slider.max = String(MAX);
        slider.step = String(FINE);
        slider.value = String(speed);
        slider.style.cssText = 'width:100%;height:2.2em;accent-color:#00a4dc;';
        slider.addEventListener('input', function () { setSpeed(parseFloat(slider.value), true); });
        ['click', 'touchstart', 'touchend', 'pointerdown', 'pointerup'].forEach(function (ev) {
            slider.addEventListener(ev, function (e) { e.stopPropagation(); });
        });
        fineRow.appendChild(fineLbl);
        fineRow.appendChild(slider);
        box.appendChild(fineRow);

        var grid = document.createElement('div');
        grid.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:.4em;margin-bottom:1em;';
        for (var v = MIN; v <= MAX + 0.0001; v += STEP) {
            (function (value) {
                var b = document.createElement('button');
                b.type = 'button';
                b.className = 'abPreset';
                b.dataset.v = String(value);
                b.textContent = fmt(value);
                b.style.cssText = btnStyle('padding:.6em .2em;font-size:.95em;');
                b.addEventListener('click', function (e) { stop(e); setSpeed(value); });
                grid.appendChild(b);
            })(v);
        }
        box.appendChild(grid);

        var close = document.createElement('button');
        close.type = 'button';
        close.textContent = 'Close';
        close.style.cssText = btnStyle('background:#00a4dc;width:100%;');
        close.addEventListener('click', function (e) { stop(e); closeMenu(); });
        box.appendChild(close);

        overlay.appendChild(box);
        document.body.appendChild(overlay);
        apply();
    }

    // ---- Now-playing bar label -------------------------------------------
    function injectBar() {
        if (document.getElementById('abSpeedBar')) return;
        var bar = document.querySelector('.nowPlayingBar .nowPlayingBarRight')
               || document.querySelector('.nowPlayingBar');
        if (!bar) return;

        var lbl = document.createElement('span');
        lbl.id = 'abSpeedBar';
        lbl.className = 'abSpeedLabel';
        lbl.title = 'Playback speed';
        lbl.style.cssText = 'min-width:3.2em;padding:.5em;text-align:center;cursor:pointer;display:inline-block;';
        bar.insertBefore(lbl, bar.firstChild);
        apply();
    }

    // ---- Floating pill on the full-screen player page --------------------
    function onPlayerPage() {
        return /nowplaying/i.test(location.hash + location.pathname);
    }

    function syncPill() {
        var pill = document.getElementById('abSpeedPill');
        var a = document.querySelector('audio');
        var hasAudio = !!(a && (a.currentSrc || a.src));
        if (hasAudio && onPlayerPage()) {
            if (!pill) {
                pill = document.createElement('button');
                pill.id = 'abSpeedPill';
                pill.type = 'button';
                pill.className = 'abSpeedLabel';
                pill.style.cssText = 'position:fixed;right:1em;bottom:6em;z-index:99999;background:#00a4dc;' + btnStyle('font-size:1.2em;padding:.6em 1em;border-radius:2em;box-shadow:0 2px 8px rgba(0,0,0,.5);');
                document.body.appendChild(pill);
                apply();
            }
        } else if (pill) {
            pill.remove();
        }
    }

    // Intercept taps on our controls at the window (capture) level so no ancestor handler
    // (e.g. the now-playing bar's "open player page" navigation) can swallow or hijack them.
    ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'click'].forEach(function (ev) {
        window.addEventListener(ev, function (e) {
            var t = e.target;
            if (!t || !t.closest || !t.closest('#abSpeedBar, #abSpeedPill')) return;
            e.stopImmediatePropagation();
            if (ev === 'click') {
                e.preventDefault();
                openMenu();
            }
        }, true);
    });

    // Keyboard shortcuts (ignored while typing in a field)
    document.addEventListener('keydown', function (e) {
        var t = e.target;
        if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key === '[') setSpeed(speed - STEP);
        else if (e.key === ']') setSpeed(speed + STEP);
        else if (e.key === '\\') setSpeed(1.0);
    });

    var pending = false;
    function tick() {
        pending = false;
        // Stay out of the way while a video is playing.
        var v = document.querySelector('video');
        if (v && !v.paused) {
            var p = document.getElementById('abSpeedPill');
            if (p) p.remove();
            return;
        }
        injectBar();
        syncPill();
    }

    function scheduleTick() {
        if (pending) return;
        pending = true;
        window.requestAnimationFrame(tick);
    }

    new MutationObserver(scheduleTick).observe(document.body, { childList: true, subtree: true });
    window.addEventListener('hashchange', scheduleTick);
    ['loadedmetadata', 'play', 'playing'].forEach(function (ev) {
        document.addEventListener(ev, function (e) {
            if (e.target && e.target.tagName === 'AUDIO') apply();
        }, true);
    });

    console.log('[AudiobookSpeed] v1.0.4 loaded');
    tick();
})();
