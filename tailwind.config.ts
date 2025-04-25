import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			animation: {
				"fade-in": "fadeIn 0.3s ease-in-out",
				"fade-up": "fadeUp 0.5s ease-out forwards",
				"gradient-x": "gradient-x 3s ease infinite",
				shimmer: "shimmer 2s linear infinite",
			},
			keyframes: {
				fadeIn: {
					"0%": { opacity: "0", transform: "translateY(10px)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
				fadeUp: {
					"0%": {
						opacity: "0",
						transform: "translateY(20px) scale(0.95)",
					},
					"100%": {
						opacity: "1",
						transform: "translateY(0) scale(1)",
					},
				},
				"gradient-x": {
					"0%, 100%": {
						"background-size": "200% 200%",
						"background-position": "left center",
					},
					"50%": {
						"background-size": "200% 200%",
						"background-position": "right center",
					},
				},
				shimmer: {
					"0%": {
						"background-position": "-200% 0",
					},
					"100%": {
						"background-position": "200% 0",
					},
				},
			},
			backdropBlur: {
				xs: "2px",
			},
		},
	},
	plugins: [],
};

export default config;
