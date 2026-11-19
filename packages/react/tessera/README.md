# @radix-ui/react-tessera

abyme-studio's fork of Radix, branch `tessera`: Radix on a tessera root, which is a React root drawn
on a canvas inside a DOM page. Its elements are `box`, `text` and `input`. Its style is typed, and its
document is the root's own, not the page's `document`. abyme bundles this fork only into a cell's
`tessera/` folder. The page's DOM keeps upstream Radix.

The app gives the root's document with `DocumentProvider`. Under it, each primitive draws tessera's
elements and reads that document. With no provider, every primitive is upstream Radix, and the
upstream tests pass unchanged.

Every change is marked `tessera (fork)` in the code.

| package | change |
|---|---|
| tessera (new) | `DocumentProvider`, `useDocument`, `useTessera`; `mergeStyle` (a style function merged too), `typedStyle` (CSS variables and CSS-only keys dropped), `hostOf` and `hostProps` (a DOM tag as `box`, `text` or `input`, words in `text`), `windowOf` |
| primitive | in a tessera root, `Primitive.<tag>` draws `hostOf(tag)` with `hostProps` |
| slot | `style` merged by `mergeStyle` |
| portal | the default container is the provided document's body |
| popper | `absolute` and `left`/`top` (no `fixed` on tessera); hidden by `opacity` while it measures; follows by the root's `ResizeObserver`, with floating-ui's `elementResize` and `layoutShift` off; `getComputedStyle` from the content's own window |
| menu | keyboard-or-pointer listeners on the provided document; no `RemoveScroll` in a tessera root; `focusFirst` and typeahead read the items' own document |
| dismissable-layer | before its node mounts, the provided document; layer updates sent on the layer's own document, with its window's `CustomEvent` |
| focus-scope | trap, mount focus and focus return on the container's own document, window, `MutationObserver` and tree walker; `isHidden` by the node's own window's `getComputedStyle` |
| focus-guards | none in a tessera root |
| presence | `getComputedStyle` from the node's own window |
| roving-focus | `focusFirst` reads the candidates' own document |
| tooltip | pointer, open and scroll listeners on the provided document and its window |
| use-size | the element's own window's `ResizeObserver` |

The base is `d5767dcb` (radix-ui 1.7.0). To move to a new release, rebase `tessera` onto its
release commit and run `pnpm exec vitest run packages/react`.
