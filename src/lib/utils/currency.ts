export const CURRENCY_SYMBOLS: Record<string, string> = {
  LKR: "Rs ",
  USD: "$",
  EUR: "€"
};

export const EXCHANGE_RATES: Record<string, number> = {
  LKR: 1,
  USD: 300, // 1 USD = 300 LKR
  EUR: 320  // 1 EUR = 320 LKR
};

/**
 * Formats a number into a localized currency string with the correct symbol.
 * Example: formatCurrency(1500, "USD") => "$1,500.00"
 */
export const formatCurrency = (amount: number, currency: string = "LKR"): string => {
  const symbol = CURRENCY_SYMBOLS[currency] || "Rs ";
  
  const formattedAmount = amount.toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });

  return `${symbol}${formattedAmount}`;
};

/**
 * Converts an amount from one currency to another using mock exchange rates.
 * Example: convertCurrency(100, "USD", "LKR") => 30000
 */
export const convertCurrency = (amount: number, from: string, to: string = "LKR"): number => {
  if (from === to) return amount;
  
  const fromRate = EXCHANGE_RATES[from] || 1;
  const toRate = EXCHANGE_RATES[to] || 1;
  
  // Convert 'from' currency to LKR (base), then from LKR to 'to' currency
  const amountInLKR = amount * fromRate;
  return amountInLKR / toRate;
};
