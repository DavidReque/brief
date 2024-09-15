import React from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

type Props = {};

const ScanButton = (props: Props) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/dashboard/scann"
            className="fixed bottom-12 right-4 lg:right-8 xl:right-12 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200"
          >
            <Plus className="h-6 w-6" />
          </Link>
        </TooltipTrigger>
        <TooltipContent>Escanear documento</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ScanButton;
