import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
// import dbConnect from "@/lib/dbConnect";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))

}

