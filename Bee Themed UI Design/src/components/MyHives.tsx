import { Plus } from "lucide-react";
import { Button } from "./ui/button";

export function MyHives() {
  return (
    <div className="bg-[rgba(245,230,211,0.4)] backdrop-blur-md rounded-lg p-6 border border-[#2D1B00]/20 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2Icon />
          <h2 className="text-[#2D1B00]">My Hives</h2>
        </div>
        <Button className="bg-[rgba(245,230,211,0.6)] backdrop-blur-sm hover:bg-[rgba(245,230,211,0.8)] text-[#2D1B00] border border-[#2D1B00]/20 gap-2">
          <Plus className="w-4 h-4" />
          Create Hive
        </Button>
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
