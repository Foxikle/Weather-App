import type {WeatherDateRange} from "~/lib/utils";
const now = new Date();

export const DEFAULT: WeatherDateRange = {
    start: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    end: now.toISOString(),
    isDefault: true
}
export default function useDateRange() {

    const STORAGE_KEY = 'weather:range:v1'

    const range = ref<WeatherDateRange>(DEFAULT)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const safeMerge = (raw: any): WeatherDateRange => {
        // Merge with defaults to ensure all fields exist and types are sane
        return {...DEFAULT, ...(typeof raw === 'object' && raw ? raw : {})}
    }

    const loadRange = () => {
        if (!process.client) return
        loading.value = true
        error.value = null

        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            range.value = stored ? safeMerge(JSON.parse(stored)) : DEFAULT
        } catch (err) {
            error.value = (err as Error).message
            range.value = DEFAULT
        } finally {
            loading.value = false
        }
    }

    loadRange()

    const persist = () => {
        if (!process.client) return
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(range.value))
        } catch (err) {
            error.value = (err as Error).message
        }
        console.log("Persisted preferences!")
    }

    const saveRange = (newPreferences: Partial<WeatherDateRange>) => {
        loading.value = true
        error.value = null

        try {
            range.value = newPreferences
            persist()
        } catch (err) {
            error.value = (err as Error).message
        } finally {
            loading.value = false
        }
    }

    const onRangeChange = (callback: (newPreferences: WeatherDateRange) => void) => {
        watch(range, (newVals) => {
            const updatedPreferences: WeatherDateRange = {
                start: newVals.start,
                end: newVals.end,
                isDefault: false
            };
            callback(updatedPreferences)
            // Also persist on any change to keep storage in sync
            persist()
        }, {deep: true});
    };

    return {
        range,
        loading,
        error,
        loadRange,
        saveRange,
        onRangeChange
    }
}
