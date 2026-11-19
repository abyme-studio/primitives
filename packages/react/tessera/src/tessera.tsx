import * as React from 'react';

/*
 * tessera (abyme-studio's fork): Radix on a tessera root, a React root drawn on a canvas inside a
 * DOM page. Its elements are `box`, `text` and `input`, its style is typed (numbers, not CSS
 * strings, or a function of the node's input state), and its document is the root's own, not the
 * page's `document`. An app gives a tessera root's document with `DocumentProvider`; inside it each
 * primitive draws tessera's elements and reads that document. With no provider, every primitive is
 * upstream Radix on the page's DOM.
 */

const DocumentContext = React.createContext<Document | null>(null);

/** Gives a tessera root's document to the Radix primitives inside it. */
function DocumentProvider({ document, children }: { document: Document; children?: React.ReactNode }) {
  return <DocumentContext.Provider value={document}>{children}</DocumentContext.Provider>;
}

/** The document this tree renders into: the tessera root's, else the page's. */
function useDocument(): Document {
  return React.useContext(DocumentContext) ?? globalThis.document;
}

/** Whether this tree is a tessera root's. */
function useTessera(): boolean {
  return React.useContext(DocumentContext) !== null;
}

/** A tessera style: a typed style, or a function of the node's input state answering one. */
type StyleSource = object | ((input: unknown) => object);

const resolve = (s: StyleSource, input: unknown): object => (typeof s === 'function' ? s(input) : s);

/** Two styles as one, `b` over `a`: a function of input when either is one. */
function mergeStyle(a: StyleSource | undefined, b: StyleSource | undefined): StyleSource | undefined {
  if (!a) return b;
  if (!b) return a;
  if (typeof a !== 'function' && typeof b !== 'function') return { ...a, ...b };
  return (input: unknown) => ({ ...resolve(a, input), ...resolve(b, input) });
}

/** CSS a primitive sets that tessera has no property for: a CSS variable, or one of these. */
const CSS_ONLY = new Set(['animation', 'outline', 'WebkitTouchCallout', 'userSelect', 'transformOrigin', 'boxSizing', 'clip', 'wordWrap', 'visibility']);

/** `style` as tessera takes it: CSS variables and CSS-only properties dropped, a `zIndex` string a number. */
function typedStyle(style: unknown): StyleSource | undefined {
  if (!style) return undefined;
  if (typeof style === 'function') return style as StyleSource;
  if (typeof style !== 'object') return undefined;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(style)) {
    if (value === undefined || key.startsWith('--') || CSS_ONLY.has(key)) continue;
    out[key] = key === 'zIndex' && typeof value === 'string' ? Number(value) || undefined : value;
  }
  return out;
}

/** Whether every child is a string or a number. */
const textOnly = (children: React.ReactNode): boolean =>
  React.Children.toArray(children).every((c) => typeof c === 'string' || typeof c === 'number');

/**
 * The tessera element a DOM tag draws as, given its children: `input` for an input, `text` for a
 * span of text alone, else `box`.
 */
function hostOf(tag: string, children: React.ReactNode): 'box' | 'text' | 'input' {
  if (tag === 'input') return 'input';
  if (tag === 'span' && children !== undefined && children !== null && textOnly(children)) return 'text';
  return 'box';
}

/** A box's children, each string or number put in a `text`: tessera draws words only inside one. */
function inText(children: React.ReactNode): React.ReactNode {
  if (children === undefined || children === null) return children;
  const list = React.Children.toArray(children);
  if (list.every((c) => typeof c !== 'string' && typeof c !== 'number')) return children;
  return list.map((c, i) => (typeof c === 'string' || typeof c === 'number' ? React.createElement('text', { key: `t${i}` }, c) : c));
}

/** Props as a tessera element takes them: `className` dropped, the style typed, words in `text`. */
function hostProps(host: 'box' | 'text' | 'input', props: Record<string, unknown>): Record<string, unknown> {
  const { className: _className, style, children, ...rest } = props;
  return { ...rest, style: typedStyle(style), children: host === 'box' ? inText(children as React.ReactNode) : children };
}

/** The window a node of a tessera root, or of the page, lives in. */
const windowOf = (node: Node | null | undefined): Window & typeof globalThis =>
  ((node?.ownerDocument ?? globalThis.document)?.defaultView ?? globalThis) as Window & typeof globalThis;

export { DocumentProvider, useDocument, useTessera, mergeStyle, typedStyle, hostOf, hostProps, inText, windowOf };
export type { StyleSource };
