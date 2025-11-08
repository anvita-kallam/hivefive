import { Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";

export function CalendarSync() {
  return (
    <div className="bg-[rgba(245,230,211,0.4)] backdrop-blur-md rounded-lg p-4 mb-6 border border-[#2D1B00]/20 shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className="flex gap-2 mt-1">
            <CheckCircle2 className="w-5 h-5 text-[#2D1B00]" />
            <Calendar className="w-5 h-5 text-[#2D1B00]" />
          </div>
          <div>
            <h3 className="text-[#2D1B00] mb-1">Google Calendar Sync</h3>
            <p className="text-sm text-[#6B4E00]">
              Connect to sync your calendar. Note: Requires Google app verification. Use the calendar button to manage events in the meantime.
            </p>
          </div>
        </div>
        <Button className="bg-[rgba(245,230,211,0.6)] backdrop-blur-sm hover:bg-[rgba(245,230,211,0.8)] text-[#2D1B00] border border-[#2D1B00]/20 whitespace-nowrap">
          Connect Calendar
        </Button>
      </div>
    </div>
  );
}
