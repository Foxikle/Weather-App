import {type ClassValue, clsx} from 'clsx'
import {twMerge} from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Calculates the dew point with the given temperature and relative humidity
 * @param temp The tempeture, either in Celsius
 * @param humidity The relative humidity, as a number. (ie 67% would be 67)
 * @param isFahrenheit If the temperature is in Fahrenheit. This determines the unit of the output as well
 */
export function calculateDewPoint(temp: number, humidity: number, isFahrenheit: boolean = false): number {
    const a = 17.27;
    const bCelsius = 237.7;

    const tempC = isFahrenheit ? (temp - 32) * 5 / 9 : temp;

    const alpha = (a * tempC) / (bCelsius + tempC) + Math.log(humidity / 100);
    const dewPointCelsius = (bCelsius * alpha) / (a - alpha);


    const dewPoint = isFahrenheit ? dewPointCelsius * 9 / 5 + 32 : dewPointCelsius;
    return parseFloat(dewPoint.toPrecision(3));
}

export function getUVIndex(value: number): string {
    if (value < 0) return "Invalid UV index";
    if (value <= 2) return "Low";
    if (value <= 5) return "Moderate";
    if (value <= 7) return "High";
    if (value <= 10) return "Very High";
    return "Extreme";
}

export interface PreferenceData {
    temp: string
    distance: string
    speed: string
    pressure: string
    angle: string
    power: string
}

export interface WeatherApiResponse {
    stationtype: string
    PASSKEY: string
    dateutc: string
    tempf: number
    humidity: number
    windspeedmph: number
    windgustmph: number
    maxdailygust: number
    winddir: number
    uv: number
    solarradiation: number
    hourlyrainin: number
    dailyrainin: number
    weeklyrainin: number
    monthlyrainin: number
    totalrainin: number
    battout: number
    tempinf: number
    humidityin: number
    baromrelin: number
    baromabsin: number
    batt_co2: number
    created_at: string
    updated_at: string
}

/**
 * Translates the temperature to a different unit.
 * @param fahrenheit The temperature in FAHRENHEIT!
 * @param unit the unit to translate to
 */
export function translateTemperature(fahrenheit: number, unit: string): number {
    if (unit === 'celsius') {
        return (fahrenheit - 32) * 5 / 9;
    } else if (unit === 'kelvin') {
        return ((fahrenheit - 32) * 5 / 9) + 273.15;
    } else if (unit === 'rankine') {
        return fahrenheit + 459.67;
    } else return fahrenheit;
}

export function convertInches(inches: number, unit: string): number {
    const conversionFactors: { [key: string]: number } = {
        meters: 0.0254,
        miles: 1.5783e-5,
        millimeters: 25.4,
        centimeters: 2.54,
        furlongs: 0.000125,
        rods: 0.00505
    };

    if (!conversionFactors.hasOwnProperty(unit)) {
        return inches
    }

    return inches * conversionFactors[unit];
}
export function convertSpeed(mph: number, unit: string): number {
    const conversionFactors: { [key: string]: number } = {
        feet_per_minute: 88,
        feet_per_second: 1.46667,
        kilometers_per_hour: 1.60934,
        meters_per_minute: 26.8224,
        meters_per_second: 0.44704,
        furlongs_per_fortnight: 2688
    };

    if (!conversionFactors.hasOwnProperty(unit)) {
        return mph;
    }

    return mph * conversionFactors[unit];
}

export function convertPressure(inHg: number, unit: string): number {
    const conversionFactors: { [key: string]: number } = {
        millimeters_of_mercury: 25.4,
        pounds_per_square_inch: 0.491154,
        pascals: 3386.39,
        kilopascals: 3.38639,
        atmospheres: 0.0334211,
        bar: 0.0338639,
        torr: 25.4
    };

    if (!conversionFactors.hasOwnProperty(unit)) {
        return  inHg;
    }

    return inHg * conversionFactors[unit];
}

export function convertAngle(deg: number, unit: string): number {
    if(unit === 'radians') {
        return deg * (Math.PI / 180);
    }
    return deg;
}


export function convertPower(wattsPerSquareMeter: number, unit: string): number {
    const conversionFactors: { [key: string]: number } = {
        Horsepower: 0.00134102,
        'Calories per second': 0.2388459,
        'btu/hr': 3.412142,
        'decibel-miliwatts': 120,
        megawatts: 1e-6,
        kilowatts: 0.001
    };

    if (!conversionFactors.hasOwnProperty(unit)) {
        return wattsPerSquareMeter;
    }

    return wattsPerSquareMeter * conversionFactors[unit];
}
