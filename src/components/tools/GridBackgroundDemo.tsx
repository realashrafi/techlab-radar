import React from "react";
import { cn } from "../lib/utils";

export function GridBackgroundDemo({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative h-full w-full ">
            <div
                className={cn(
                    "absolute inset-0 z-[-2]",
                    "[background-size:20px_20px]",
                    "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]"
                )}
            />
            <div
                className="pointer-events-none absolute inset-0 z-[-1] flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
            ></div>
            <div className="relative z-0">{children}</div>
        </div>
    );
}