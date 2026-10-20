/**
 * The platform loading kit (design-system-1). Three states, each for one context:
 *   ProcessingState  (A)  something you asked for is being DONE: paying, saving, submitting, verifying, uploading.
 *   PageSkeleton     (B)  a whole PAGE is opening for the first time.
 *   SectionSkeleton  (D)  a component or section is waiting for its OWN data; the shape copies what will appear.
 *   PendingButton    (D)  a form action is running (save, update, post): the button shows a small spinner and cannot be pressed twice.
 * Rule of thumb: waiting to SEE something is a skeleton (B or D); waiting for something to HAPPEN is ProcessingState.
 */
export { default as ProcessingState } from './ProcessingState';
export { default as PageSkeleton } from './PageSkeleton';
export { default as SectionSkeleton } from './SectionSkeleton';
export { default as PendingButton } from './PendingButton';
// PendingButton is D at its smallest: use it for every form action (save, update, post, delete) instead of a bare Button.
