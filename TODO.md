# Plan to Implement Dynamic Supply Chain Templates

**Objective:** Modify the digital twin creation process to dynamically generate an initial supply chain diagram based on user input from the creation form, instead of using a static template.

---

### Step 1: Create a Template Selection Utility

-   **Task:** Develop a function that takes the user's form submission data as input and returns the appropriate node and edge templates for the `reactflow` canvas.
-   **Location:** Create a new file at `lib/template-selector.ts`.
-   **Details:**
    -   The function will import all available templates from `constants/templates/index.ts`.
    -   It will contain logic to map form inputs (like `industry`, `productCharacteristics`, `supplierTiers`) to specific templates.
    -   Define a priority for template selection: Industry > Product Characteristic > Supplier Tier > Geographic Operation.
    -   The function should return an object `{ nodes: Node[], edges: Edge[] }`.
    -   Include a default template (`INITIAL_NODES`, `INITIAL_EDGES` from the legacy folder) as a fallback if no specific match is found.
-   **Testability:** This function can be unit-tested by passing mock form data and asserting that the correct templates are returned.

---

### Step 2: Refactor Legacy Templates

-   **Task:** Move the old static `INITIAL_NODES` and `initialEdges` into the new template structure for consistency and backward compatibility.
-   **Files to Modify:**
    -   `constants/digital-twin.tsx` (remove `INITIAL_NODES`)
    -   `components/digital-twin/digital-twin-canvas.tsx` (remove `initialEdges` definition)
    -   `constants/templates/index.ts` (export new legacy templates)
-   **Files to Create:**
    -   `constants/templates/legacy/nodes.ts`
    -   `constants/templates/legacy/edges.ts`
-   **Details:**
    -   Move the content of `INITIAL_NODES` from `constants/digital-twin.tsx` to `constants/templates/legacy/nodes.ts`.
    -   Move the content of `initialEdges` from `components/digital-twin/digital-twin-canvas.tsx` to `constants/templates/legacy/edges.ts` and export it as `INITIAL_EDGES`.
    -   Update `constants/templates/index.ts` to export these new legacy templates.
-   **Testability:** After refactoring, the application should still compile. The template selector from Step 1 will use these as a fallback.

---

### Step 3: Modify `DigitalTwinCanvas` to Accept Initial State via Props

-   **Task:** Refactor `components/digital-twin/digital-twin-canvas.tsx` to be a controlled component that receives its initial nodes and edges from its parent.
-   **Details:**
    -   Add `initialNodes` and `initialEdges` to its props interface.
    -   Change `useNodesState(INITIAL_NODES)` to `useNodesState(initialNodes || [])`.
    -   Change `useEdgesState(initialEdges)` to `useEdgesState(initialEdges || [])`.
    -   Remove the direct import of `INITIAL_NODES` and the local `initialEdges` constant.
-   **Testability:** The canvas should render correctly when `initialNodes` and `initialEdges` are passed as props. It should render an empty canvas if no props are passed.

---

### Step 4: Integrate Template Selection into the Creation Flow

-   **Task:** Update `app/(main)/digital-twin/digital-twin-client-page.tsx` to use the new template selector and pass the data to the canvas.
-   **Details:**
    -   Import the template selector function from `lib/template-selector.ts`.
    -   In the `handleCreationSuccess` function:
        1.  After receiving the form `data`, call the template selector: `const { nodes, edges } = selectTemplate(data);`.
        2.  When storing data in `localStorage`, include the `nodes` and `edges`:
            ```javascript
            const twinData = { ...data, nodes, edges };
            localStorage.setItem(`supplyChain-${twinId}`, JSON.stringify(twinData));
            ```
-   **Testability:** After creating a twin, inspect `localStorage` in the browser dev tools to confirm that the `supplyChain-{id}` item contains the `nodes` and `edges` arrays.

---

### Step 5: Pass Dynamic Data to the Canvas

-   **Task:** Connect the data loaded from `localStorage` to the `DigitalTwinCanvas` component.
-   **File:** `app/(main)/digital-twin/digital-twin-client-page.tsx`
-   **Details:**
    -   Create a state variable, e.g., `const [activeTwinData, setActiveTwinData] = useState(null);`.
    -   Use a `useEffect` hook that runs when `twinId` changes. This hook should:
        1.  Read the `supplyChain-{twinId}` item from `localStorage`.
        2.  Parse the JSON data.
        3.  Call `setActiveTwinData` with the parsed data.
    -   Modify the render logic for the canvas:
        ```jsx
        if (twinId && activeTwinData) {
            return <DigitalTwinCanvas initialNodes={activeTwinData.nodes} initialEdges={activeTwinData.edges} />;
        }
        ```
-   **Testability:** When a twin is created, the page should switch to the canvas view and display the correct, dynamically selected template based on the form input.

### Step 5: Ensure Canvas Mounts with Correct Initial Data

-   **Task**: Modify `app/(main)/digital-twin/digital-twin-client-page.tsx` to load the selected twin's data and pass it to the `DigitalTwinCanvas` upon mount. This prevents the canvas from ever displaying default/static data.
-   **Details**:
    1.  Introduce state to hold the active twin's data and a loading status: `const [activeTwinData, setActiveTwinData] = useState(null);` and `const [isLoading, setIsLoading] = useState(true);`.
    2.  Use a `useEffect` hook that triggers whenever `twinId` (from `useQueryState`) changes.
    3.  Inside the `useEffect`, fetch the corresponding `supplyChain-{twinId}` data from `localStorage`, parse it, and update the `activeTwinData` state. Manage the `isLoading` state.
    4.  Modify the render logic to conditionally render a loading indicator, and then the `DigitalTwinCanvas` only after the data has been loaded. This ensures the canvas receives the correct `initialNodes` and `initialEdges` props on its first mount.
    ```jsx
    // In DigitalTwinClientPage

    const [activeTwinData, setActiveTwinData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      if (twinId) {
        setIsLoading(true);
        const data = localStorage.getItem(`supplyChain-${twinId}`);
        if (data) {
          setActiveTwinData(JSON.parse(data));
        }
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    }, [twinId]);

    if (twinId) {
      if (isLoading) {
        return <p>Loading twin...</p>; // Or a spinner component
      }
      if (activeTwinData) {
        return <DigitalTwinCanvas initialNodes={activeTwinData.nodes} initialEdges={activeTwinData.edges} />;
      }
      return <p>Twin not found.</p>; // Handle case where data isn't in localStorage
    }
    ```
-   **Testability**: When a twin is selected (either by creation or by URL), the canvas should immediately render with the correct diagram without flashing any default state or requiring a page reload.
