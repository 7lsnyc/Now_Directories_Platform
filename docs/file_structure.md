.
├── app
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (other routes and folders)
│   ├── directory
│   │   └── [slug]
│   │       ├── layout.tsx
│   │       └── page.tsx
│   └── builder
│       └── preview.tsx
├── components
│   └── builder
│       └── ThemeSwitcher.tsx
├── config
│   └── notary.json
├── docs
│   ├── PRD.md
│   ├── Architecture.md
│   ├── UX-Sitemap.md
│   └── (other .md docs)
├── lib
│   └── config
│       ├── loadConfig.ts
│       ├── useDirectoryWithFallback.ts
│       └── (other config utilities)
├── planr
│   └── stories
│       ├── P001.json
│       ├── P002.json
│       └── (other story JSON)
├── public
├── styles
│   ├── themes
│   │   └── blue-notary.css
│   └── globals.css
├── tests
│   ├── unit
│   │   └── lib
│   │       └── config
│   │           ├── loadConfig.test.ts
│   │           └── useDirectoryWithFallback.test.ts
│   └── e2e
├── .env.local
├── .gitignore
├── package.json
├── README.md
└── tsconfig.json
Explanation by Folder
3.1 app/ (Next.js App Router)
layout.tsx & page.tsx:

layout.tsx is your global layout that wraps the entire application.

page.tsx can serve as your root page (e.g., a landing page or redirect).

app/directory/[slug]/:

Houses all directory-specific routes.

layout.tsx: Additional layout wrapping for that particular slug (theming, config).

page.tsx: A default page for the directory slug (e.g., directory homepage).

app/builder/preview.tsx:

Used for a live preview of directory config during the “builder” or admin interface (post-MVP).

Shows how theming and layout changes would look in real time.

3.2 components/
Reusable React components (e.g., forms, buttons, navigation).

components/builder/ThemeSwitcher.tsx:

An example component to toggle or preview different Tailwind themes for design purposes.

3.3 config/
JSON config files for each directory (e.g., notary.json).

Holds branding, theme name, metadata, etc.

In the future, you may replace or supplement these files with a directories table in Supabase.

3.4 docs/
Markdown documentation such as:

PRD.md (Product Requirements Document)

Architecture.md

UX-Sitemap.md

FileStructure.md (this document)

Keep all high-level planning and reference info here.

3.5 lib/
Library folder for utility functions, hooks, or any custom logic not tied to a particular component.

config/ subfolder:

loadConfig.ts: Function to load a directory’s config from Supabase or fallback JSON.

useDirectoryWithFallback.ts: React hook that calls loadConfig and provides it to the app.

3.6 planr/stories/
User story JSON files (e.g., P001.json, S001.json).

These define acceptance criteria for each feature.

Used with a prompt-driven workflow (Windsurf) to keep tasks well-defined.

3.7 public/
Static assets served directly (images, icons, etc.).

Next.js auto-routes them at /.

For example, public/favicon.ico is accessible at https://yoursite.com/favicon.ico.

3.8 styles/
Global Tailwind styles in globals.css.

themes/ subfolder with CSS files for each theme (e.g. blue-notary.css).

These theme files can be imported conditionally based on the directory’s config.

3.9 tests/
Houses your unit tests, integration tests, or E2E tests.

tests/unit/: For individual function or hook testing (e.g., loadConfig.test.ts).

tests/e2e/: For end-to-end flows (e.g., login, claim, edit, search).

3.10 Root Files
.env.local: Local environment variables (e.g., Supabase credentials). Never commit this to source control.

package.json: Dependencies, scripts.

tsconfig.json: TypeScript configuration.

README.md: High-level project overview and setup instructions.

4. Development Workflow
Start with app/:

Implement pages, layouts, and routes for each directory slug.

Use the layout.tsx to apply theming via the config.

Add or Update Config Files:

Place them in /config/[slug].json.

If using Supabase overrides, ensure loadConfig.ts checks there first.

Build Components & Hooks:

lib/ for logic (e.g., config loaders, search helpers).

components/ for presentational or reusable UI parts.

Write & Run Tests:

Place unit tests in tests/unit/....

Add E2E tests in tests/e2e/... once the feature is integrated.

Maintain Docs:

Keep /docs/ updated with architecture changes, PRD adjustments, or new sitemaps.

5. Rationale
Separation of Concerns: Pages in app/ focus on routing and layout, while business logic goes in lib/.

Modular Theming: styles/themes/ keeps directory-specific CSS isolated.

Scalable: Adding a new directory requires adding a new .json (or row in Supabase) plus a new environment variable in Vercel.

Discoverability: Placing stories in planr/stories/ clarifies acceptance criteria, especially for prompt-driven coding (Windsurf).

Testability: A dedicated tests/ folder ensures you can keep an organized structure for all test types (unit, integration, E2E).

6. Future Considerations
app/directory/[slug]/ may grow to include subroutes:

e.g., app/directory/[slug]/profile/[profileId]/page.tsx.

public/ can house marketing images, PDFs, or static content you might need.

builder/ can become a robust admin interface (WYSIWYG config editing, deploy triggers, etc.) post-MVP.

stories/ might also include design specs or test fixture data in JSON format if you want a single source of truth for user flows.

7. Conclusion
This file structure ensures each directory (vertical site) can be rapidly deployed while sharing a single, maintainable codebase. By adhering to this layout and keeping your config-driven approach, you’ll maintain a clean, scalable environment that new contributors (or AI-driven coding workflows) can easily understand.