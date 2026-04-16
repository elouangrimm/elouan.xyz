# Unused code snippets

```js
// === SVG image card (data: URL via btoa — the only way that works in modern Chrome) ===
        (function () {
            const svg = [
                `<svg xmlns="http://www.w3.org/2000/svg" width="340" height="130">`,
                `<rect width="340" height="130" fill="#0d0d0d" rx="6"/>`,
                `<rect x="0" y="0" width="6" height="130" fill="#4680ff" rx="3"/>`,
                `<text x="26" y="44" font-family="monospace" font-size="26" font-weight="bold" fill="#ffffff">elouan</text>`,
                `<text x="120" y="44" font-family="monospace" font-size="26" font-weight="bold" fill="#4680ff">.xyz</text>`,
                `<text x="26" y="72" font-family="monospace" font-size="12" fill="#a8a29e">developer / builder / tinkerer</text>`,
                `<rect x="26" y="84" width="288" height="1" fill="#2a2a2a"/>`,
                `<text x="26" y="106" font-family="monospace" font-size="11" fill="#4680ff">✦</text>`,
                `<text x="40" y="106" font-family="monospace" font-size="11" fill="#78716c">curious enough to open devtools</text>`,
                `<text x="26" y="122" font-family="monospace" font-size="11" fill="#4680ff">✦</text>`,
                `<text x="40" y="122" font-family="monospace" font-size="11" fill="#78716c">github.com/elouangrimm</text>`,
                `</svg>`,
            ].join("")
            const url = `data:image/svg+xml,${encodeURIComponent(svg)}`
            console.log("%c ", `padding: 65px 170px; background: url('${url}') no-repeat center/contain; border-radius: 6px`)
        }())

```
