## TODO – Dynamic Streaming Animation for `AILoadingState`

### Goal
Replace the hard-coded `ANALYSIS_SEQUENCES` in `components/ui/ai-loading-state.tsx` with live data coming from the `/api/agent/info` streaming endpoint so that the loading animation reflects the actual text being returned by the backend.

### High-Level Steps
1. **Refactor `AILoadingState`**
   - Convert the component to a *presentational* component that accepts streaming text via props (e.g. `content: string`).
   - Derive the array of visible lines by splitting the incoming `content` on new-lines (`\n`) or by chunking when the backend streams character-by-character.
   - Keep the spinner and smooth scrolling logic, but *remove* all references to `ANALYSIS_SEQUENCES`, `status`, and other hard-coded values.
   - Keep a fallback empty state for when no content is yet available.

2. **Aggregate Streaming Text in the Page/Hook**
   - In `app/(main)/test/page.tsx` (and any other callers), create local state `streamBuffer` that collects the incremental tokens coming from `useChat`.
   - Leverage the `onStream` callback from `useChat` (or patch `useChat` if necessary) to append each incoming chunk to `streamBuffer`.
   - Pass `streamBuffer` into the refactored `AILoadingState` while `isLoading` is `true`.

3. **Handle Character-by-Character Streams**
   - Because the backend emits characters one by one, implement a tiny debounce or newline-detection inside the buffer collection logic so that we push a new *line* to the animation only when we encounter a `\n` **or** after `N` characters (to avoid an infinitely long line).

4. **UI/UX Adjustments**
   - Remove the dedicated *status* label; instead, keep a single spinner and the animated code block.
   - Ensure the container height stays consistent (e.g. `h-[72px]`) so that layout doesn't shift while content grows.

5. **Cleanup & Backwards Compatibility**
   - Delete the now-unused `ANALYSIS_SEQUENCES` constant and any related typings.
   - Search the codebase for other imports/usages of `AILoadingState` and update them to supply the new `content` prop.

6. **Testing**
   - Manually validate that:  
     a. The animation shows live backend text during streaming.  
     b. Scrolling behaves as before (older lines scroll upward smoothly).  
     c. After the response finishes, the final Markdown renders as before and the loading animation disappears.

7. **Future Enhancements (Later)**
   - Detect *semantic* boundaries (sentences or JSON blocks) instead of relying solely on newlines.
   - Auto-detect and syntax-highlight JSON snippets in the live stream.
