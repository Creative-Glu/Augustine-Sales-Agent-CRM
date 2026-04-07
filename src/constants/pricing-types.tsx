import { Wrench, CreditCard, ShoppingBag, CircleHelp } from 'lucide-react';

export interface ProductPricingTypeOption {
  id: number;
  label: string;
  value: string;
}

export const PRODUCT_PRICING_TYPE: ProductPricingTypeOption[] = [
  {
    id: 1,
    label: 'Free',
    value: 'free',
  },
  {
    id: 2,
    label: 'One-time',
    value: 'one-time',
  },
  {
    id: 3,
    label: 'Service',
    value: 'service',
  },
  {
    id: 4,
    label: 'Custom',
    value: 'custom',
  },
] as const;

export const pricingTypeConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  service: {
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    icon: <Wrench className="h-3.5 w-3.5 mr-1" />,
  },
  subscription: {
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    icon: <CreditCard className="h-3.5 w-3.5 mr-1" />,
  },
  package: {
    color: 'bg-green-100 text-green-700 border-green-300',
    icon: <ShoppingBag className="h-3.5 w-3.5 mr-1" />,
  },
  default: {
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    icon: <CircleHelp className="h-3.5 w-3.5 mr-1" />,
  },
};
