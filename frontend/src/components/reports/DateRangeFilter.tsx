import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

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
  const handleDateSelect = (date: Date | undefined, isStart: boolean) => {
    if (!date) return;
    
    if (isStart) {
      onDateRangeChange({ startDate: date, endDate });
    } else {
      onDateRangeChange({ startDate, endDate: date });
    }
  };

  return (
    <div className="flex gap-4 items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[240px] justify-start text-left font-normal text-white border-white/20 hover:bg-white/10">
            <CalendarIcon className="mr-2 h-4 w-4 text-white" />
            {format(startDate, "PPP")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-slate-800 border-white/20" align="start">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={(date) => handleDateSelect(date, true)}
            initialFocus
            className="text-white"
          />
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[240px] justify-start text-left font-normal text-white border-white/20 hover:bg-white/10">
            <CalendarIcon className="mr-2 h-4 w-4 text-white" />
            {format(endDate, "PPP")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-slate-800 border-white/20" align="start">
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={(date) => handleDateSelect(date, false)}
            initialFocus
            className="text-white"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
