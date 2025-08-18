import { ref, onMounted, watch } from 'vue'
import type { PreferenceData } from "~/lib/utils";
import { getLocalTimeZone, today } from "@internationalized/date";

export default function useUserPrefs(){
    const DEFAULT: PreferenceData = {
        angle: "degrees",
        distance: "inches",
        power: "watt",
        pressure: "inches_of_mercury",
        speed: "miles_per_hour",
        temp: "fahrenheit",
        start: today(getLocalTimeZone()).toDate(getLocalTimeZone()).toISOString(),
        end: today(getLocalTimeZone()).add({days: 1}).toDate(getLocalTimeZone()).toISOString(),
    };

    const STORAGE_KEY = 'weather:prefs:v1'
    const LEGACY_KEY = 'userPreferences'

    const preferences = ref<PreferenceData>(DEFAULT)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const safeMerge = (raw: any): PreferenceData => {
        // Merge with defaults to ensure all fields exist and types are sane
        const merged = { ...DEFAULT, ...(typeof raw === 'object' && raw ? raw : {}) }
        return merged
    }

    const loadPreferences = () => {
        if (!process.client) return
        loading.value = true
        error.value = null

        try {
            // Migrate from legacy key if present
            const legacy = localStorage.getItem(LEGACY_KEY)
            if (legacy && !localStorage.getItem(STORAGE_KEY)) {
                localStorage.setItem(STORAGE_KEY, legacy)
                localStorage.removeItem(LEGACY_KEY)
            }

            const stored = localStorage.getItem(STORAGE_KEY)
            preferences.value = stored ? safeMerge(JSON.parse(stored)) : DEFAULT
        } catch (err) {
            error.value = (err as Error).message
            preferences.value = DEFAULT
        } finally {
            loading.value = false
        }
    }

    onMounted(() => {
        loadPreferences();
    })

    const persist = () => {
        if (!process.client) return
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences.value))
        } catch (err) {
            error.value = (err as Error).message
        }
    }

    const savePreferences = (newPreferences: Partial<PreferenceData>) => {
        loading.value = true
        error.value = null

        try {
            preferences.value = safeMerge({ ...preferences.value, ...newPreferences })
            persist()
        } catch (err) {
            error.value = (err as Error).message
        } finally {
            loading.value = false
        }
    }

    const onPreferencesChange = (callback: (newPreferences: PreferenceData) => void) => {
        watch(preferences, (newVals) => {
            const updatedPreferences: PreferenceData = {
                temp: newVals.temp,
                distance: newVals.distance,
                speed: newVals.speed,
                pressure: newVals.pressure,
                angle: newVals.angle,
                power: newVals.power,
                start: newVals.start,
                end: newVals.end,
            };
            callback(updatedPreferences)
            // Also persist on any change to keep storage in sync
            persist()
        }, { deep: true });
    };

    return {
        preferences,
        loading,
        error,
        loadPreferences,
        savePreferences,
        onPreferencesChange
    }
}
