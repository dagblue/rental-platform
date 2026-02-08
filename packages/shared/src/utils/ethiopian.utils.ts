export const isEthiopianPhone = (phone: string) => /^\+251/.test(phone);
export const formatEthiopianPhone = (phone: string) => phone.replace(/^\+251/, '0');