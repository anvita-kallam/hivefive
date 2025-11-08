import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import { BeeLogo } from "./BeeDecor";

export function Header() {
  return (
    <header className="bg-[rgba(212,165,116,0.8)] backdrop-blur-md border-b border-[#2D1B00]/20 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BeeLogo />
          <div>
            <h1 className="text-[#2D1B00]">HiveFive</h1>
            <p className="text-sm text-[#6B4E00]">Welcome back, Amita Kalani</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-[#2D1B00] hover:text-[#6B4E00] underline transition-colors">
            Edit Profile
          </button>
          <div className="relative">
            <Bell className="w-5 h-5 text-[#2D1B00]" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#3B82F6] rounded-full border-2 border-[#D4A574]"></span>
          </div>
          <Button className="bg-[rgba(193,125,58,0.8)] hover:bg-[rgba(193,125,58,0.9)] text-[#2D1B00] border border-[#2D1B00]/20 backdrop-blur-sm">
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
