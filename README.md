components/digital-twin/RightPanel/
├── functions.tsx                    # Pure functions (JSX-compatible)
├── node-configuration/             # New folder for components
│   ├── index.ts                   # Export all components
│   ├── NodeTypeHeader.tsx         # Node type display with icon
│   ├── GeneralSection.tsx         # Label, description, external company fields
│   ├── LocationSection.tsx        # Country and address selection
│   ├── RiskAssessmentSection.tsx  # Risk assessment fields
│   ├── TypeSpecificSection.tsx    # Dynamic type-specific properties
│   └── AppearanceSection.tsx      # Color picker and styling
└── NodeConfiguration.tsx          # Main component (now much cleaner)

digital-twin/
├── 📁 canvas/                    # Canvas and visual components
│   ├── digital-twin-canvas.tsx   # Main canvas component
│   ├── CustomNodes.tsx           # Custom node definitions
│   ├── CustomEdges.tsx           # Custom edge definitions
│   └── index.ts                  # Canvas exports
├── 📁 forms/                     # Form and dialog components  
│   ├── creation-form.tsx         # Main creation form
│   ├── creation-form/            # Form step components
│   ├── DynamicFormField.tsx      # Dynamic form fields
│   ├── ValidationDialog.tsx      # Validation dialogs
│   ├── SaveSupplyChainDialog.tsx # Save dialogs
│   └── index.ts                  # Form exports
├── 📁 layout/                    # Layout and UI components
│   ├── LeftPanel.tsx             # Left sidebar panel
│   ├── RightPanel/               # Right panel components
│   ├── SimulationToolbar.tsx     # Simulation toolbar
│   ├── FloatingSaveButton.tsx    # Floating action button
│   └── index.ts                  # Layout exports
├── 📁 display/                   # Display and card components
│   ├── dashboard.tsx             # Dashboard component
│   ├── digital-twin-card.tsx     # Card components
│   ├── DigitalTwinSkeleton.tsx   # Loading skeleton
│   └── index.ts                  # Display exports
├── 📁 utils/                     # Utility functions
│   ├── function.ts               # Utility functions
│   └── index.ts                  # Utils exports
└── index.ts                      # Main exports file


