import {type ClassValue, clsx} from 'clsx'
import {twMerge} from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Calculates the dew point with the given temperature and relative humidity
 * @param temp The temperature, either in Celsius, Fahrenheit, Kelvin, or Rankine
 * @param unit The unit to export
 * @param humidity The relative humidity, as a number. (ie 67% would be 67)
 */
export function calculateDewPoint(temp: number, unit: string, humidity: number): number {
    // Convert the input temperature from Fahrenheit to Celsius
    const tempCelsius = (temp - 32) * 5 / 9;

    // Constants for the Magnus formula
    const a = 17.27;
    const b = 237.7;

    // Calculate the dew point in Celsius using the Magnus formula
    const alpha = (a * tempCelsius) / (b + tempCelsius) + Math.log(humidity / 100);
    const dewPointCelsius = (b * alpha) / (a - alpha);

    // Convert the dew point to the desired output unit
    let returnme = 0;
    switch (unit) {
        case 'fahrenheit':
            returnme = dewPointCelsius * 9 / 5 + 32;
            break
        case 'kelvin':
            returnme = dewPointCelsius + 273.15;
            break
        case 'rankine':
            returnme = (dewPointCelsius + 273.15) * 9 / 5;
            break
        case 'celsius':
        default:
            returnme = dewPointCelsius;
    }
    return parseFloat(returnme.toFixed(1));
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
export function convertTemperature(fahrenheit: number, unit: string): number {
    let returnme = 0;
    if (unit === 'celsius') {
        returnme = (fahrenheit - 32) * 5 / 9;
    } else if (unit === 'kelvin') {
        returnme = ((fahrenheit - 32) * 5 / 9) + 273.15;
    } else if (unit === 'rankine') {
        returnme = fahrenheit + 459.67;
    } else returnme = fahrenheit;

    return parseFloat(returnme.toFixed(1));
}

export function convertDistance(inches: number, unit: string): number {
    const conversionFactors: { [key: string]: number } = {
        meters: 0.0254,
        miles: 1.5783e-5,
        millimeters: 25.4,
        centimeters: 2.54,
        furlongs: 0.000125,
        rods: 0.00505
    };

    if (!conversionFactors.hasOwnProperty(unit)) {
        return parseFloat(inches.toFixed(2));
    }

    return parseFloat((inches * conversionFactors[unit]).toFixed(2));
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
        return parseFloat(mph.toFixed(1));
    }

    return parseFloat((mph * conversionFactors[unit]).toFixed(1));
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
        return parseFloat(inHg.toFixed(2));
    }

    return parseFloat((inHg * conversionFactors[unit]).toFixed(1));
}

export function convertAngle(deg: number | undefined, unit: string): number {
    if (deg) {
        if (unit === 'radians') {
            return parseFloat((deg * (Math.PI / 180)).toFixed(5));
        }
        return parseFloat(deg.toFixed(1));
    } else return 0;
}

export function convertPower(wattsPerSquareMeter: number, unit: string): number {
    const conversionFactors: { [key: string]: number } = {
        horsepower: 0.00134102,
        calories_per_second: 0.2388459,
        btu_per_hr: 3.412142,
        decibel_milliwatts: 120,
        megawatts: 1e-6,
        kilowatts: 0.001
    };

    if (!conversionFactors.hasOwnProperty(unit)) {
        return parseFloat(wattsPerSquareMeter.toFixed(2));
    }

    return parseFloat((wattsPerSquareMeter * conversionFactors[unit]).toFixed(2));
}

export function toAbbreviation(str: string): string {
    switch (str) {
        case 'horsepower':
            return 'hp';
        case 'calories_per_second':
            return 'cal/s';
        case 'btu_per_hour':
            return 'btu/hr';
        case 'decibel_milliwatts':
            return 'dBm';
        case 'megawatts':
            return 'MW';
        case 'kilowatts':
            return 'kW';
        case 'radians':
            return 'rad';
        case 'degrees':
            return '°';
        case 'rankine':
            return '°R';
        case 'kelvin':
            return '°K';
        case 'celsius':
            return '°C';
        case 'fahrenheit':
            return '°F';
        case 'millimeters_of_mercury':
            return 'mmHg';
        case 'pounds_per_square_inch':
            return 'psi';
        case 'pascals':
            return 'Pa';
        case 'kilopascals':
            return 'kPa';
        case 'atmospheres':
            return 'atm';
        case 'torr':
            return 'torr';
        case 'bar':
            return 'bar';
        case 'feet_per_minute':
            return 'ft/min';
        case 'feet_per_second':
            return 'ft/sec';
        case 'kilometers_per_hour':
            return 'kmph';
        case 'meters_per_minute':
            return 'm/min';
        case 'meters_per_second':
            return 'm/s';
        case 'furlongs_per_fortnight':
            return 'flng/ftnt';
        case 'meters':
            return 'm';
        case 'miles':
            return 'mi';
        case 'inches':
            return 'in';
        case 'millimeters':
            return 'mm';
        case 'centimeters':
            return 'cm';
        case 'furlongs':
            return 'flng';
        case 'rods':
            return 'rods';
        case 'miles_per_hour':
            return 'mph';
        case 'inches_of_mercury':
            return 'inHg';
        case 'watt':
            return 'W';

        default:
            return 'ERR';
    }
}
