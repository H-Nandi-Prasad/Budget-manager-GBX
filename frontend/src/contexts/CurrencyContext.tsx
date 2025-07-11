import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

// Exchange rate API endpoint
const EXCHANGE_RATE_API = "https://api.exchangerate-api.com/v4/latest/USD";

// Local storage key for currency
const CURRENCY_STORAGE_KEY = 'selected-currency';
const EXCHANGE_RATES_STORAGE_KEY = 'exchange-rates';
const RATES_EXPIRY_KEY = 'exchange-rates-expiry';
const RATES_EXPIRY_TIME = 1000 * 60 * 60; // 1 hour

// Fallback exchange rates
const FALLBACK_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 151.61,
  AUD: 1.52,
  CAD: 1.36,
  CHF: 0.90,
  CNY: 7.24,
  INR: 83.30,
  SGD: 1.35
};

interface CurrencyContextType {
  currency: string;
  exchangeRates: { [key: string]: number };
  isLoadingRates: boolean;
  setCurrency: (currency: string) => void;
  convertAmount: (amount: number | string, fromCurrency?: string) => number;
  formatAmount: (amount: number) => string;
  validateAmount: (amount: number | string | undefined | null) => boolean;
  parseAmount: (amount: string) => number | null;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [currency, setCurrencyState] = useState(() => {
    const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
    return saved || "USD";
  });
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>(() => {
    const saved = localStorage.getItem(EXCHANGE_RATES_STORAGE_KEY);
    const expiry = localStorage.getItem(RATES_EXPIRY_KEY);
    if (saved && expiry && Date.now() < parseInt(expiry)) {
      return JSON.parse(saved);
    }
    return FALLBACK_RATES;
  });
  const [isLoadingRates, setIsLoadingRates] = useState(false);

