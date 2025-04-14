import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";

interface StatCardProps {
  title: string;
  value: number | string;
  change?: number;
  changePeriod?: string;
  isCurrency?: boolean;
  isPercentage?: boolean;
}

export function StatCard({
  title,
  value,
  change,
  changePeriod = "from last month",
  isCurrency = false,
  isPercentage = false,
}: StatCardProps) {
  const formattedValue = isCurrency
    ? formatCurrency(typeof value === 'string' ? parseFloat(value) : value)
    : isPercentage
    ? `${value}%`
    : value;

  const isPositiveChange = change && change > 0;
  const isNegativeChange = change && change < 0;
  const changeText = change ? `${isPositiveChange ? '+' : ''}${change}%` : 'N/A';

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 flex flex-col">
        <div className="text-sm font-medium text-gray-500">{title}</div>
        <div className="mt-1 text-2xl font-semibold text-gray-900">
          {formattedValue}
        </div>
        {change !== undefined && (
          <div
            className={`mt-1 text-sm font-medium flex items-center ${
              isPositiveChange
                ? 'text-green-600'
                : isNegativeChange
                ? 'text-red-600'
                : 'text-gray-500'
            }`}
          >
            {isPositiveChange ? (
              <ArrowUp className="h-4 w-4 mr-1" />
            ) : isNegativeChange ? (
              <ArrowDown className="h-4 w-4 mr-1" />
            ) : null}
            <span>{changeText}</span>
            <span className="text-gray-500 ml-1">{changePeriod}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
