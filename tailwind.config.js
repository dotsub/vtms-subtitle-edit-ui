function withOpacityValue(variable) {
    return ({ opacityValue }) => {
        if (opacityValue === undefined) {
            return `rgb(var(${variable}))`
        }
        return `rgba(var(${variable}), ${opacityValue})`
    }
}

module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx,html}"
    ],
    theme: {
        colors: {
            transparent: "transparent",
            current: "currentColor",
            white: withOpacityValue("--white"),
            black: withOpacityValue("--black"),
            red: {
                lighter: withOpacityValue("--red-lighter"),
                light: withOpacityValue("--red-light"),
                primary: withOpacityValue("--red-primary"),
                dark: withOpacityValue("--red-dark")
            },
            blue: {
                light: withOpacityValue("--blue-light"),
                primary: withOpacityValue("--blue-primary"),
                dark: withOpacityValue("--blue-dark"),
                darker: withOpacityValue("--blue-darker"),
            },
            green: {
                light: withOpacityValue("--green-light"),
                primary: withOpacityValue("--green-primary"),
                dark: withOpacityValue("--green-dark")
            },
            yellow: {
                light: withOpacityValue("--yellow-light"),
                primary: withOpacityValue("--yellow-primary"),
                dark: withOpacityValue("--yellow-dark")
            },
            gray: {
                0: withOpacityValue("--gray-0"),
                100: withOpacityValue("--gray-1"),
                200: withOpacityValue("--gray-2"),
                300: withOpacityValue("--gray-3"),
                400: withOpacityValue("--gray-4"),
                500: withOpacityValue("--gray-5"),
                600: withOpacityValue("--gray-6"),
                700: withOpacityValue("--gray-7"),
                800: withOpacityValue("--gray-8"),
                900: withOpacityValue("--gray-9"),
            },
            slate: {
                0: withOpacityValue("--slate-0")
            }
        },
        extend: {
            width: {
                "half": "50vw"
            },
            zIndex: {
                "100": "100",
                "200": "200"
            }
        },
        fontFamily: {
            sans: ["Roboto", "sans-serif"],
            mono: ["SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"]
        },
    },
    variants: {}
}
