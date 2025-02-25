import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Extend from Next.js recommended configs
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Add react-hooks plugin
  "plugin:react-hooks/recommended", // Optional: This is for the most common React Hooks rules

  // Custom rules for React hooks
  {
    rules: {
      "react-hooks/rules-of-hooks": "error", // Ensures hooks are used correctly
      "react-hooks/exhaustive-deps": "warn", // Warns about missing dependencies in useEffect
    },
  },
];

export default eslintConfig;

