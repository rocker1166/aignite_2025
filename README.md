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

