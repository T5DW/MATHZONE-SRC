// all this is is just a custom curser that is kind of buggy lol idk if i want to fix it 
'use strict';

(function () {
  const style = document.createElement('style');
  style.textContent = `
    * { cursor: none !important; }
    #mz-cursor {
      position: fixed;
      width: 12px; height: 12px;
      background: #00f5ff;
      border-radius: 50%;
      pointer-events: none;
      z-index: 999999;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 8px #00f5ff, 0 0 20px rgba(0,245,255,0.6);
      transition: width 0.1s, height 0.1s, background 0.15s, box-shadow 0.15s;
    }
    #mz-cursor.clicking {
      width: 7px; height: 7px;
      background: #ff00aa;
      box-shadow: 0 0 12px #ff00aa, 0 0 28px rgba(255,0,170,0.7);
    }
    #mz-cursor.hovering {
      width: 20px; height: 20px;
      background: transparent;
      border: 2px solid #00f5ff;
      box-shadow: 0 0 10px #00f5ff, 0 0 24px rgba(0,245,255,0.5);
    }
    .mz-trail {
      position: fixed;
      border-radius: 50%;
      pointer-events: none;
      z-index: 999998;
      transform: translate(-50%, -50%);
      background: #00f5ff;
    }
  `;
  document.head.appendChild(style);

  const cursor = document.createElement('div');
  cursor.id = 'mz-cursor';
  document.body.appendChild(cursor);

  const TRAIL = 10;
  const trailDots = [];
  for (let i = 0; i < TRAIL; i++) {
    const d = document.createElement('div');
    d.className = 'mz-trail';
    const size = Math.max(2, Math.round(8 * (1 - i / TRAIL)));
    d.style.cssText = `width:${size}px;height:${size}px;opacity:${((1 - i / TRAIL) * 0.45).toFixed(2)};`;
    document.body.appendChild(d);
    trailDots.push({ el: d, x: -200, y: -200 });
  }

  let mx = -200, my = -200;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
    for (let i = trailDots.length - 1; i > 0; i--) {
      trailDots[i].x = trailDots[i - 1].x;
      trailDots[i].y = trailDots[i - 1].y;
    }
    trailDots[0].x = mx;
    trailDots[0].y = my;
  });

  document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
  document.addEventListener('mouseup',   () => cursor.classList.remove('clicking'));

  document.addEventListener('mouseover', e => {
    const tag = e.target.tagName;
    const cs  = getComputedStyle(e.target).cursor;
    if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' || tag === 'SELECT' || cs === 'pointer') {
      cursor.classList.add('hovering');
    }
  });
  document.addEventListener('mouseout', () => cursor.classList.remove('hovering'));

  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });

  function loop() {
    for (let i = 0; i < trailDots.length; i++) {
      trailDots[i].el.style.left = trailDots[i].x + 'px';
      trailDots[i].el.style.top  = trailDots[i].y + 'px';
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
