import { Header } from "./components/Header";
import { CalendarSync } from "./components/CalendarSync";
import { MyCalendar } from "./components/MyCalendar";
import { UpcomingEvents } from "./components/UpcomingEvents";
import { MyHives } from "./components/MyHives";
import { BeeDecor } from "./components/BeeDecor";

export default function App() {
  return (
    <div className="min-h-screen bg-[#D4A574] relative overflow-hidden">
      <BeeDecor />
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-6 relative z-10">
        <CalendarSync />
        <MyCalendar />
        <UpcomingEvents />
        <MyHives />
      </main>
    </div>
  );
}
