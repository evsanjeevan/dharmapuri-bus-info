import React from "react";

const BusResultCard = ({
    start,
    dest,
    bus,
    time,
    arrivalTime,
    km,
    duration,
    basePrice,
    isDark,
    isMinimal,
}) => {

    /* =========================================================
       STRAIGHT ROUTE CONNECTOR
       Dot → line → bus icon → line → arrow → dot
    ========================================================= */

    const StraightRoute = () => (
        <div className="flex w-full flex-col items-center justify-center">

            {/* Duration */}
            <span
                className={`
                    mb-2
                    text-[9px]
                    font-semibold
                    whitespace-nowrap
                    ${
                        isDark
                            ? "text-gray-500"
                            : "text-[#9997A8]"
                    }
                `}
            >
                {duration || "0m"}
            </span>

            {/* Route */}
            <div className="flex w-full items-center">

                {/* Start dot */}
                <span
                    className="
                        h-2
                        w-2
                        shrink-0
                        rounded-full
                        bg-[#6D5CE7]
                    "
                />

                {/* Left line */}
                <span
                    className={`
                        mx-1.5
                        h-px
                        flex-1
                        ${
                            isDark
                                ? "bg-gray-700"
                                : "bg-[#DCD9E7]"
                        }
                    `}
                />

                {/* BUS ICON */}
                <span
                    className={`
                        flex
                        h-7
                        w-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        ${
                            isDark
                                ? "bg-[#302A5F] text-[#BDB6FF]"
                                : "bg-[#F1EFFC] text-[#6D5CE7]"
                        }
                    `}
                >
                    <i className="bi bi-bus-front text-[12px]" />
                </span>

                {/* Right line */}
                <span
                    className={`
                        mx-1.5
                        h-px
                        flex-1
                        ${
                            isDark
                                ? "bg-gray-700"
                                : "bg-[#DCD9E7]"
                        }
                    `}
                />

                {/* Forward arrow */}
                <span
                    className="
                        flex
                        h-6
                        w-6
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        text-[#6D5CE7]
                    "
                >
                    <i className="bi bi-arrow-right text-sm" />
                </span>

                {/* Small gap */}
                <span
                    className={`
                        mx-1.5
                        h-px
                        flex-1
                        ${
                            isDark
                                ? "bg-gray-700"
                                : "bg-[#DCD9E7]"
                        }
                    `}
                />

                {/* End dot */}
                <span
                    className={`
                        h-2
                        w-2
                        shrink-0
                        rounded-full
                        ${
                            isDark
                                ? "bg-gray-600"
                                : "bg-[#AAA7B4]"
                        }
                    `}
                />

            </div>
        </div>
    );


    /* =========================================================
       MINIMAL / EXPLORE CARD
    ========================================================= */

    if (isMinimal) {
        return (
            <div
                className={`
                    group
                    relative
                    w-full
                    overflow-hidden
                    rounded-[20px]
                    border
                    px-4
                    py-4
                    sm:px-5
                    sm:py-5
                    transition-all
                    duration-300
                    ${
                        isDark
                            ? `
                                border-gray-800
                                bg-gray-950
                                text-gray-100
                                hover:border-gray-700
                                hover:shadow-[0_12px_30px_rgba(0,0,0,0.22)]
                            `
                            : `
                                border-[#EAE9F1]
                                bg-white
                                text-[#17162A]
                                shadow-[0_4px_16px_rgba(24,20,60,0.035)]
                                hover:border-[#DDD8F4]
                                hover:shadow-[0_14px_32px_rgba(54,42,120,0.08)]
                            `
                    }
                `}
            >

                {/* Background decoration */}
                <div
                    className={`
                        pointer-events-none
                        absolute
                        -right-8
                        -top-8
                        h-20
                        w-20
                        rounded-full
                        ${
                            isDark
                                ? "bg-[#6D5CE7]/[0.06]"
                                : "bg-[#6D5CE7]/[0.045]"
                        }
                    `}
                />

                {/* Bottom accent */}
                <div
                    className="
                        pointer-events-none
                        absolute
                        bottom-0
                        left-0
                        h-[2px]
                        w-0
                        bg-[#6D5CE7]
                        transition-all
                        duration-300
                        group-hover:w-full
                    "
                />


                {/* =====================================================
                    TOP ROW
                ===================================================== */}

                <div
                    className="
                        relative
                        z-10
                        flex
                        items-start
                        justify-between
                        gap-3
                        pr-10
                    "
                >

                    {/* LEFT */}
                    <div className="min-w-0">

                        {/* Bus number */}
                        <span
                            className={`
                                inline-flex
                                items-center
                                rounded-lg
                                px-2.5
                                py-1
                                text-[10px]
                                font-extrabold
                                tracking-wide
                                ${
                                    isDark
                                        ? "bg-[#302A5F] text-[#BEB8FF]"
                                        : "bg-[#F1EFFC] text-[#6D5CE7]"
                                }
                            `}
                        >
                            {bus || "---"}
                        </span>

                        {/* Route name */}
                        <div
                            className={`
                                mt-2
                                flex
                                min-w-0
                                items-center
                                gap-2
                                text-[13px]
                                font-extrabold
                                tracking-tight
                                ${
                                    isDark
                                        ? "text-white"
                                        : "text-[#17162A]"
                                }
                            `}
                        >
                            <span className="truncate">
                                {start || "Origin"}
                            </span>

                            <span className="shrink-0 text-[#6D5CE7]">
                                →
                            </span>

                            <span className="truncate">
                                {dest || "Destination"}
                            </span>
                        </div>

                    </div>


                    {/* RIGHT INFO */}
                    <div className="shrink-0 text-right">

                        <span
                            className={`
                                block
                                text-base
                                font-bold
                                ${
                                    isDark
                                        ? "text-white"
                                        : "text-[#17162A]"
                                }
                            `}
                        >
                            ₹{basePrice ?? 0}
                        </span>

                        <span
                            className={`
                                mt-1
                                flex
                                items-center
                                justify-end
                                gap-1
                                text-[10px]
                                font-medium
                                ${
                                    isDark
                                        ? "text-gray-500"
                                        : "text-[#9997A8]"
                                }
                            `}
                        >
                            <i className="bi bi-signpost-2 text-[#6D5CE7]" />
                            {km || "0 km"}
                        </span>

                    </div>

                </div>


                {/* =====================================================
                    DIVIDER
                ===================================================== */}

                <div
                    className={`
                        relative
                        z-10
                        my-4
                        h-px
                        ${
                            isDark
                                ? "bg-gray-800"
                                : "bg-[#F0EEF5]"
                        }
                    `}
                />


                {/* =====================================================
                    ROUTE DETAILS
                ===================================================== */}

                <div
                    className="
                        relative
                        z-10
                        grid
                        grid-cols-[1fr_130px_1fr]
                        items-center
                        gap-3
                    "
                >

                    {/* FROM */}
                    <div className="min-w-0">

                        <span
                            className={`
                                block
                                text-[9px]
                                font-bold
                                uppercase
                                tracking-[0.08em]
                                ${
                                    isDark
                                        ? "text-gray-500"
                                        : "text-[#9997A8]"
                                }
                            `}
                        >
                            From
                        </span>

                        <span
                            className={`
                                mt-1
                                block
                                truncate
                                text-sm
                                font-extrabold
                                ${
                                    isDark
                                        ? "text-gray-200"
                                        : "text-[#17162A]"
                                }
                            `}
                        >
                            {start || "Origin"}
                        </span>

                        <span
                            className="
                                mt-1
                                inline-block
                                text-xs
                                font-bold
                                text-[#6D5CE7]
                            "
                        >
                            {time || "--:--"}
                        </span>

                    </div>


                    {/* CENTER ROUTE */}
                    <StraightRoute />


                    {/* TO */}
                    <div className="min-w-0 text-right">

                        <span
                            className={`
                                block
                                text-[9px]
                                font-bold
                                uppercase
                                tracking-[0.08em]
                                ${
                                    isDark
                                        ? "text-gray-500"
                                        : "text-[#9997A8]"
                                }
                            `}
                        >
                            To
                        </span>

                        <span
                            className={`
                                mt-1
                                block
                                truncate
                                text-sm
                                font-extrabold
                                ${
                                    isDark
                                        ? "text-gray-200"
                                        : "text-[#17162A]"
                                }
                            `}
                        >
                            {dest || "Destination"}
                        </span>

                        <span
                            className="
                                mt-1
                                inline-block
                                text-xs
                                font-bold
                                text-emerald-600
                            "
                        >
                            {arrivalTime || "--:--"}
                        </span>

                    </div>

                </div>

            </div>
        );
    }


    /* =========================================================
       FULL CARD
    ========================================================= */

    return (
        <div
            className={`
                group
                relative
                w-full
                overflow-hidden
                rounded-[22px]
                border
                p-5
                transition-all
                duration-300
                ${
                    isDark
                        ? `
                            border-gray-800
                            bg-gray-950
                            text-gray-100
                            hover:border-gray-700
                            hover:shadow-[0_16px_36px_rgba(0,0,0,0.24)]
                        `
                        : `
                            border-[#EAE9F1]
                            bg-white
                            text-[#17162A]
                            hover:border-[#DDD8F4]
                            hover:shadow-[0_16px_36px_rgba(54,42,120,0.09)]
                        `
                }
            `}
        >

            {/* Background decoration */}
            <div
                className={`
                    pointer-events-none
                    absolute
                    -right-10
                    -top-10
                    h-28
                    w-28
                    rounded-full
                    ${
                        isDark
                            ? "bg-[#6D5CE7]/[0.07]"
                            : "bg-[#6D5CE7]/[0.05]"
                    }
                `}
            />


            {/* Accent */}
            <div
                className="
                    pointer-events-none
                    absolute
                    bottom-0
                    left-0
                    h-[2px]
                    w-0
                    bg-[#6D5CE7]
                    transition-all
                    duration-300
                    group-hover:w-full
                "
            />


            {/* =====================================================
                HEADER
            ===================================================== */}

            <div
                className="
                    relative
                    z-10
                    flex
                    items-center
                    justify-between
                    gap-4
                "
            >

                <div className="flex min-w-0 items-center gap-3">

                    <div
                        className={`
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            ${
                                isDark
                                    ? "bg-[#302A5F] text-[#BEB8FF]"
                                    : "bg-[#F1EFFC] text-[#6D5CE7]"
                            }
                        `}
                    >
                        <i className="bi bi-bus-front text-lg" />
                    </div>

                    <div className="min-w-0">

                        <span
                            className={`
                                block
                                text-[9px]
                                font-bold
                                uppercase
                                tracking-[0.08em]
                                ${
                                    isDark
                                        ? "text-gray-500"
                                        : "text-[#9997A8]"
                                }
                            `}
                        >
                            Bus Number
                        </span>

                        <h3
                            className={`
                                mt-0.5
                                truncate
                                text-base
                                font-extrabold
                                ${
                                    isDark
                                        ? "text-white"
                                        : "text-[#17162A]"
                                }
                            `}
                        >
                            {bus || "---"}
                        </h3>

                    </div>

                </div>


                {/* Fare */}
                <div className="shrink-0 text-right">

                    <span
                        className={`
                            block
                            text-lg
                            font-bold
                            ${
                                isDark
                                    ? "text-white"
                                    : "text-[#17162A]"
                            }
                        `}
                    >
                        ₹{basePrice ?? 0}
                    </span>

                    <span
                        className={`
                            mt-1
                            flex
                            items-center
                            justify-end
                            gap-1
                            text-[10px]
                            ${
                                isDark
                                    ? "text-gray-500"
                                    : "text-[#9997A8]"
                            }
                        `}
                    >
                        <i className="bi bi-signpost-2 text-[#6D5CE7]" />
                        {km || "0 km"}
                    </span>

                </div>

            </div>


            {/* Divider */}
            <div
                className={`
                    relative
                    z-10
                    my-5
                    h-px
                    ${
                        isDark
                            ? "bg-gray-800"
                            : "bg-[#F0EEF5]"
                    }
                `}
            />


            {/* =====================================================
                ROUTE
            ===================================================== */}

            <div
                className="
                    relative
                    z-10
                    grid
                    grid-cols-[1fr_150px_1fr]
                    items-center
                    gap-3
                "
            >

                {/* FROM */}
                <div className="min-w-0">

                    <span
                        className={`
                            block
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-[0.08em]
                            ${
                                isDark
                                    ? "text-gray-500"
                                    : "text-[#9997A8]"
                            }
                        `}
                    >
                        From
                    </span>

                    <h4
                        className={`
                            mt-1
                            truncate
                            text-sm
                            font-extrabold
                            ${
                                isDark
                                    ? "text-gray-200"
                                    : "text-[#17162A]"
                            }
                        `}
                    >
                        {start || "Origin"}
                    </h4>

                    <span
                        className="
                            mt-1
                            inline-block
                            text-xs
                            font-bold
                            text-[#6D5CE7]
                        "
                    >
                        {time || "--:--"}
                    </span>

                </div>


                {/* CENTER */}
                <StraightRoute />


                {/* TO */}
                <div className="min-w-0 text-right">

                    <span
                        className={`
                            block
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-[0.08em]
                            ${
                                isDark
                                    ? "text-gray-500"
                                    : "text-[#9997A8]"
                            }
                        `}
                    >
                        To
                    </span>

                    <h4
                        className={`
                            mt-1
                            truncate
                            text-sm
                            font-extrabold
                            ${
                                isDark
                                    ? "text-gray-200"
                                    : "text-[#17162A]"
                            }
                        `}
                    >
                        {dest || "Destination"}
                    </h4>

                    <span
                        className="
                            mt-1
                            inline-block
                            text-xs
                            font-bold
                            text-emerald-600
                        "
                    >
                        {arrivalTime || "--:--"}
                    </span>

                </div>

            </div>

        </div>
    );
};

export default BusResultCard;