export const reactSelectStyles = {
  control: (base, state) => ({
    ...base,
    borderRadius: "32px",
    /*  borderColor: state.isFocused
                        ? "var(--ring)"
                        : "var(--border)", */
    boxShadow: state.isFocused ? "0 0 0 2px var(--ring)" : "none",
    padding: "2px 4px",
    "&:hover": {
      borderColor: "var(--ring)",
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: "var(--muted-foreground)",
    fontSize: "0.875rem",
  }),
  singleValue: (base) => ({
    ...base,
    fontSize: "0.875rem",
  }),
  input: (base) => ({
    ...base,
    fontSize: "0.875rem",
  }),
  // Optionally style the menu and its container
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  menu: (base) => ({ ...base, zIndex: 9999 }),
};
