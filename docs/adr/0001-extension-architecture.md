# ADR 0001: WXT + Vue and isolated runtime contexts

- Status: Accepted for initial implementation
- Context: Browser extensions have isolated sidepanel, background and content-script contexts; DOM access is available in content scripts, not sidepanel UI.
- Decision: Use WXT + Vue 3 + TypeScript; keep DOM inspection in content script, UI state in sidepanel Pinia, pure color logic in shared modules, and typed runtime-validated messaging between contexts.
- Consequences: More explicit message contracts and lifecycle handling, but clearer testing, security and portability.
- Revisit when: Firefox parity, CSS cascade tracing or native pixel sampling requires new browser adapters.
