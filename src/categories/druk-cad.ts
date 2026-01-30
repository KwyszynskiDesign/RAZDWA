export interface DrukCADOptions {
  mode: "bw" | "color";
  format: string;
  lengthMm: number;
  express: boolean;
}

export function calculateDrukCAD(options: DrukCADOptions, pricing: any) {
  const formatData = pricing.format_prices[options.mode][options.format];
  const meterPrice = pricing.meter_prices[options.mode][options.format];

  let basePrice = 0;
  let isMeter = false;

  if (options.lengthMm === formatData.length) {
    basePrice = formatData.price;
  } else {
    basePrice = (options.lengthMm / 1000) * meterPrice;
    isMeter = true;
  }

  let totalPrice = basePrice;
  if (options.express) {
    totalPrice = basePrice * 1.2;
  }

  return {
    totalPrice: parseFloat(totalPrice.toFixed(2)),
    basePrice,
    isMeter,
    formatLength: formatData.length,
    meterPrice: isMeter ? meterPrice : null
  };
}
