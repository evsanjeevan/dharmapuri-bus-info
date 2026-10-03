import React from "react";

const BusStoppingCard = ({ stops, isDark }) => {
    if (!stops || stops.length === 0) {
        return (
            <div
                className={`
                    rounded-xl
                    border
                    px-4
                    py-5
                    text-center
                    ${
                        isDark
                            ? "border-gray-800 bg-gray-900/60 text-gray-500"
                            : "border-gray-100 bg-white text-gray-400"
                    }
                `}
            >
                <i className="bi bi-geo-alt text-lg text-brand" />

                <p className="mt-2 text-xs font-semibold">
                    No stopping information available.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full">

            {/* HEADER */}
            <div
                className={`
                    mb-4
                    flex
                    items-center
                    justify-between
                    gap-3
                `}
            >
                <h3
                    className={`
                        flex
                        items-center
                        gap-2
                        text-xs
                        font-extrabold
                        uppercase
                        tracking-wider
                        ${
                            isDark
                                ? "text-gray-200"
                                : "text-custom-dark"
                        }
                    `}
                >
                    <i className="bi bi-geo-alt-fill text-brand" />
                    Route Stoppings & Fares
                </h3>

                <span
                    className={`
                        shrink-0
                        rounded-full
                        px-2.5
                        py-1
                        text-[9px]
                        font-bold
                        ${
                            isDark
                                ? "bg-gray-800 text-gray-400"
                                : "bg-gray-100 text-gray-500"
                        }
                    `}
                >
                    {stops.length} stops
                </span>
            </div>


            {/* STOPS TIMELINE */}
            <div
                className={`
                    relative
                    ml-3.5
                    border-l-2
                    space-y-5
                    pb-1
                    ${
                        isDark
                            ? "border-gray-800"
                            : "border-gray-100"
                    }
                `}
            >

                {stops.map((stop, index) => (
                    <div
                        key={`${stop?.name || "stop"}-${index}`}
                        className="
                            relative
                            pl-7
                            flex
                            items-center
                            justify-between
                            gap-4
                        "
                    >

                        {/* DOT */}
                        <span
                            className={`
                                absolute
                                -left-[10px]
                                top-1/2
                                flex
                                h-4
                                w-4
                                -translate-y-1/2
                                items-center
                                justify-center
                                rounded-full
                                border-2
                                text-[9px]
                                ${
                                    isDark
                                        ? "border-gray-700 bg-gray-900"
                                        : "border-gray-300 bg-white"
                                }
                            `}
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                        </span>


                        {/* STOP NAME + TIME */}
                        <div className="flex min-w-0 flex-col">

                            <span
                                className={`
                                    truncate
                                    text-xs
                                    font-bold
                                    ${
                                        isDark
                                            ? "text-gray-300"
                                            : "text-custom-dark"
                                    }
                                `}
                            >
                                {stop?.name || "Unknown Stop"}
                            </span>

                            <span className="mt-0.5 text-[10px] font-medium text-gray-400">
                                <i className="bi bi-clock mr-0.5" />
                                {stop?.time || "N/A"}
                            </span>

                        </div>


                        {/* PRICE */}
                        <div
                            className={`
                                shrink-0
                                rounded-lg
                                border
                                px-2.5
                                py-1
                                text-[11px]
                                font-extrabold
                                ${
                                    isDark
                                        ? "border-gray-800 bg-gray-900 text-gray-400"
                                        : "border-gray-200 bg-gray-50 text-custom-gray"
                                }
                            `}
                        >
                            {stop?.price === 0
                                ? "Start"
                                : `₹${stop?.price ?? 0}`}
                        </div>

                    </div>
                ))}

            </div>

        </div>
    );
};

export default BusStoppingCard;