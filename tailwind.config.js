/** @type {import(\'tailwindcss\').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./index.html", // Include index.html for base structure classes
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))", // Use CSS variable for background
        foreground: "hsl(var(--foreground))", // Use CSS variable for foreground text
        primary: {
          DEFAULT: "hsl(var(--primary))", // Gold/Ochre - Use CSS variable
          foreground: "hsl(var(--primary-foreground))", // Text on primary color
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))", // Beige/Cream - Use CSS variable
          foreground: "hsl(var(--secondary-foreground))", // Text on secondary color
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom Murela Colors based on presentation
        murela: {
          gold: "#B8860B", // Example Gold
          beige: "#F5F5DC", // Example Beige
          darkgold: "#A0740A", // Darker gold for hover/accents
          lightbeige: "#FFF8DC", // Lighter beige
          textdark: "#333333", // Dark text
          textmedium: "#555555", // Medium text
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"], // Example: Using Inter font family
        // Add other font families if needed based on presentation
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

