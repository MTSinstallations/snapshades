import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-ui': ['@radix-ui/react-tooltip', '@radix-ui/react-toast', '@radix-ui/react-dialog'],
          'data-catalog': [
            './src/data/norman-catalog.ts',
            './src/data/norman-shutters.ts',
            './src/data/norman-roller.ts',
            './src/data/norman-faux-wood.ts',
            './src/data/norman-roman.ts',
            './src/data/norman-specialty.ts',
            './src/data/norman-wood-blinds.ts',
            './src/data/norman-swatches.ts',
          ],
        },
      },
    },
  },
});
