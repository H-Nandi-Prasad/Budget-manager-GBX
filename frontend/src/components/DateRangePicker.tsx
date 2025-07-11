import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  dateRange: { start: Date | null; end: Date | null };
  setDateRange: React.Dispatch<React.SetStateAction<{
    start: Date | null;
    end: Date | null;
  }>>;
  className?: string;
}

export function DateRangePicker({
  dateRange,
  setDateRange,
  className,
}: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal bg-white/10 border-white/20 text-zinc-800",
              !dateRange.start && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.start ? (
              dateRange.end ? (
                <>
                  {format(dateRange.start, "LLL dd, y")} -{" "}
                  {format(dateRange.end, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.start, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-blue-900/80 backdrop-blur-md border-white/20" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.start}
            selected={{ 
              from: dateRange.start || undefined, 
              to: dateRange.end || undefined 
            }}
            onSelect={(range) => 
              setDateRange({ 
                start: range?.from || null, 
                end: range?.to || null 
              })
            }
            numberOfMonths={2}
            className="text-zinc-800"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
} 