import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "./ui/button";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const calendarDays = [
  { date: 28, month: "prev" },
  { date: 27, month: "prev" },
  { date: 28, month: "prev" },
  { date: 29, month: "prev" },
  { date: 30, month: "prev" },
  { date: 31, month: "prev" },
  { date: 1, month: "current" },
  { date: 2, month: "current" },
  { date: 3, month: "current" },
  { date: 4, month: "current" },
  { date: 5, month: "current" },
  { date: 6, month: "current" },
  { date: 7, month: "current" },
  { date: 8, month: "current", hasEvent: true },
  { date: 9, month: "current" },
  { date: 10, month: "current" },
  { date: 11, month: "current" },
  { date: 12, month: "current" },
  { date: 13, month: "current" },
  { date: 14, month: "current" },
  { date: 15, month: "current" },
  { date: 16, month: "current" },
  { date: 17, month: "current" },
  { date: 18, month: "current" },
  { date: 19, month: "current" },
  { date: 20, month: "current" },
  { date: 21, month: "current" },
  { date: 22, month: "current" },
  { date: 23, month: "current" },
  { date: 24, month: "current" },
  { date: 25, month: "current" },
  { date: 26, month: "current" },
  { date: 27, month: "current" },
  { date: 28, month: "current" },
  { date: 29, month: "current" },
  { date: 30, month: "current" },
  { date: 1, month: "next" },
  { date: 2, month: "next" },
  { date: 3, month: "next" },
  { date: 4, month: "next" },
  { date: 5, month: "next" },
  { date: 6, month: "next" },
];

export function MyCalendar() {
  return (
    <div className="bg-[rgba(245,230,211,0.4)] backdrop-blur-md rounded-lg p-6 mb-6 border border-[#2D1B00]/20 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CheckCircle2Icon />
          <Calendar className="w-5 h-5 text-[#2D1B00]" />
          <h2 className="text-[#2D1B00]">My Calendar</h2>
        </div>
        <Button className="bg-[rgba(245,230,211,0.6)] backdrop-blur-sm hover:bg-[rgba(245,230,211,0.8)] text-[#2D1B00] border border-[#2D1B00]/20 gap-2">
          <Plus className="w-4 h-4" />
          Add Event
        </Button>
      </div>

      <div className="mb-4 flex items-center justify-center gap-4">
        <button className="text-[#2D1B00] hover:text-[#6B4E00]">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-[#2D1B00] min-w-[200px] text-center">November 2025</h3>
        <button className="text-[#2D1B00] hover:text-[#6B4E00]">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-[#2D1B00] py-2">
            {day}
          </div>
        ))}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`min-h-[80px] p-2 rounded-lg border backdrop-blur-sm ${
              day.month === "current"
                ? day.hasEvent
                  ? "bg-[rgba(245,230,211,0.6)] border-[#C17D3A] border-2 shadow-md"
                  : "bg-[rgba(245,230,211,0.5)] border-[#2D1B00]/20"
                : "bg-[rgba(230,200,150,0.3)] border-[#2D1B00]/10 opacity-50"
            }`}
          >
            <div className="text-[#2D1B00]">{day.date}</div>
            {day.hasEvent && (
              <div className="mt-1 bg-[rgba(193,125,58,0.8)] backdrop-blur-sm text-[#2D1B00] text-xs px-2 py-1 rounded">
                9:30 AM - Dinner
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CheckCircle2Icon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-[#2D1B00]"
    >
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}
