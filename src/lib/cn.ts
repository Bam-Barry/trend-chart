/**
 * Single import site for classname merging (§15: use clsx, never string
 * concatenation). Components import from here so swapping the implementation
 * is one edit rather than a hundred.
 */
export { default as cn } from 'clsx';
export { default } from 'clsx';
