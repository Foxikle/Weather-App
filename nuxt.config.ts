// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
    devtools: {
        enabled: true,

        timeline: {
            enabled: true,
        },
    },
    modules: ["shadcn-nuxt", '@nuxtjs/color-mode', 'nuxt-highcharts'],
    shadcn: {
        /**
         * Prefix for all the imported component
         */
        prefix: '',
        /**
         * Directory that the component lives in.
         * @default "./components/ui"
         */
        componentDir: './components/ui'
    },
    colorMode: {
        classSuffix: ''
    },
    css: ['~/assets/css/tailwind.css'],
    vite: {
        plugins: [tailwindcss()],
    },
    compatibilityDate: "2024-07-03",
})