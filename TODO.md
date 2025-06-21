### Plan to Implement URL-based State Storage for Digital Twin Canvas

1.  **Install `smol-string` Dependency:** 
    *   Use `pnpm` to add the `smol-string` library to the project's dependencies. This library will be used for compressing the canvas data before storing it in the URL.

2.  **Introduce Base64 Helper Functions:**
    *   Create helper functions in `lib/utils.ts` to handle Base64 encoding and decoding. These will be necessary to convert the compressed data (likely a `Uint8Array`) into a URL-safe string and back.

3.  **Modify `components/digital-twin/digital-twin-canvas.tsx`:**
    *   **Import necessary libraries:** 
        *   Import `useQueryState` from `nuqs` for URL parameter management.
        *   Import `compress` and `decompress` from `smol-string`.
        *   Import `useEffect`, `useRef`, `useState` from React.
        *   Import the new Base64 helper functions.
    *   **Implement State Hydration from URL:**
        *   On component mount, use `useQueryState` to read the `arch` parameter from the URL.
        *   If the `arch` parameter exists, decode it from Base64, decompress it using `smol-string`, and parse the resulting JSON.
        *   Use the parsed data to set the initial state of `nodes` and `edges`.
        *   If the parameter is missing or parsing fails, fall back to the `initialNodes` and `initialEdges` props.
    *   **Implement State Persistence to URL:**
        *   Use a `useEffect` hook to watch for changes in the `nodes` and `edges` state.
        *   When changes are detected, serialize the `nodes` and `edges` into a JSON string.
        *   Compress the JSON string using `smol-string`.
        *   Encode the compressed data into a Base64 string.
        *   Update the `arch` URL parameter with the Base64 string using `useQueryState`.
        *   Implement a debounce mechanism to prevent excessive URL updates during rapid changes (e.g., while dragging nodes).
        * remember goal is to implemen this when  <DigitalTwinCanvas
          initialNodes={activeTwinData.nodes}
          initialEdges={activeTwinData.edges}
        /> component mounts it should have the arch data in the url param and 
        when make changes it should be updated through the url 
        make sure code like senior enginnier 
