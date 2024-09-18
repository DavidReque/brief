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
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            <span>Nuevo documento</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent>Nuevo documento</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ScanButton;
