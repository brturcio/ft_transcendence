import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from "fs"

export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
	],
	server: {
		host: "0.0.0.0",
		port: 3000,
		https: {
			cert: fs.readFileSync("10.13.247.134.pem"),
			key: fs.readFileSync("10.13.247.134-key.pem")
		},
	},
})

