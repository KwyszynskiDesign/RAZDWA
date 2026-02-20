// Domain types for pricing calculations

export type PricingCalculation = {
    basePrice: number;
    discount?: number;
    tax?: number;
};

export type PriceBreakdown = {
    total: number;
    details: string;
};

export function calculateTotal(pricing: PricingCalculation): PriceBreakdown {
    const discountAmount = pricing.discount ? (pricing.basePrice * (pricing.discount / 100)) : 0;
    const subtotal = pricing.basePrice - discountAmount;
    const taxAmount = pricing.tax ? (subtotal * (pricing.tax / 100)) : 0;
    const total = subtotal + taxAmount;

    return {
        total,
        details: `Base Price: $${pricing.basePrice}, Discount: $${discountAmount}, Tax: $${taxAmount}`,
    };
}