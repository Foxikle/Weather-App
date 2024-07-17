import { ref } from 'vue'
import type {PreferenceData} from "~/lib/utils";


export default function useUserPreferences() {
    const preferences = ref<PreferenceData>({angle: "degrees", distance: "inches", power: "watt", pressure: "inches_of_mercury", speed: "miles_per_hour", temp: "fahrenheit"})
    const loading = ref(false)
    const error = ref<string | null>(null)

    const loadPreferences = () => {
        loading.value = true
        error.value = null

        try {
            const storedPreferences = localStorage.getItem('userPreferences')
            preferences.value = storedPreferences ? JSON.parse(storedPreferences) : {}
        } catch (err) {
            error.value = (err as Error).message
        } finally {
            loading.value = false
        }
    }
    loadPreferences();

    const savePreferences = (newPreferences: PreferenceData) => {
        loading.value = true
        error.value = null

        try {
            preferences.value = { ...preferences.value, ...newPreferences }
            localStorage.setItem('userPreferences', JSON.stringify(preferences.value))
        } catch (err) {
            error.value = (err as Error).message
        } finally {
            loading.value = false
        }
    }

    return {
        preferences,
        loading,
        error,
        loadPreferences,
        savePreferences,
    }
}
