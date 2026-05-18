import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  { ignores: [".next/**", ".open-next/**", "out/**", "build/**", "node_modules/**", "next-env.d.ts"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // next/image doesn't work in Cloudflare Workers runtime — intentional
      "@next/next/no-img-element": "off",
      // App Router uses layout.tsx for fonts, not pages/_document.js
      "@next/next/no-page-custom-font": "off",
    },
  },
];

export default eslintConfig;
