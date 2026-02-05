# Catalyst UI Refinements - Summary Jan 26, 2026

## 📱 Responsive & Mobile Refinements
- **Navbar Layout (Tablet/Mobile):**
    - **Overflow Fix:** Applied `min-w-[60vw] max-w-fit` to the desktop container to prevent clipping while allowing natural expansion.
    - **Tenant Name:** Implemented smart truncation (`max-w-[140px]` + `truncate`) to prevent the user menu from breaking the layout on medium screens.
- **Navbar Layout (Desktop):**
    - **Split Distribution:** Refactored to a **Left (Logo/Tenant) / Center (Nav) / Right (Actions)** layout for better balance.
    - **Centered Navigation:** Navigation links are now absolutely positioned in the exact center of the bar.
- **Action Center:**
    - **Mobile/Tablet Layout:** Centered the panel (`95vw` width) for better visibility.
    - **Optimized Navigation:** Switched to **Icon-Only Tabs** on mobile/tablet to save horizontal space.
- **Mobile Apps Menu:**
    - **Active State:** Applied **Solid Brand Background** (`bg-primary`) to the active item in Light Mode for clearer indication.
- **Global UI:**
    - **Scrollbars:** Implemented `.scrollbar-minimal` (Zinc-300/700) and `.scrollbar-none` utilities for a cleaner aesthetic.

---

# Catalyst UI Refinements - Summary Jan 23, 2026

## Features & Implementation
- **Revenue Trend Chart:**
    - Light Mode: Gray line (`zinc-400`), solid brand dots.
    - Dark Mode: Brand line, hollow dots. Standardized via CSS variables in `theme.css`.
- **Header Structure:**
    - "Recent Orders" title is now separate from filters/tabs for improved visual hierarchy.
- **My Apps (Navbar):**
    - High-contrast solid hover state in Light Mode.
    - "New" badge for highlighted workspace.
    - Clear Brand ring for selection.
    - Fixed Dark Mode hover legibility (White text/icon for highlighted items).
- **Navigation Dropdowns:**
    - Increased hover contrast for Tenant dropdown (Zinc-200).
    - Fixed User Dropdown glassmorphism (Opacity + Blur) to match Action Center/My Apps.

## Next Steps for Monday
- Verify glassmorphism levels across different browsers.
- Audit any remaining hardcoded blue colors in secondary menus.

---

# Generative UI & UX Refinements - Summary Feb 05, 2026

## 🚀 Generative UI Enhancements
- **Enhanced Chat Confirmation:**
    - Modified `SuccessModal` and `StreamFeed` to support deep linking.
    - Added Markdown parsing in chat bubbles to allow rich navigation links (e.g., "View in Transactions").
- **File Upload Workflow:**
    - Implemented a simulated file upload in `ModeSelectionArtifact`.
    - Added "Upload Request" mode with drag-and-drop UI and processing simulation.

## 🎨 Visual & UX Improvements
- **Document Reviews:**
    - Improved legibility in `AssetReviewArtifact` and `QuoteProposalArtifact` by increasing font size and forcing high-contrast text (dark text on white backgrounds) to fix Dark Mode readability issues.
- **Navigation:**
    - Removed redundant "Continue to Asset Review" button in `AssetReviewArtifact`.
    - Implemented programmatic navigation via `GenUIContext` to support deep links from chat system messages.

## 🔧 Technical Updates
- **Deep Linking:** Added URL parameter handling (`?tab=quotes&id=...`) in `Transactions.tsx` to allow direct navigation to specific transaction states.
