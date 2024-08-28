import {ref} from 'vue'
import type {PreferenceData} from "~/lib/utils";
import {CalendarDate, getLocalTimeZone, today} from "@internationalized/date";

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
    const preferences = ref<PreferenceData>(DEFAULT)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const loadPreferences = () => {
        loading.value = true
        error.value = null

        try {
            const storedPreferences = localStorage.getItem('userPreferences')
            preferences.value = storedPreferences ? JSON.parse(storedPreferences) : DEFAULT
        } catch (err) {
            error.value = (err as Error).message
        } finally {
            loading.value = false
        }
    }

    onMounted(() => {
        loadPreferences();
    })

    const savePreferences = (newPreferences: any) => {
        loading.value = true
        error.value = null

        try {
            preferences.value = {...preferences.value, ...newPreferences}
            localStorage.setItem('userPreferences', JSON.stringify(preferences.value))
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

            callback(updatedPreferences);        }, { deep: true });
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
