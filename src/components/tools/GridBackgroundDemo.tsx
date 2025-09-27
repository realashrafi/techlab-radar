
import React from "react";
import {cn} from "../lib/utils";

export function GridBackgroundDemo({children}:any) {
    return (
        <div className="relative h-full w-full items-center justify-center bg-white ">
            <div
                className={cn(
                    "absolute inset-0",
                    "[background-size:20px_20px]",
                    "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",

                )}
            />
            {/* Radial gradient for the container to give a faded look */}
            <div className="pointer-events-none bg-black absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] "></div>
            {children}
        </div>
    );
}
