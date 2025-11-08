import { Calendar, Users } from "lucide-react";

const events = [
  {
    title: "AI ATL",
    date: "Nov 8, 2024",
    attendees: "3 enrolled",
  },
  {
    title: "Ohno",
    date: "Nov 10, 2024",
    attendees: "2 enrolled",
  },
];

export function UpcomingEvents() {
  return (
    <div className="bg-[rgba(245,230,211,0.4)] backdrop-blur-md rounded-lg p-6 mb-6 border border-[#2D1B00]/20 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <CheckCircle2Icon />
        <h2 className="text-[#2D1B00]">Upcoming Events</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((event, index) => (
          <div
            key={index}
            className="bg-[rgba(245,230,211,0.5)] backdrop-blur-sm rounded-lg p-4 border border-[#2D1B00]/20 shadow-md"
          >
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[#2D1B00] mt-0.5" />
              <div className="flex-1">
                <h4 className="text-[#2D1B00] mb-1">{event.title}</h4>
                <p className="text-sm text-[#6B4E00] mb-2">{event.date}</p>
                <div className="flex items-center gap-2 text-sm text-[#6B4E00]">
                  <Users className="w-4 h-4" />
                  <span>{event.attendees}</span>
                </div>
              </div>
            </div>
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
