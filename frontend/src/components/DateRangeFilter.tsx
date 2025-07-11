import { DatePicker } from "@/components/ui/date-picker";

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface DateRangeFilterProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (range: DateRange) => void;
}

export const DateRangeFilter = ({ startDate, endDate, onDateRangeChange }: DateRangeFilterProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">From:</span>
        <DatePicker
          date={startDate}
          onDateChange={(date) => onDateRangeChange({ startDate: date, endDate })}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">To:</span>
        <DatePicker
          date={endDate}
          onDateChange={(date) => onDateRangeChange({ startDate, endDate: date })}
        />
      </div>
    </div>
  );
}; 