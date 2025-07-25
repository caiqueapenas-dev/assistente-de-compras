import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // Adicione esta linha

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()], // Adicione o plugin tailwindcss() aqui
});
