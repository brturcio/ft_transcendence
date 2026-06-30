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
			cert: fs.readFileSync("ft_transcendance.com+2.pem"),
			key: fs.readFileSync("ft_transcendance.com+2-key.pem")
		},
	},
})

