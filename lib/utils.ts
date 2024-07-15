import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

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