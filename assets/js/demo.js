// Adapted from https://googlechrome.github.io/devtools-samples/jank/
// To run in a web worker.
(function() {
    'use strict';

    const app = {};
    const proto = document.querySelector('.proto');
    let movers;
    const bodySize = {
        height: 700
    };
    const ballSize = {
        height: 30
    };
    const maxHeight = Math.floor(bodySize.height - ballSize.height);
    const maxWidth = 97; // 100vw - width of square (3vw)
    const distance = 1;

    app.count = 100;

    app.init = function () {
        for (var i = 0; i < app.count; i++) {
            const m = document.createElement('img');
            m.src = '../assets/img/logo.png';
            m.classList.add('proto', 'mover');

            var top = Math.floor(Math.random() * (maxHeight));
            if (top === maxHeight) {
                m.classList.add('up');
            } else {
                m.classList.add('down');
            }
            m.style.left = (i / (app.count / maxWidth)) + 'vw';
            m.style.top = top + 'px';
            document.body.appendChild(m);
        }

        movers = document.getElementsByClassName('mover');
    };

    app.update = function () {
        for (var i = 0; i < app.count; i++) {
            var m = movers[i];

            var pos = m.classList.contains('down')
                ? parseInt(m.style.top, 10) + distance
                : parseInt(m.style.top, 10) - distance;

            if (pos < 0) {
                pos = 0;
            }
            if (pos > maxHeight) {
                pos = maxHeight;
            }

            m.style.top = pos + 'px';

            if (m.style.top === '0px') {
                m.classList.remove('up');
                m.classList.add('down');
            }

            if (m.style.top === maxHeight + 'px') {
                m.classList.remove('down');
                m.classList.add('up');
            }
        }

        requestAnimationFrame(app.update);
    };

    window.app = app;

    document.body.removeChild(proto);
    proto.classList.remove('.proto');

    app.init();
    requestAnimationFrame(app.update);
})();
