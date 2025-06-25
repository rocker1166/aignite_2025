# AIGnite 2025 - Project Structure

## Complete Folder Structure

```
aignite_2025/
├── 📁 app/                           # Next.js app directory
│   ├── 📁 (main)/                   # Main application routes
│   │   ├── 📁 advanced-tools/
│   │   │   └── page.tsx
│   │   ├── 📁 analytics/
│   │   │   └── page.tsx
│   │   ├── 📁 dashboard/
│   │   │   └── page.tsx
│   │   ├── 📁 digital-twin/
│   │   │   ├── digital-twin-client-page.tsx
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── 📁 page/
│   │   │   └── layout.tsx
│   │   ├── 📁 profile/
│   │   │   └── page.tsx
│   │   ├── 📁 simulation/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── 📁 strategy/
│   │       └── page.tsx
│   ├── 📁 api/                       # API routes
│   │   ├── 📁 agent/
│   │   │   └── 📁 info/
│   │   │       └── route.ts
│   │   ├── 📁 autocomplete/
│   │   │   └── route.ts
│   │   ├── 📁 chat/
│   │   │   └── route.ts
│   │   ├── 📁 generateNotifications/
│   │   ├── 📁 impact/
│   │   │   └── route.ts
│   │   ├── 📁 news/
│   │   │   └── route.ts
│   │   └── 📁 scenario/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── 📁 signin/
│       └── page.tsx
├── 📁 components/                    # React components
│   ├── 📁 advanced-tools/
│   │   └── advanced-tools-page.tsx
│   ├── 📁 analytics/
│   │   ├── analytics-page.tsx
│   │   ├── kpi-metrics-grid.tsx
│   │   ├── performance-chart.tsx
│   │   ├── risk-heatmap.tsx
│   │   └── supplier-table.tsx
│   ├── app-sidebar.tsx
│   ├── 📁 auth/
│   │   ├── Signin.tsx
│   │   └── Signout.tsx
│   ├── benefits.tsx
│   ├── cascading-failure-map.tsx
│   ├── 📁 dashboard/
│   │   ├── dashboard-page.tsx
│   │   ├── kpi-card.tsx
│   │   ├── notification-feed.tsx
│   │   ├── recent-activity-list.tsx
│   │   ├── risk-heatmap.tsx
│   │   ├── simulation-timeline.tsx
│   │   └── supply-chain-health-chart.tsx
│   ├── 📁 digital-twin/              # Digital Twin components
│   │   ├── 📁 canvas/                # Canvas and visual components
│   │   │   ├── digital-twin-canvas.tsx # Main canvas component
│   │   │   ├── CustomNodes.tsx       # Custom node definitions
│   │   │   ├── CustomEdges.tsx       # Custom edge definitions
│   │   │   └── index.ts              # Canvas exports
│   │   ├── 📁 forms/                 # Form and dialog components
│   │   │   ├── creation-form.tsx     # Main creation form
│   │   │   ├── 📁 creation-form/     # Form step components
│   │   │   │   ├── CountrySelectionDialog.tsx
│   │   │   │   ├── form-schema.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── LogisticsStep.tsx
│   │   │   │   ├── RiskFactorsStep.tsx
│   │   │   │   └── SupplyChainInfoStep.tsx
│   │   │   ├── DynamicFormField.tsx  # Dynamic form fields
│   │   │   ├── ValidationDialog.tsx  # Validation dialogs
│   │   │   ├── SaveSupplyChainDialog.tsx # Save dialogs
│   │   │   └── index.ts              # Form exports
│   │   ├── 📁 layout/                # Layout and UI components
│   │   │   ├── LeftPanel.tsx         # Left sidebar panel
│   │   │   ├── 📁 RightPanel/        # Right panel components
│   │   │   │   ├── EdgeConfiguration.tsx
│   │   │   │   ├── functions.tsx     # Pure functions (JSX-compatible)
│   │   │   │   ├── index.tsx
│   │   │   │   ├── 📁 node-configuration/ # Node configuration components
│   │   │   │   │   ├── AppearanceSection.tsx # Color picker and styling
│   │   │   │   │   ├── GeneralSection.tsx # Label, description, external company fields
│   │   │   │   │   ├── index.ts      # Export all components
│   │   │   │   │   ├── LocationSection.tsx # Country and address selection
│   │   │   │   │   ├── NodeTypeHeader.tsx # Node type display with icon
│   │   │   │   │   ├── RiskAssessmentSection.tsx # Risk assessment fields
│   │   │   │   │   └── TypeSpecificSection.tsx # Dynamic type-specific properties
│   │   │   │   └── NodeConfiguration.tsx # Main component (now much cleaner)
│   │   │   ├── SimulationToolbar.tsx # Simulation toolbar
│   │   │   ├── FloatingSaveButton.tsx # Floating action button
│   │   │   └── index.ts              # Layout exports
│   │   ├── 📁 display/               # Display and card components
│   │   │   ├── dashboard.tsx         # Dashboard component
│   │   │   ├── digital-twin-card.tsx # Card components
│   │   │   ├── DigitalTwinSkeleton.tsx # Loading skeleton
│   │   │   └── index.ts              # Display exports
│   │   ├── 📁 utils/                 # Utility functions
│   │   │   ├── function.ts           # Utility functions
│   │   │   └── index.ts              # Utils exports
│   │   └── index.ts                  # Main exports file
│   ├── footer.tsx
│   ├── header.tsx
│   ├── impact-assessment.tsx
│   ├── intelligence-agent-demo.tsx
│   ├── landing-header.tsx
│   ├── metrics-dashboard.tsx
│   ├── node-impact-grid.tsx
│   ├── 📁 profile/
│   │   ├── ChangePasswordDialog.tsx
│   │   ├── profile-page.tsx
│   │   └── UpdateProfileForm.tsx
│   ├── 📁 simulation/
│   │   ├── simulation-history.tsx
│   │   ├── simulation-impact-chart.tsx
│   │   ├── simulation-page.tsx
│   │   ├── simulation-results.tsx
│   │   ├── simulation-timeline.tsx
│   │   └── 📁 test/
│   │       ├── advanced-settings.tsx
│   │       ├── ai-scenario-suggestions.tsx
│   │       ├── scenario-builder.tsx
│   │       ├── simulation-empty-state.tsx
│   │       ├── simulation-loader.tsx
│   │       └── simulation-toolbar.tsx
│   ├── 📁 strategy/
│   │   ├── cost-benefit-analysis.tsx
│   │   ├── strategy-page.tsx
│   │   └── strategy-recommendations.tsx
│   ├── strategy-dashboard.tsx
│   ├── 📁 theme/
│   │   ├── index.ts
│   │   ├── sidebar-theme-toggle.tsx
│   │   ├── theme-animations.ts
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   └── 📁 ui/                        # Shadcn/UI components
│       ├── accordion.tsx
│       ├── ai-chat-overlay.tsx
│       ├── alert-dialog.tsx
│       ├── alert.tsx
│       ├── animated-dropdown-menu.tsx
│       ├── aspect-ratio.tsx
│       ├── AutoComplete.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── bento-card.tsx
│       ├── breadcrumb.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── chart.tsx
│       ├── checkbox.tsx
│       ├── collapsible.tsx
│       ├── command.tsx
│       ├── context-menu.tsx
│       ├── country-dropdown.tsx
│       ├── creatable-select.tsx
│       ├── currency-selector.tsx
│       ├── dialog.tsx
│       ├── drawer.tsx
│       ├── dropdown-menu.tsx
│       ├── form.tsx
│       ├── hero-geometric.tsx
│       ├── hover-card.tsx
│       ├── input-otp.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── menubar.tsx
│       ├── multiselect.tsx
│       ├── navigation-menu.tsx
│       ├── order-state.tsx
│       ├── pagination.tsx
│       ├── popover.tsx
│       ├── progress.tsx
│       ├── radio-group.tsx
│       ├── resizable.tsx
│       ├── route-animation.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── slider.tsx
│       ├── sonner.tsx
│       ├── stepper.tsx
│       ├── switch.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── timeline-steps.tsx
│       ├── toast.tsx
│       ├── toaster.tsx
│       ├── toggle-group.tsx
│       ├── toggle.tsx
│       ├── tooltip.tsx
│       ├── use-mobile.tsx
│       └── use-toast.ts
├── 📁 constants/                     # Application constants
│   ├── currencies.tsx
│   ├── digital-twin.tsx
│   ├── supply-chain-form.tsx
│   └── 📁 templates/                 # Template definitions
│       ├── 📁 characteristics/
│       │   ├── 📁 hazardous/
│       │   │   ├── edges.ts
│       │   │   └── nodes.ts
│       │   └── 📁 high-value/
│       │       ├── edges.ts
│       │       └── nodes.ts
│       ├── 📁 geographic/
│       │   ├── 📁 domestic/
│       │   │   ├── edges.ts
│       │   │   └── nodes.ts
│       │   └── 📁 global/
│       │       ├── edges.ts
│       │       └── nodes.ts
│       ├── 📁 industry/
│       │   ├── 📁 automotive/
│       │   │   ├── edges.ts
│       │   │   └── nodes.ts
│       │   ├── 📁 electronics/
│       │   │   ├── edges.ts
│       │   │   └── nodes.ts
│       │   ├── 📁 energy/
│       │   │   ├── edges.ts
│       │   │   └── nodes.ts
│       │   ├── 📁 fashion/
│       │   │   ├── edges.ts
│       │   │   └── nodes.ts
│       │   ├── 📁 food-beverage/
│       │   │   ├── edges.ts
│       │   │   └── nodes.ts
│       │   └── 📁 pharma/
│       │       ├── edges.ts
│       │       └── nodes.ts
│       ├── 📁 legacy/
│       │   ├── edges.ts
│       │   └── nodes.ts
│       ├── 📁 supplier-tiers/
│       │   ├── 📁 tier1/
│       │   │   ├── edges.ts
│       │   │   └── nodes.ts
│       │   └── 📁 tier3plus/
│       │       ├── edges.ts
│       │       └── nodes.ts
│       └── index.ts
├── 📁 docs/                          # Documentation
│   ├── 📁 agents/
│   │   └── info.md
│   ├── database.md
│   ├── issues.md
│   ├── 📁 tasks/
│   │   └── FormforSupplychain.md
│   └── validation-todo.md
├── 📁 hooks/                         # React hooks
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── 📁 lib/                           # Core library functions
│   ├── 📁 actions/
│   │   └── user.ts
│   ├── 📁 api/
│   │   ├── notifications.ts
│   │   ├── simulation.ts
│   │   ├── supply-chain-intel.ts
│   │   └── supply-chain.ts
│   ├── 📁 context/
│   │   ├── impact-context.tsx
│   │   ├── scenario-context.tsx
│   │   └── SessionProvider.tsx
│   ├── 📁 data/
│   │   └── impactresult.ts
│   ├── digitalTwinStore.ts
│   ├── 📁 functions/
│   │   ├── signin.ts
│   │   ├── signout.ts
│   │   └── signup.ts
│   ├── 📁 OlaMap/                    # OLA Maps SDK
│   │   ├── 📁 __MACOSX/
│   │   │   └── 📁 OlaMapsWebSDK/
│   │   └── 📁 OlaMapsWebSDK/
│   │       ├── index.d.ts
│   │       ├── olamaps-js-sdk.es.js
│   │       ├── olamaps-js-sdk.umd.js
│   │       └── style.css
│   ├── seed-data.ts
│   ├── 📁 stores/
│   │   └── user.ts
│   ├── 📁 supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── tavily.ts
│   ├── template-selector.ts
│   ├── 📁 types/
│   │   ├── database.ts
│   │   ├── digital-twin.ts
│   │   ├── supabase.ts
│   │   └── user.ts
│   ├── utils.ts
│   └── 📁 validation/
│       └── supply-chain-validator.ts
├── 📁 migrations/                    # Database migrations
│   ├── 01_init_schema.sql
│   ├── 02_add_supply_chain_intel.sql
│   └── 03_supply_chain_intelligence.sql
├── 📁 public/                        # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── placeholder.jpg
│   ├── vercel.svg
│   └── window.svg
├── 📁 utils/                         # Utility functions
│   └── 📁 functions/
│       ├── insertSupplyChain.ts
│       ├── parseProductSheet.ts
│       └── userUtils.ts
├── components.json                   # Shadcn/UI configuration
├── data-analysis.md                  # Data analysis documentation
├── next.config.mjs                   # Next.js configuration
├── next.config.ts                    # TypeScript Next.js config
├── nodetype.md                       # Node type documentation
├── notepad.txt                       # Development notes
├── package.json                      # Project dependencies
├── package-lock.json                 # Dependency lock file
├── pnpm-lock.yaml                    # PNPM lock file
├── pnpm-workspace.yaml               # PNPM workspace config
├── postcss.config.mjs                # PostCSS configuration
├── PRODUCTION_AGENT_README.md        # Production documentation
├── README.md                         # This file
├── tailwind.config.ts                # Tailwind CSS configuration
├── TODO.md                           # Project todos
└── tsconfig.json                     # TypeScript configuration
```

## Key Folders

- **`app/`** - Next.js 15.2.4 app directory with file-based routing
- **`components/`** - Reusable React components organized by feature
- **`lib/`** - Core business logic, utilities, and configurations
- **`constants/`** - Application constants and template definitions
- **`docs/`** - Project documentation and technical specs


