# Documentation Comment Guide (TSDoc Style)

> Target: Common functions, hooks, and UI components under `core/`
> Purpose: Define unified rules for future automatic documentation generation and integration with tools like Storybook.

---

## 1. Basic Syntax

Use **TSDoc format (`/** ... */`)** for documentation comments.

```ts
/**
 * Summary (first line should be short and concise)
 *
 * Detailed description (from second line onwards). Describe operation overview and usage notes.
 */
export function doSomething() { ... }
```

* First line is **summary** (concise, one sentence)
* After blank line, write **detailed description** (optional)
* Markdown syntax (`**bold**`, `*italic*`, `\`code``) can be used

---

## 2. Main Tags Reference

| Tag           | Purpose                              | Example              |
| ------------- | ------------------------------------ | -------------------- |
| `@param`      | Describe function/hook parameters    | `@param lang Language code to use` |
| `@returns`    | Describe return value                | `@returns Current settings and update function` |
| `@remarks`    | Additional info/implementation notes | `@remarks Styles are adjusted with Tailwind classes.` |
| `@example`    | Show usage examples with code        | See below |
| `@see`        | Reference to related functions/files | `@see useSettings` |
| `@deprecated` | Mark deprecated APIs                 | `@deprecated Please use useNewHook instead.` |

---

## 3. Usage Examples (@example)

Wrap code samples in **TypeScript or JSX** blocks:

````tsx
/**
 * Large button for young children.
 *
 * @example
 * ```tsx
 * <Button onClick={() => alert('OK!')}>OK</Button>
 * ```
 */
export function Button(...) { ... }
````

> ⏩ In the future, when converted to Storybook or Markdown, this block will become a preview as-is.

---

## 4. Component-Specific Rules

For React components, follow these 3 points:

1. **Specify Props type** (`interface Props` or `JSX.IntrinsicElements[...]`)
2. **Write component comment directly before function definition**
3. **Explain individual props with `@param`**

```tsx
/**
 * Modal dialog.
 * @remarks Open/close state is managed by parent component.
 *
 * @param open Whether the modal is open.
 * @param onClose Callback when modal is closed.
 */
export function Modal({ open, onClose }: { open: boolean; onClose: () => void }) { ... }
```

---

## 5. Hook & Utility-Specific Rules

* For hooks, briefly describe the structure of return values (`@returns` recommended)
* Document side effects like internal state or localStorage usage in `@remarks`

```ts
/**
 * Hook to persist language settings in localStorage.
 *
 * @returns Current settings (`settings`) and update function (`set`).
 * @remarks Values are stored in `localStorage.settings`.
 */
export function useSettings() { ... }
```

---

## 6. Prohibited Items & Cautions

| Item                                           | Reason                                    |
| ---------------------------------------------- | ----------------------------------------- |
| Public functions without comments              | Will be missing in automatic documentation |
| Writing summaries only with JS comments (`//`) | Tools cannot parse them                   |

---

## 7. References

* [TSDoc Official Specification](https://tsdoc.org/pages/spec/overview/)