  const fetchExchangeRates = async () => {
    try {
      setIsLoadingRates(true);
      const response = await fetch(EXCHANGE_RATE_API);
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }
      const data = await response.json();
      setExchangeRates(data.rates);
      
      // Store rates and expiry time
      localStorage.setItem(EXCHANGE_RATES_STORAGE_KEY, JSON.stringify(data.rates));
      localStorage.setItem(RATES_EXPIRY_KEY, (Date.now() + RATES_EXPIRY_TIME).toString());
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      setExchangeRates(FALLBACK_RATES);
      toast({
        title: "Exchange Rates Unavailable",
        description: "Using fallback exchange rates. Some currency conversions may not be accurate.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRates(false);
    }
  };

  // Fetch rates on mount and set up refresh interval
  useEffect(() => {
    const initializeRates = async () => {
      const expiry = localStorage.getItem(RATES_EXPIRY_KEY);
      if (!expiry || Date.now() > parseInt(expiry)) {
        await fetchExchangeRates();
      }
    };

    initializeRates();

    // Refresh rates every hour
    const interval = setInterval(fetchExchangeRates, RATES_EXPIRY_TIME);
    return () => clearInterval(interval);
  }, []);

  const convertAmount = (amount: number | string, fromCurrency: string = "USD"): number => {
    console.log('Converting amount:', { amount, fromCurrency });

    // Handle invalid inputs
    if (amount === undefined || amount === null || amount === '') {
      return 0;
    }

    try {
      // Parse string amounts and ensure integer values
      let numericAmount: number;
      
      if (typeof amount === 'string') {
        // First try direct conversion
        numericAmount = Number(amount);
        if (isNaN(numericAmount)) {
          // If that fails, try cleaning the string
          const cleanAmount = amount.replace(/[^\d.-]/g, '');
          numericAmount = Number(cleanAmount);
        }
      } else {
        numericAmount = Number(amount);
      }

      // If still NaN, return 0
      if (isNaN(numericAmount)) {
        console.warn('Invalid amount in convertAmount:', amount);
        return 0;
      }

      // Ensure integer value
      numericAmount = Math.floor(numericAmount);

      // Validate exchange rates
      if (!exchangeRates || !exchangeRates[fromCurrency] || !exchangeRates[currency]) {
        console.warn('Missing exchange rates:', { fromCurrency, toCurrency: currency });
        return numericAmount;
      }

      // Convert to USD first (base currency)
      const amountInUSD = fromCurrency === "USD" 
        ? numericAmount 
        : Math.floor(numericAmount / exchangeRates[fromCurrency]);

      // Convert from USD to target currency
      const convertedAmount = currency === "USD"
        ? amountInUSD
        : Math.floor(amountInUSD * exchangeRates[currency]);

      return Math.floor(convertedAmount);
    } catch (error) {
      console.error('Error in convertAmount:', error);
      return 0;
    }
  };

  const formatAmount = (amount: number): string => {
    try {
      // Convert to number and check for NaN
      const numAmount = Number(amount);
      if (isNaN(numAmount)) {
        return '0';
      }

      // Ensure integer value
      const intAmount = Math.floor(numAmount);
      
      // Format with thousands separator
      return intAmount.toLocaleString('en-US', {
        style: 'decimal',
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
      });
    } catch (error) {
      console.error('Error in formatAmount:', error);
      return '0';
    }
  };

  const validateAmount = (amount: number | string | undefined | null): boolean => {
    if (amount === undefined || amount === null || amount === '') {
      return false;
    }

    try {
      // Convert to number
      let numValue: number;
      
      if (typeof amount === 'string') {
        // First try direct conversion
        numValue = Number(amount);
        if (isNaN(numValue)) {
          // If that fails, try cleaning the string
          const cleanAmount = amount.replace(/[^\d.-]/g, '');
          numValue = Number(cleanAmount);
        }
      } else {
        numValue = Number(amount);
      }

      // Check if it's NaN
      if (isNaN(numValue)) {
        console.warn('Invalid numeric value in validateAmount:', amount);
        return false;
      }

      // Ensure integer value
      numValue = Math.floor(numValue);

      // Check range
      if (numValue < Number.MIN_SAFE_INTEGER || numValue > Number.MAX_SAFE_INTEGER) {
        console.warn('Amount out of valid range:', numValue);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in validateAmount:', error);
      return false;
    }
  };

  const parseAmount = (amount: string): number | null => {
    if (!amount) return null;

    try {
      // First try direct conversion
      let numValue = Number(amount);
      
      if (isNaN(numValue)) {
        // If that fails, try cleaning the string
        const cleanAmount = amount.replace(/[^\d.-]/g, '');
        numValue = Number(cleanAmount);
      }

      if (isNaN(numValue)) {
        return null;
      }

      // Ensure integer value
      const intValue = Math.floor(numValue);

      // Check if it's within safe integer range
      if (!Number.isSafeInteger(intValue)) {
        return null;
      }

      return intValue;
    } catch (error) {
      console.error('Error in parseAmount:', error);
      return null;
    }
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
    
    // Dispatch a custom event to notify all components
    window.dispatchEvent(new CustomEvent('currency-changed', { 
      detail: { currency: newCurrency }
    }));

    toast({
      title: "Currency Updated",
      description: `Application currency has been changed to ${newCurrency}`,
    });
  };

  // Listen for currency changes from other components
  useEffect(() => {
    const handleCurrencyEvent = (event: CustomEvent<{ currency: string }>) => {
      setCurrencyState(event.detail.currency);
    };

    window.addEventListener('currency-changed', handleCurrencyEvent as EventListener);
    return () => {
      window.removeEventListener('currency-changed', handleCurrencyEvent as EventListener);
    };
  }, []);

  return (
    <CurrencyContext.Provider 
      value={{
        currency,
        exchangeRates,
        isLoadingRates,
        setCurrency: handleCurrencyChange,
        convertAmount,
        formatAmount,
        validateAmount,
        parseAmount,
        refreshRates: fetchExchangeRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}; 