# Code Review Report

This report details the findings of a comprehensive code review of the entire application. The issues are categorized by severity (Critical, High, Medium, and Low) and cover a range of topics, including accessibility, security, best practices, and code consistency.

## Critical

### Accessibility

*   **Custom Tooltip Implementation:** The custom tooltip in `tooltip.js` is not accessible to screen reader users. It relies on mouse events (`mouseenter`, `mouseleave`) and does not use appropriate ARIA attributes (like `aria-describedby`) to associate the tooltip with its trigger. This means that users who rely on assistive technologies will not be able to access the information in the tooltips.

### Security

*   **Use of `innerHTML`:** The `roller.js` script uses `innerHTML` to set content from the `data-roller` attribute. If this content were ever to be user-generated, this would be a significant security risk, as it could lead to Cross-Site Scripting (XSS) attacks.

## High

### Inconsistency

*   **Redundant Tooltip Implementations:** There are two separate and inconsistent tooltip implementations: a generic one in `scripts/tooltip.js` and another specific to the commit status in `scripts/commit.js`. This is redundant and makes the code harder to maintain. A single, reusable tooltip implementation should be used throughout the site.

### Best Practices

*   **Overuse of Inline Styles:** Inline styles are used extensively throughout the HTML files. This violates the principle of separation of concerns, making the code harder to read, maintain, and update. All styles should be moved to external CSS files.
*   **Improper Use of `<br>` Tags:** `<br>` tags are used for creating vertical space between elements. This is semantically incorrect. CSS margins or padding should be used for spacing.
*   **Missing `<main>` Tag:** Most of the HTML pages are missing a `<main>` tag, which is important for accessibility and SEO. The main content of each page should be wrapped in a `<main>` tag.

## Medium

### CSS

*   **Inconsistent CSS Variable Naming:** The CSS variable naming is inconsistent. While some variables are named semantically (e.g., `--github`, `--discord`), others use a generic naming scheme (e.g., `--c050`, `--c100`). A consistent naming convention should be adopted.
*   **Typo in Selector:** The `content figure` selector in `styles/style.css` appears to be a typo and should likely be `figure`.

### JavaScript

*   **Lack of Robustness in `roller.js`:** The `roller.js` script does not handle cases where the `data-roller` attribute is empty or contains only whitespace. This could lead to unexpected behavior.
*   **Limited Error Handling in `commit.js`:** The error handling in `commit.js` is limited. While errors are logged to the console, there is no user-facing feedback when the commit information fails to load.

## Low

### HTML

*   **Redundant `<b>` Tag:** The `<b>` tag is used within a `<h1>` tag in `index.html`, which is redundant since `<h1>` elements are already bold by default.
*   **Missing `lang` Attribute:** The `lang` attribute is missing from the `<html>` tag in `404.html`.
*   **Unnecessary `console.log`:** There is a `console.log` in a `<script>` tag in `index.html` that should be removed in a production environment.

### CSS

*   **Unused CSS Class:** The `.search` class in `styles/style.css` is defined but does not appear to be used in any of the HTML files.

### File Structure

*   **Unused Directories:** The `blank` and `secret` directories appear to be unused and could be removed to clean up the project structure.
