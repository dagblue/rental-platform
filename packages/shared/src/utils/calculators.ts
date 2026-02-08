export const calculateDeposit = (amount: number, multiplier: number) => amount * multiplier;
export const calculateTotal = (dailyRate: number, days: number) => dailyRate * days;