import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useReducer,
    useMemo
} from "react";

import { auth } from "./firebase.jsx";

import {
    onAuthStateChanged
} from "firebase/auth";

import {
    getFunctions,
    httpsCallable
} from "firebase/functions";


// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const CONFIG = {
    ROUTE_REGEX: /^[A-Z0-9]{1,5}$/,

    MAX_STOPS: 40,

    MIN_DISTANCE_KM: 0,
    MAX_DISTANCE_KM: 2000,

    MIN_PRICE: 0,
    MAX_PRICE: 1000
};


// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const createStopId = () => {
    if (
        typeof crypto !== "undefined" &&
        crypto.randomUUID
    ) {
        return `stop_${crypto.randomUUID()}`;
    }

    return `stop_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;
};


const generateStopObject = () => ({
    id: createStopId(),
    name: "",
    time: "",
    distance: "",
    price: ""
});


const sanitizeText = (
    value,
    maxLen = 60
) => {
    if (typeof value !== "string") {
        return "";
    }

    return value
        .replace(/[<>"'`\\;=(){}[\]|]/g, "")
        .replace(/\s+/g, " ")
        .trimStart()
        .slice(0, maxLen);
};


const sanitizeRouteNumber = (value) => {
    if (typeof value !== "string") {
        return "";
    }

    return value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 5);
};


const parseSafeNumber = (
    value,
    min,
    max
) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    const stringValue = String(value).trim();

    if (/e/i.test(stringValue)) {
        return null;
    }

    if (
        stringValue.includes("Infinity")
    ) {
        return null;
    }

    const numberValue = Number(stringValue);

    if (
        Number.isNaN(numberValue) ||
        !Number.isFinite(numberValue) ||
        numberValue < min ||
        numberValue > max
    ) {
        return null;
    }

    return Math.round(
        numberValue * 100
    ) / 100;
};


const timeToMinutes = (time) => {
    if (
        !time ||
        !time.includes(":")
    ) {
        return 0;
    }

    const [
        hours,
        minutes
    ] = time
        .split(":")
        .map(Number);

    if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes)
    ) {
        return 0;
    }

    if (
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
    ) {
        return 0;
    }

    return (
        hours * 60 +
        minutes
    );
};


/*
 * Convert a clock time into the current trip timeline.
 *
 * Example:
 * Departure = 23:00
 * Stop      = 00:30
 *
 * 00:30 becomes 1470 minutes instead of 30.
 */
const getEffectiveTime = (
    time,
    referenceMinutes
) => {
    const minutes = timeToMinutes(time);

    if (
        minutes <
        (referenceMinutes % 1440)
    ) {
        return minutes + 1440;
    }

    return minutes;
};


const detectTimeSlot = (
    departureTime
) => {
    if (!departureTime) {
        return "Morning";
    }

    const minutes =
        timeToMinutes(
            departureTime
        );

    if (
        minutes >= 300 &&
        minutes < 720
    ) {
        return "Morning";
    }

    if (
        minutes >= 720 &&
        minutes < 960
    ) {
        return "Afternoon";
    }

    if (
        minutes >= 960 &&
        minutes < 1260
    ) {
        return "Evening";
    }

    return "Night";
};


const format12Hour = (time) => {
    if (!time) {
        return "--:--";
    }

    const [
        hoursString,
        minutes
    ] = time.split(":");

    const hours =
        Number(hoursString);

    if (
        Number.isNaN(hours)
    ) {
        return "--:--";
    }

    const suffix =
        hours >= 12
            ? "PM"
            : "AM";

    const displayHour =
        hours % 12 || 12;

    return `${displayHour}:${minutes} ${suffix}`;
};


/*
 * Fixed route duration calculation.
 *
 * Earlier:
 * 08:00 → 07:00
 * was handled inconsistently.
 *
 * Now:
 * 08:00 → 07:00 = overnight route
 * 08:00 → 08:00 = invalid / 0 duration
 */
const calculateDurationMinutes = (
    departureTime,
    arrivalTime
) => {
    if (
        !departureTime ||
        !arrivalTime
    ) {
        return 0;
    }

    const departure =
        timeToMinutes(
            departureTime
        );

    const arrivalBase =
        timeToMinutes(
            arrivalTime
        );

    if (
        arrivalBase === departure
    ) {
        return 0;
    }

    const arrival =
        arrivalBase < departure
            ? arrivalBase + 1440
            : arrivalBase;

    return arrival - departure;
};


const formatDuration = (
    minutes
) => {
    if (
        !minutes ||
        minutes <= 0
    ) {
        return "--";
    }

    const hours =
        Math.floor(
            minutes / 60
        );

    const mins =
        minutes % 60;

    if (hours === 0) {
        return `${mins} min`;
    }

    if (mins === 0) {
        return `${hours} hr${hours > 1 ? "s" : ""}`;
    }

    return `${hours} hr${hours > 1 ? "s" : ""} ${mins} min`;
};


const createRateLimiter = (
    maxSubmits = 3,
    windowMs = 60 * 1000
) => {
    let count = 0;

    let windowStart =
        Date.now();

    return {
        check() {
            const now =
                Date.now();

            if (
                now - windowStart >
                windowMs
            ) {
                count = 0;
                windowStart = now;
            }

            if (
                count >= maxSubmits
            ) {
                const waitSec =
                    Math.ceil(
                        (
                            windowMs -
                            (
                                now -
                                windowStart
                            )
                        ) / 1000
                    );

                return {
                    allowed: false,
                    waitSec
                };
            }

            count++;

            return {
                allowed: true
            };
        }
    };
};


// ─────────────────────────────────────────────────────────────────────────────
// REDUCER
// ─────────────────────────────────────────────────────────────────────────────

const initialFormState = {
    busNumber: "",
    busType: "Private",

    departureTime: "08:00",
    startPoint: "Dharmapuri",

    destination: "",
    arrivalTime: "08:45",

    stops: [
        generateStopObject()
    ]
};


function formReducer(
    state,
    action
) {
    switch (action.type) {

        case "SET_FIELD":
            return {
                ...state,
                [action.field]:
                    action.value
            };


        case "ADD_STOP":
            if (
                state.stops.length >=
                CONFIG.MAX_STOPS
            ) {
                return state;
            }

            return {
                ...state,
                stops: [
                    ...state.stops,
                    generateStopObject()
                ]
            };


        case "REMOVE_STOP":
            return {
                ...state,
                stops:
                    state.stops.filter(
                        (stop) =>
                            stop.id !==
                            action.id
                    )
            };


        case "UPDATE_STOP":
            return {
                ...state,

                stops:
                    state.stops.map(
                        (stop) =>
                            stop.id ===
                            action.id
                                ? {
                                    ...stop,
                                    [action.field]:
                                        action.value
                                }
                                : stop
                    )
            };


        case "RESET_FORM":
            return {
                ...initialFormState,

                stops: [
                    generateStopObject()
                ]
            };


        default:
            return state;
    }
}


// ─────────────────────────────────────────────────────────────────────────────
// SMALL UI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const SectionTitle = ({
    number,
    title,
    isDark,
    count,
    action
}) => (
    <div
        className={`
            dpi-upload-section-head
            ${isDark
                ? "dpi-upload-dark-border"
                : ""
            }
        `}
    >

        <div className="dpi-upload-section-title-wrap">

            <span
                className={`
                    dpi-upload-section-number
                    ${
                        isDark
                            ? "dpi-upload-section-number-dark"
                            : ""
                    }
                `}
            >
                {number}
            </span>

            <h2
                className={
                    isDark
                        ? "dpi-upload-dark-heading"
                        : ""
                }
            >
                {title}
            </h2>

            {count !== undefined && (
                <span className="dpi-upload-count-badge">
                    {count} / {CONFIG.MAX_STOPS}
                </span>
            )}

        </div>

        {action}

    </div>
);


/*
 * Fixed-height validation slot.
 *
 * This prevents the time/input rows from moving vertically
 * when one field suddenly gets an error message.
 */
const FieldError = ({
    children
}) => {
    const hasError =
        Boolean(children);

    return (
        <p
            className={`
                dpi-upload-field-error
                ${
                    hasError
                        ? ""
                        : "dpi-upload-field-error-empty"
                }
            `}
            role={
                hasError
                    ? "alert"
                    : undefined
            }
        >
            {hasError ? (
                <>
                    <i className="bi bi-exclamation-circle-fill" />
                    {children}
                </>
            ) : (
                "\u00A0"
            )}
        </p>
    );
};


// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const UploadPage = ({
    isDark = false
}) => {

    const [user, setUser] =
        useState(null);

    const [
        isAuthLoading,
        setIsAuthLoading
    ] = useState(true);


    const [state, dispatch] =
        useReducer(
            formReducer,
            initialFormState
        );


    const [
        isLoading,
        setIsLoading
    ] = useState(false);


    const [toast, setToast] =
        useState({
            msg: "",
            type: "info"
        });


    const [
        fieldErrors,
        setFieldErrors
    ] = useState({});


    const toastTimerRef =
        useRef(null);


    const rateLimiterRef =
        useRef(
            createRateLimiter()
        );


    // ─────────────────────────────────────────────────────────────────────────
    // AUTH
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        const unsubscribe =
            onAuthStateChanged(
                auth,
                (currentUser) => {
                    setUser(
                        currentUser
                    );

                    setIsAuthLoading(
                        false
                    );
                }
            );

        return () =>
            unsubscribe();
    }, []);


    // ─────────────────────────────────────────────────────────────────────────
    // TOAST
    // ─────────────────────────────────────────────────────────────────────────

    const triggerToast =
        useCallback(
            (
                msg,
                type = "info"
            ) => {

                if (
                    toastTimerRef.current
                ) {
                    clearTimeout(
                        toastTimerRef.current
                    );
                }

                setToast({
                    msg,
                    type
                });

                toastTimerRef.current =
                    setTimeout(() => {

                        setToast({
                            msg: "",
                            type: "info"
                        });

                        toastTimerRef.current =
                            null;

                    }, 5000);
            },
            []
        );


    const closeToast =
        useCallback(() => {

            if (
                toastTimerRef.current
            ) {
                clearTimeout(
                    toastTimerRef.current
                );

                toastTimerRef.current =
                    null;
            }

            setToast({
                msg: "",
                type: "info"
            });

        }, []);


    useEffect(() => {
        return () => {

            if (
                toastTimerRef.current
            ) {
                clearTimeout(
                    toastTimerRef.current
                );
            }

        };
    }, []);


    // ─────────────────────────────────────────────────────────────────────────
    // AUTO TIME SLOT
    // ─────────────────────────────────────────────────────────────────────────

    const detectedTimeSlot =
        useMemo(() => {
            return detectTimeSlot(
                state.departureTime
            );
        }, [
            state.departureTime
        ]);


    // ─────────────────────────────────────────────────────────────────────────
    // PREVIEW CALCULATIONS
    // ─────────────────────────────────────────────────────────────────────────

    const routeDuration =
        useMemo(() => {
            return calculateDurationMinutes(
                state.departureTime,
                state.arrivalTime
            );
        }, [
            state.departureTime,
            state.arrivalTime
        ]);


    const totalDistance =
        useMemo(() => {

            const validDistances =
                state.stops
                    .map(
                        (stop) =>
                            parseSafeNumber(
                                stop.distance,
                                CONFIG.MIN_DISTANCE_KM,
                                CONFIG.MAX_DISTANCE_KM
                            )
                    )
                    .filter(
                        (value) =>
                            value !== null
                    );

            if (
                !validDistances.length
            ) {
                return null;
            }

            return Math.max(
                ...validDistances
            );

        }, [
            state.stops
        ]);


    const finalStopFare =
        useMemo(() => {

            const fares =
                state.stops
                    .map(
                        (stop) =>
                            parseSafeNumber(
                                stop.price,
                                CONFIG.MIN_PRICE,
                                CONFIG.MAX_PRICE
                            )
                    )
                    .filter(
                        (value) =>
                            value !== null
                    );

            if (!fares.length) {
                return null;
            }

            return Math.max(
                ...fares
            );

        }, [
            state.stops
        ]);


    const averageSpeed =
        useMemo(() => {

            if (
                totalDistance === null ||
                routeDuration <= 0
            ) {
                return null;
            }

            const hours =
                routeDuration / 60;

            return (
                totalDistance /
                hours
            ).toFixed(1);

        }, [
            totalDistance,
            routeDuration
        ]);


    // ─────────────────────────────────────────────────────────────────────────
    // VALIDATION
    // ─────────────────────────────────────────────────────────────────────────

    const validateForm =
        useCallback(() => {

            const errors = {};


            const cleanBus =
                sanitizeRouteNumber(
                    state.busNumber
                );


            const cleanStart =
                sanitizeText(
                    state.startPoint,
                    60
                );


            const cleanDest =
                sanitizeText(
                    state.destination,
                    60
                );


            // Bus number
            if (!cleanBus) {

                errors.busNumber =
                    "Bus number is required.";

            } else if (
                !CONFIG.ROUTE_REGEX.test(
                    cleanBus
                )
            ) {

                errors.busNumber =
                    "Use 1–5 letters or numbers, for example 12B or M70.";

            }


            // Start
            if (!cleanStart) {

                errors.startPoint =
                    "Starting place is required.";

            }


            // Destination
            if (!cleanDest) {

                errors.destination =
                    "Ending place is required.";

            }


            // Same route
            if (
                cleanStart &&
                cleanDest &&
                cleanStart.toLowerCase() ===
                    cleanDest.toLowerCase()
            ) {

                errors.destination =
                    "Starting and ending places cannot be identical.";

            }


            // ─────────────────────────────────────────
            // ROUTE TIME VALIDATION
            // ─────────────────────────────────────────

            const departureMinutes =
                state.departureTime
                    ? timeToMinutes(
                        state.departureTime
                    )
                    : null;


            const arrivalBaseMinutes =
                state.arrivalTime
                    ? timeToMinutes(
                        state.arrivalTime
                    )
                    : null;


            if (!state.departureTime) {

                errors.departureTime =
                    "Starting time is required.";

            }


            if (!state.arrivalTime) {

                errors.arrivalTime =
                    "Ending time is required.";

            }


            let effectiveArrivalMinutes =
                null;


            if (
                departureMinutes !== null &&
                arrivalBaseMinutes !== null
            ) {

                // Exact same clock time is not a valid route.
                if (
                    arrivalBaseMinutes ===
                    departureMinutes
                ) {

                    errors.arrivalTime =
                        "Ending time must be different from the starting time.";

                } else {

                    effectiveArrivalMinutes =
                        arrivalBaseMinutes <
                        departureMinutes
                            ? arrivalBaseMinutes +
                              1440
                            : arrivalBaseMinutes;

                    const duration =
                        effectiveArrivalMinutes -
                        departureMinutes;

                    if (
                        duration <= 0
                    ) {

                        errors.arrivalTime =
                            "Ending time must be after the starting time.";

                    }

                }

            }


            // ─────────────────────────────────────────
            // STOP VALIDATION
            // ─────────────────────────────────────────

            if (
                !state.stops.length
            ) {

                errors.stops =
                    "Add at least one bus stop.";

            } else {

                const stopSet =
                    new Set();


                const routeStart =
                    cleanStart.toLowerCase();


                const routeDestination =
                    cleanDest.toLowerCase();


                let previousTime =
                    departureMinutes ?? 0;


                let previousDistance =
                    -1;


                for (
                    let index = 0;
                    index < state.stops.length;
                    index++
                ) {

                    const stop =
                        state.stops[index];


                    const stopName =
                        sanitizeText(
                            stop.name,
                            40
                        );


                    const stopNameLower =
                        stopName.toLowerCase();


                    const stopDistance =
                        parseSafeNumber(
                            stop.distance,
                            CONFIG.MIN_DISTANCE_KM,
                            CONFIG.MAX_DISTANCE_KM
                        );


                    const stopPrice =
                        parseSafeNumber(
                            stop.price,
                            CONFIG.MIN_PRICE,
                            CONFIG.MAX_PRICE
                        );


                    if (!stopName) {

                        errors.stops =
                            `Stop ${index + 1}: place name is required.`;

                        break;
                    }


                    if (!stop.time) {

                        errors.stops =
                            `Stop ${index + 1}: reaching time is required.`;

                        break;
                    }


                    if (
                        stopDistance === null
                    ) {

                        errors.stops =
                            `Stop ${index + 1}: enter a valid kilometre value.`;

                        break;
                    }


                    if (
                        stopPrice === null
                    ) {

                        errors.stops =
                            `Stop ${index + 1}: enter a valid fare.`;

                        break;
                    }


                    if (
                        stopSet.has(
                            stopNameLower
                        )
                    ) {

                        errors.stops =
                            `Duplicate stop "${stopName}" found.`;

                        break;
                    }


                    if (
                        stopNameLower ===
                            routeStart ||
                        stopNameLower ===
                            routeDestination
                    ) {

                        errors.stops =
                            `Stop "${stopName}" cannot be the route start or destination.`;

                        break;
                    }


                    if (
                        stopDistance <
                        previousDistance
                    ) {

                        errors.stops =
                            `Stop ${index + 1}: distance must not decrease from the previous stop.`;

                        break;
                    }


                    const effectiveStopTime =
                        getEffectiveTime(
                            stop.time,
                            departureMinutes ??
                                0
                        );


                    if (
                        effectiveStopTime <=
                        previousTime
                    ) {

                        errors.stops =
                            `Stop ${index + 1}: reaching time must be after the departure and previous stop.`;

                        break;
                    }


                    if (
                        effectiveArrivalMinutes !==
                            null &&
                        effectiveStopTime >=
                            effectiveArrivalMinutes
                    ) {

                        errors.stops =
                            `Stop ${index + 1}: reaching time must be before the ending time.`;

                        break;
                    }


                    stopSet.add(
                        stopNameLower
                    );


                    previousTime =
                        effectiveStopTime;


                    previousDistance =
                        stopDistance;
                }
            }


            return errors;

        }, [
            state
        ]);


    // ─────────────────────────────────────────────────────────────────────────
    // INPUT CLASS
    // ─────────────────────────────────────────────────────────────────────────

    const inputClass = (
        field
    ) => {

        const hasError =
            Boolean(
                fieldErrors[field]
            );


        return `
            dpi-upload-input
            ${isDark
                ? "dpi-upload-input-dark"
                : ""
            }
            ${
                hasError
                    ? "dpi-upload-input-error"
                    : ""
            }
        `.trim();
    };


    // ─────────────────────────────────────────────────────────────────────────
    // SUBMIT
    // ─────────────────────────────────────────────────────────────────────────

    const handleFormSubmit =
        async (event) => {

            event.preventDefault();


            if (isLoading) {
                return;
            }


            if (!user) {

                triggerToast(
                    "Please sign in to upload routes.",
                    "error"
                );

                return;
            }


            const isPasswordProvider =
                user.providerData.some(
                    (provider) =>
                        provider.providerId ===
                        "password"
                );


            if (
                !user.emailVerified &&
                isPasswordProvider
            ) {

                triggerToast(
                    "Please verify your email address before uploading.",
                    "error"
                );

                return;
            }


            const rateLimit =
                rateLimiterRef
                    .current
                    .check();


            if (!rateLimit.allowed) {

                triggerToast(
                    `Rate limit reached. Wait ${rateLimit.waitSec}s.`,
                    "error"
                );

                return;
            }


            const errors =
                validateForm();


            if (
                Object.keys(errors)
                    .length > 0
            ) {

                setFieldErrors(
                    errors
                );

                triggerToast(
                    "Please fix the highlighted errors.",
                    "error"
                );

                return;
            }


            setFieldErrors({});

            setIsLoading(true);


            try {

                const cleanBus =
                    sanitizeRouteNumber(
                        state.busNumber
                    );


                const cleanStart =
                    sanitizeText(
                        state.startPoint,
                        60
                    );


                const cleanDest =
                    sanitizeText(
                        state.destination,
                        60
                    );


                const distanceKm =
                    state.stops.length > 0
                        ? Math.max(
                            ...state.stops.map(
                                (stop) =>
                                    parseSafeNumber(
                                        stop.distance,
                                        0,
                                        CONFIG.MAX_DISTANCE_KM
                                    ) ?? 0
                            )
                        )
                        : 0;


                const durationMins =
                    calculateDurationMinutes(
                        state.departureTime,
                        state.arrivalTime
                    );


                const finalPrice =
                    state.stops.length > 0
                        ? Math.max(
                            ...state.stops.map(
                                (stop) =>
                                    parseSafeNumber(
                                        stop.price,
                                        0,
                                        CONFIG.MAX_PRICE
                                    ) ?? 0
                            )
                        )
                        : 0;


                const payload = {

                    bus:
                        cleanBus,

                    start:
                        cleanStart,

                    dest:
                        cleanDest,

                    distanceKm,

                    durationMins,

                    type:
                        state.busType,

                    slot:
                        detectedTimeSlot,

                    time:
                        state.departureTime,

                    arrivalTime:
                        state.arrivalTime,

                    basePrice:
                        finalPrice,

                    stops:
                        state.stops.map(
                            (
                                stop,
                                index
                            ) => ({
                                sequence:
                                    index + 1,

                                name:
                                    sanitizeText(
                                        stop.name,
                                        40
                                    ),

                                time:
                                    stop.time,

                                distanceKm:
                                    parseSafeNumber(
                                        stop.distance,
                                        0,
                                        CONFIG.MAX_DISTANCE_KM
                                    ) ?? 0,

                                price:
                                    parseSafeNumber(
                                        stop.price,
                                        0,
                                        CONFIG.MAX_PRICE
                                    ) ?? 0
                            })
                        )
                };


                const functions =
                    getFunctions();


                const uploadTransitRoute =
                    httpsCallable(
                        functions,
                        "uploadTransitRoute"
                    );


                await uploadTransitRoute(
                    payload
                );


                triggerToast(
                    "Route submitted successfully for verification!",
                    "success"
                );


                dispatch({
                    type: "RESET_FORM"
                });


            } catch (error) {

                console.error(
                    "Upload Process Exception:",
                    error
                );


                triggerToast(
                    error?.message ||
                        "Submission failed. Please try again.",
                    "error"
                );


            } finally {

                setIsLoading(false);
            }
        };


    // ─────────────────────────────────────────────────────────────────────────
    // AUTH LOADING
    // ─────────────────────────────────────────────────────────────────────────

    if (isAuthLoading) {

        return (
            <div
                className={`
                    dpi-upload-page
                    ${
                        isDark
                            ? "dpi-upload-page-dark"
                            : ""
                    }
                `}
            >
                <div className="dpi-upload-center">

                    <div className="dpi-upload-spinner" />

                    <p className="dpi-upload-loading-text">
                        Loading Workspace...
                    </p>

                </div>
            </div>
        );
    }


    // ─────────────────────────────────────────────────────────────────────────
    // AUTH REQUIRED
    // ─────────────────────────────────────────────────────────────────────────

    if (!user) {

        return (
            <div
                className={`
                    dpi-upload-page
                    ${
                        isDark
                            ? "dpi-upload-page-dark"
                            : ""
                    }
                `}
            >

                <div className="dpi-upload-auth-card">

                    <div className="dpi-upload-auth-icon">

                        <i className="bi bi-lock-fill" />

                    </div>

                    <h2>
                        Authentication Required
                    </h2>

                    <p>
                        You need to be signed in
                        to add routes.
                    </p>

                </div>

            </div>
        );
    }


    // ─────────────────────────────────────────────────────────────────────────
    // EMAIL VERIFICATION
    // ─────────────────────────────────────────────────────────────────────────

    const isPasswordProvider =
        user.providerData.some(
            (provider) =>
                provider.providerId ===
                "password"
        );


    if (
        !user.emailVerified &&
        isPasswordProvider
    ) {

        return (
            <div
                className={`
                    dpi-upload-page
                    ${
                        isDark
                            ? "dpi-upload-page-dark"
                            : ""
                    }
                `}
            >

                <div className="dpi-upload-auth-card">

                    <div
                        className="
                            dpi-upload-auth-icon
                            dpi-upload-auth-warning
                        "
                    >
                        <i className="bi bi-envelope-exclamation-fill" />
                    </div>

                    <h2>
                        Verify Your Email
                    </h2>

                    <p>
                        Please verify your email
                        address to contribute route
                        information.
                    </p>

                </div>

            </div>
        );
    }


    // ─────────────────────────────────────────────────────────────────────────
    // MAIN PAGE
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div
            className={`
                dpi-upload-page
                ${
                    isDark
                        ? "dpi-upload-page-dark"
                        : ""
                }
            `}
        >

            <style>{`

                /* =============================================================
                   PAGE
                ============================================================= */

                .dpi-upload-page {
                    --dpi-primary: #6D5CE7;
                    --dpi-primary-dark: #5645D2;
                    --dpi-primary-light: #F1EFFC;

                    --dpi-text: #17162A;
                    --dpi-secondary: #5B5A6E;
                    --dpi-muted: #9997A8;

                    --dpi-bg: #FBFBFD;
                    --dpi-surface: #FFFFFF;
                    --dpi-border: #EAE9F1;

                    --dpi-danger: #D84A4A;
                    --dpi-success: #248A5B;

                    min-height: 100%;
                    width: 100%;

                    background:
                        var(--dpi-bg);

                    color:
                        var(--dpi-text);

                    padding:
                        28px
                        18px
                        100px;

                    font-family:
                        Inter,
                        system-ui,
                        -apple-system,
                        BlinkMacSystemFont,
                        "Segoe UI",
                        sans-serif;
                }


                .dpi-upload-page-dark {
                    --dpi-bg: #0D0C14;
                    --dpi-surface: #15141E;
                    --dpi-border: #292735;

                    --dpi-text: #F8F7FC;
                    --dpi-secondary: #C3C0D0;
                    --dpi-muted: #918EA1;
                }


                .dpi-upload-shell {
                    width: 100%;
                    max-width: 1040px;
                    margin: 0 auto;
                }


                /* =============================================================
                   HEADER
                ============================================================= */

                .dpi-upload-header {
                    margin-bottom: 22px;
                }


                .dpi-upload-kicker {
                    font-size: 11px;
                    font-weight: 900;
                    letter-spacing: .12em;
                    text-transform: uppercase;
                    color: var(--dpi-primary);
                    margin-bottom: 7px;
                }


                .dpi-upload-title {
                    margin: 0;
                    font-size: clamp(28px, 4vw, 42px);
                    line-height: 1.04;
                    letter-spacing: -.035em;
                    font-weight: 900;
                }


                .dpi-upload-description {
                    margin: 10px 0 0;
                    max-width: 690px;
                    color: var(--dpi-secondary);
                    font-size: 14px;
                    line-height: 1.65;
                    font-weight: 500;
                }


                .dpi-upload-note {
                    display: flex;
                    gap: 10px;
                    align-items: flex-start;

                    margin-top: 16px;

                    border: 1px solid var(--dpi-border);

                    background:
                        color-mix(
                            in srgb,
                            var(--dpi-primary-light) 72%,
                            var(--dpi-surface)
                        );

                    border-radius: 14px;
                    padding: 12px 14px;

                    font-size: 12px;
                    line-height: 1.55;
                    font-weight: 600;

                    color: var(--dpi-secondary);
                }


                .dpi-upload-note i {
                    color: var(--dpi-primary);
                    margin-top: 1px;
                }


                /* =============================================================
                   SINGLE OUTER FORM BORDER
                ============================================================= */

                .dpi-upload-form-shell {
                    width: 100%;

                    background:
                        var(--dpi-surface);

                    border:
                        1px solid var(--dpi-border);

                    border-radius:
                        20px;

                    overflow:
                        hidden;

                    box-shadow:
                        0 14px 42px
                        rgba(28, 22, 66, .06);
                }


                /*
                 * Inner sections no longer have their own outer border.
                 * This gives one clean outer line around the entire form.
                 */

                .dpi-upload-card {
                    background:
                        transparent;

                    border:
                        0;

                    border-radius:
                        0;

                    box-shadow:
                        none;

                    padding:
                        24px;

                    margin:
                        0;
                }


                .dpi-upload-form-shell
                .dpi-upload-card
                + .dpi-upload-card {
                    border-top:
                        1px solid var(--dpi-border);
                }


                /* =============================================================
                   SECTION HEADER
                ============================================================= */

                .dpi-upload-section-head {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    gap: 12px;

                    border-bottom:
                        1px solid var(--dpi-border);

                    padding-bottom:
                        13px;

                    margin-bottom:
                        18px;
                }


                .dpi-upload-dark-border {
                    border-color:
                        var(--dpi-border);
                }


                .dpi-upload-section-title-wrap {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;

                    gap: 9px;
                }


                .dpi-upload-section-number {
                    width: 28px;
                    height: 28px;

                    border-radius: 9px;

                    display: inline-flex;
                    align-items: center;
                    justify-content: center;

                    background:
                        var(--dpi-primary-light);

                    color:
                        var(--dpi-primary);

                    font-size: 11px;
                    font-weight: 900;

                    flex: 0 0 auto;
                }


                .dpi-upload-section-number-dark {
                    background:
                        rgba(109, 92, 231, .16);

                    color:
                        #BEB8FF;
                }


                .dpi-upload-section-title-wrap h2 {
                    margin: 0;

                    font-size: 12px;
                    line-height: 1.2;

                    text-transform: uppercase;
                    letter-spacing: .08em;

                    font-weight: 900;
                }


                .dpi-upload-dark-heading {
                    color:
                        var(--dpi-text);
                }


                .dpi-upload-count-badge {
                    display: inline-flex;
                    align-items: center;

                    padding:
                        4px 8px;

                    border-radius:
                        999px;

                    background:
                        var(--dpi-primary-light);

                    color:
                        var(--dpi-primary);

                    font-size: 10px;
                    line-height: 1;
                    font-weight: 900;
                }


                /* =============================================================
                   GRID
                ============================================================= */

                .dpi-upload-grid {
                    display: grid;

                    grid-template-columns:
                        repeat(
                            2,
                            minmax(0, 1fr)
                        );

                    gap: 16px;
                }


                .dpi-upload-field {
                    min-width: 0;
                }


                .dpi-upload-field-full {
                    grid-column:
                        1 / -1;
                }


                .dpi-upload-label {
                    display: flex;
                    align-items: center;

                    gap: 5px;

                    margin-bottom:
                        7px;

                    font-size: 10px;
                    letter-spacing: .08em;

                    text-transform:
                        uppercase;

                    font-weight: 900;

                    color:
                        var(--dpi-secondary);
                }


                .dpi-upload-required {
                    color:
                        var(--dpi-primary);
                }


                /* =============================================================
                   INPUTS
                ============================================================= */

                .dpi-upload-input {
                    width: 100%;

                    height: 46px;

                    border:
                        1.5px solid
                        var(--dpi-border);

                    border-radius:
                        12px;

                    background:
                        var(--dpi-surface);

                    color:
                        var(--dpi-text);

                    padding:
                        0 13px;

                    font-size: 13px;
                    font-weight: 700;

                    outline: none;

                    transition:
                        border-color .18s ease,
                        box-shadow .18s ease,
                        background .18s ease;
                }


                .dpi-upload-input::placeholder {
                    color:
                        var(--dpi-muted);

                    font-weight:
                        600;
                }


                .dpi-upload-input:focus {
                    border-color:
                        var(--dpi-primary);

                    box-shadow:
                        0 0 0 4px
                        rgba(
                            109,
                            92,
                            231,
                            .10
                        );
                }


                .dpi-upload-input-dark {
                    background:
                        #111019;

                    color:
                        var(--dpi-text);
                }


                .dpi-upload-input-error {
                    border-color:
                        var(--dpi-danger);
                }


                /* =============================================================
                   FIXED VALIDATION SLOT
                ============================================================= */

                .dpi-upload-field-error {
                    min-height: 16px;

                    margin:
                        6px 0 0;

                    display: flex;

                    gap: 6px;

                    align-items:
                        flex-start;

                    color:
                        var(--dpi-danger);

                    font-size: 10px;

                    line-height: 1.45;

                    font-weight: 800;
                }


                .dpi-upload-field-error-empty {
                    visibility:
                        hidden;
                }


                .dpi-upload-field-hint {
                    margin-top:
                        6px;

                    font-size:
                        10px;

                    line-height:
                        1.45;

                    color:
                        var(--dpi-muted);

                    font-weight:
                        600;
                }


                /* =============================================================
                   SELECT
                ============================================================= */

                .dpi-upload-select-wrap {
                    position: relative;
                }


                .dpi-upload-select {
                    appearance:
                        none;

                    padding-right:
                        42px;
                }


                .dpi-upload-select-icon {
                    position: absolute;

                    right: 14px;
                    top: 50%;

                    transform:
                        translateY(-50%);

                    color:
                        var(--dpi-muted);

                    pointer-events:
                        none;

                    font-size:
                        12px;
                }


                /* =============================================================
                   TIME
                ============================================================= */

                .dpi-upload-time-row {
                    display: grid;

                    grid-template-columns:
                        repeat(
                            2,
                            minmax(0, 1fr)
                        );

                    gap:
                        16px;

                    align-items:
                        start;
                }


                /* =============================================================
                   ROUTE NOTE
                ============================================================= */

                .dpi-upload-route-note {
                    margin-top:
                        16px;

                    padding:
                        11px 12px;

                    border-radius:
                        12px;

                    background:
                        var(--dpi-primary-light);

                    color:
                        var(--dpi-secondary);

                    font-size:
                        11px;

                    line-height:
                        1.55;

                    font-weight:
                        700;
                }


                .dpi-upload-route-note i {
                    color:
                        var(--dpi-primary);

                    margin-right:
                        5px;
                }


                /* =============================================================
                   STOP ACTION
                ============================================================= */

                .dpi-upload-stop-action {
                    border:
                        0;

                    background:
                        var(--dpi-primary-light);

                    color:
                        var(--dpi-primary);

                    height:
                        36px;

                    padding:
                        0 11px;

                    border-radius:
                        11px;

                    font-size:
                        11px;

                    font-weight:
                        900;

                    cursor:
                        pointer;

                    transition:
                        .18s ease;

                    white-space:
                        nowrap;
                }


                .dpi-upload-stop-action:hover {
                    color:
                        #fff;

                    background:
                        var(--dpi-primary);
                }


                .dpi-upload-stop-action:disabled {
                    cursor:
                        not-allowed;

                    opacity:
                        .4;
                }


                /* =============================================================
                   STOPS TABLE
                ============================================================= */

                .dpi-upload-stop-headings {
                    display: grid;

                    grid-template-columns:
                        minmax(0, 2fr)
                        minmax(120px, 1fr)
                        minmax(110px, .8fr)
                        minmax(100px, .8fr)
                        42px;

                    gap:
                        9px;

                    padding:
                        0 11px 7px;

                    color:
                        var(--dpi-muted);

                    font-size:
                        9px;

                    line-height:
                        1;

                    letter-spacing:
                        .08em;

                    text-transform:
                        uppercase;

                    font-weight:
                        900;
                }


                .dpi-upload-stops {
                    display: flex;

                    flex-direction:
                        column;

                    gap:
                        10px;
                }


                .dpi-upload-stop-row {
                    display: grid;

                    grid-template-columns:
                        minmax(0, 2fr)
                        minmax(120px, 1fr)
                        minmax(110px, .8fr)
                        minmax(100px, .8fr)
                        42px;

                    gap:
                        9px;

                    align-items:
                        start;

                    padding:
                        11px;

                    border:
                        1px solid
                        var(--dpi-border);

                    background:
                        color-mix(
                            in srgb,
                            var(--dpi-bg) 75%,
                            var(--dpi-surface)
                        );

                    border-radius:
                        14px;
                }


                .dpi-upload-stop-index {
                    display:
                        inline-flex;

                    align-items:
                        center;

                    justify-content:
                        center;

                    width:
                        27px;

                    height:
                        27px;

                    border-radius:
                        9px;

                    background:
                        var(--dpi-primary-light);

                    color:
                        var(--dpi-primary);

                    font-size:
                        10px;

                    font-weight:
                        900;

                    flex:
                        0 0 auto;
                }


                .dpi-upload-stop-name-wrap {
                    min-width:
                        0;

                    display:
                        flex;

                    align-items:
                        flex-start;

                    gap:
                        8px;
                }


                .dpi-upload-stop-input {
                    height:
                        42px;
                }


                .dpi-upload-delete {
                    width:
                        38px;

                    height:
                        38px;

                    display:
                        inline-flex;

                    align-items:
                        center;

                    justify-content:
                        center;

                    border:
                        0;

                    border-radius:
                        11px;

                    background:
                        rgba(
                            216,
                            74,
                            74,
                            .08
                        );

                    color:
                        var(--dpi-danger);

                    cursor:
                        pointer;

                    transition:
                        .18s ease;
                }


                .dpi-upload-delete:hover {
                    background:
                        rgba(
                            216,
                            74,
                            74,
                            .15
                        );
                }


                .dpi-upload-stop-delete-wrap {
                    min-height:
                        42px;

                    display:
                        flex;

                    align-items:
                        center;

                    justify-content:
                        flex-end;
                }


                .dpi-upload-mobile-stop-head {
                    display:
                        none;
                }


                /* =============================================================
                   PREVIEW
                ============================================================= */

                .dpi-upload-preview {
                    border:
                        1px solid
                        rgba(
                            109,
                            92,
                            231,
                            .16
                        );

                    border-radius:
                        18px;

                    background:
                        linear-gradient(
                            135deg,
                            rgba(
                                130,
                                116,
                                242,
                                .09
                            ),
                            rgba(
                                109,
                                92,
                                231,
                                .04
                            )
                        );

                    padding:
                        18px;
                }


                .dpi-upload-preview-header {
                    display:
                        flex;

                    align-items:
                        center;

                    justify-content:
                        space-between;

                    gap:
                        12px;

                    margin-bottom:
                        14px;
                }


                .dpi-upload-preview-title {
                    color:
                        var(--dpi-primary);

                    font-size:
                        10px;

                    font-weight:
                        900;

                    letter-spacing:
                        .12em;

                    text-transform:
                        uppercase;
                }


                .dpi-upload-preview-slot {
                    display:
                        inline-flex;

                    align-items:
                        center;

                    gap:
                        5px;

                    padding:
                        6px 9px;

                    border-radius:
                        9px;

                    background:
                        var(--dpi-surface);

                    border:
                        1px solid
                        var(--dpi-border);

                    color:
                        var(--dpi-secondary);

                    font-size:
                        10px;

                    font-weight:
                        900;
                }


                .dpi-upload-preview-route {
                    display:
                        grid;

                    grid-template-columns:
                        1fr
                        auto
                        1fr;

                    align-items:
                        center;

                    gap:
                        18px;

                    padding:
                        8px 4px 17px;
                }


                .dpi-upload-preview-point:last-child {
                    text-align:
                        right;
                }


                .dpi-upload-preview-time {
                    font-size:
                        22px;

                    line-height:
                        1;

                    font-weight:
                        900;

                    letter-spacing:
                        -.03em;
                }


                .dpi-upload-preview-place {
                    margin-top:
                        7px;

                    color:
                        var(--dpi-secondary);

                    font-size:
                        11px;

                    font-weight:
                        800;

                    line-height:
                        1.4;
                }


                .dpi-upload-preview-middle {
                    min-width:
                        128px;

                    text-align:
                        center;
                }


                .dpi-upload-preview-line {
                    position:
                        relative;

                    height:
                        26px;

                    margin-bottom:
                        4px;
                }


                .dpi-upload-preview-line::before {
                    content:
                        "";

                    position:
                        absolute;

                    left:
                        0;

                    right:
                        0;

                    top:
                        13px;

                    height:
                        2px;

                    border-top:
                        2px dashed
                        rgba(
                            109,
                            92,
                            231,
                            .34
                        );
                }


                .dpi-upload-preview-bus {
                    position:
                        absolute;

                    top:
                        3px;

                    left:
                        50%;

                    transform:
                        translateX(-50%);

                    width:
                        32px;

                    height:
                        32px;

                    display:
                        flex;

                    align-items:
                        center;

                    justify-content:
                        center;

                    border-radius:
                        10px;

                    background:
                        var(--dpi-primary);

                    color:
                        #fff;

                    box-shadow:
                        0 8px 20px
                        rgba(
                            109,
                            92,
                            231,
                            .24
                        );
                }


                .dpi-upload-preview-duration {
                    color:
                        var(--dpi-muted);

                    font-size:
                        10px;

                    font-weight:
                        800;
                }


                .dpi-upload-preview-stats {
                    display:
                        grid;

                    grid-template-columns:
                        repeat(
                            3,
                            minmax(
                                0,
                                1fr
                            )
                        );

                    gap:
                        9px;
                }


                .dpi-upload-preview-stat {
                    padding:
                        12px;

                    border-radius:
                        13px;

                    background:
                        var(--dpi-surface);

                    border:
                        1px solid
                        var(--dpi-border);
                }


                .dpi-upload-preview-stat-label {
                    font-size:
                        9px;

                    text-transform:
                        uppercase;

                    letter-spacing:
                        .08em;

                    color:
                        var(--dpi-muted);

                    font-weight:
                        900;
                }


                .dpi-upload-preview-stat-value {
                    margin-top:
                        5px;

                    font-size:
                        13px;

                    font-weight:
                        900;
                }


                /* =============================================================
                   SUBMIT
                ============================================================= */

                .dpi-upload-submit {
                    width:
                        100%;

                    min-height:
                        52px;

                    border:
                        0;

                    border-radius:
                        15px;

                    background:
                        linear-gradient(
                            135deg,
                            #8274F2,
                            #6D5CE7,
                            #5645D2
                        );

                    color:
                        #fff;

                    font-size:
                        13px;

                    font-weight:
                        900;

                    letter-spacing:
                        .01em;

                    cursor:
                        pointer;

                    display:
                        flex;

                    align-items:
                        center;

                    justify-content:
                        center;

                    gap:
                        9px;

                    box-shadow:
                        0 12px 28px
                        rgba(
                            109,
                            92,
                            231,
                            .25
                        );

                    transition:
                        transform .18s ease,
                        box-shadow .18s ease,
                        opacity .18s ease;
                }


                .dpi-upload-submit:hover {
                    transform:
                        translateY(-1px);

                    box-shadow:
                        0 16px 30px
                        rgba(
                            109,
                            92,
                            231,
                            .30
                        );
                }


                .dpi-upload-submit:active {
                    transform:
                        translateY(0);
                }


                .dpi-upload-submit:disabled {
                    cursor:
                        not-allowed;

                    opacity:
                        .58;

                    transform:
                        none;

                    box-shadow:
                        none;
                }


                .dpi-upload-footer-note {
                    text-align:
                        center;

                    color:
                        var(--dpi-muted);

                    margin:
                        10px 0 0;

                    font-size:
                        10px;

                    line-height:
                        1.55;

                    font-weight:
                        600;
                }


                /* =============================================================
                   TOAST
                ============================================================= */

                .dpi-upload-toast {
                    position:
                        fixed;

                    top:
                        18px;

                    right:
                        18px;

                    z-index:
                        9999;

                    width:
                        min(
                            390px,
                            calc(
                                100vw - 36px
                            )
                        );

                    display:
                        flex;

                    align-items:
                        flex-start;

                    gap:
                        10px;

                    border-radius:
                        15px;

                    padding:
                        13px 14px;

                    color:
                        #fff;

                    box-shadow:
                        0 18px 45px
                        rgba(
                            0,
                            0,
                            0,
                            .18
                        );

                    animation:
                        dpiUploadToast
                        .2s
                        ease-out;
                }


                .dpi-upload-toast-info {
                    background:
                        #28263A;
                }


                .dpi-upload-toast-success {
                    background:
                        var(--dpi-success);
                }


                .dpi-upload-toast-error {
                    background:
                        var(--dpi-danger);
                }


                .dpi-upload-toast-message {
                    flex:
                        1;

                    font-size:
                        11px;

                    line-height:
                        1.5;

                    font-weight:
                        800;
                }


                .dpi-upload-toast-close {
                    width:
                        28px;

                    height:
                        28px;

                    border:
                        0;

                    border-radius:
                        8px;

                    background:
                        transparent;

                    color:
                        rgba(
                            255,
                            255,
                            255,
                            .85
                        );

                    cursor:
                        pointer;
                }


                /* =============================================================
                   AUTH / LOADING
                ============================================================= */

                .dpi-upload-center {
                    min-height:
                        70vh;

                    display:
                        flex;

                    flex-direction:
                        column;

                    justify-content:
                        center;

                    align-items:
                        center;

                    gap:
                        12px;
                }


                .dpi-upload-spinner {
                    width:
                        42px;

                    height:
                        42px;

                    border-radius:
                        50%;

                    border:
                        4px solid
                        rgba(
                            109,
                            92,
                            231,
                            .18
                        );

                    border-top-color:
                        var(--dpi-primary);

                    animation:
                        dpiUploadSpin
                        .8s
                        linear
                        infinite;
                }


                .dpi-upload-loading-text {
                    color:
                        var(--dpi-primary);

                    font-size:
                        11px;

                    font-weight:
                        900;

                    letter-spacing:
                        .04em;
                }


                .dpi-upload-auth-card {
                    width:
                        min(
                            430px,
                            100%
                        );

                    margin:
                        16vh auto 0;

                    text-align:
                        center;

                    background:
                        var(--dpi-surface);

                    border:
                        1px solid
                        var(--dpi-border);

                    border-radius:
                        22px;

                    padding:
                        34px 24px;

                    box-shadow:
                        0 18px 50px
                        rgba(
                            28,
                            22,
                            66,
                            .07
                        );
                }


                .dpi-upload-auth-icon {
                    width:
                        72px;

                    height:
                        72px;

                    border-radius:
                        50%;

                    margin:
                        0 auto 17px;

                    display:
                        flex;

                    align-items:
                        center;

                    justify-content:
                        center;

                    font-size:
                        26px;

                    color:
                        var(--dpi-primary);

                    background:
                        var(--dpi-primary-light);
                }


                .dpi-upload-auth-warning {
                    color:
                        #D59C24;

                    background:
                        rgba(
                            234,
                            181,
                            60,
                            .12
                        );
                }


                .dpi-upload-auth-card h2 {
                    margin:
                        0 0 8px;

                    font-size:
                        22px;

                    line-height:
                        1.15;

                    font-weight:
                        900;

                    letter-spacing:
                        -.03em;
                }


                .dpi-upload-auth-card p {
                    margin:
                        0;

                    color:
                        var(--dpi-secondary);

                    font-size:
                        13px;

                    line-height:
                        1.6;

                    font-weight:
                        600;
                }


                @keyframes dpiUploadSpin {
                    to {
                        transform:
                            rotate(360deg);
                    }
                }


                @keyframes dpiUploadToast {
                    from {
                        opacity:
                            0;

                        transform:
                            translateY(-8px);
                    }

                    to {
                        opacity:
                            1;

                        transform:
                            translateY(0);
                    }
                }


                /* =============================================================
                   MOBILE
                ============================================================= */

                @media (max-width: 760px) {

                    .dpi-upload-page {
                        padding:
                            20px
                            12px
                            90px;
                    }


                    .dpi-upload-card {
                        padding:
                            16px;
                    }


                    .dpi-upload-form-shell {
                        border-radius:
                            18px;
                    }


                    .dpi-upload-grid {
                        grid-template-columns:
                            1fr;
                    }


                    .dpi-upload-field-full {
                        grid-column:
                            auto;
                    }


                    .dpi-upload-time-row {
                        grid-template-columns:
                            1fr;

                        gap:
                            10px;
                    }


                    .dpi-upload-section-head {
                        align-items:
                            flex-start;
                    }


                    .dpi-upload-preview-route {
                        grid-template-columns:
                            1fr;

                        gap:
                            12px;
                    }


                    .dpi-upload-preview-point:last-child {
                        text-align:
                            left;
                    }


                    .dpi-upload-preview-middle {
                        order:
                            3;

                        width:
                            100%;
                    }


                    .dpi-upload-preview-line {
                        margin-top:
                            2px;
                    }


                    .dpi-upload-preview-stats {
                        grid-template-columns:
                            1fr;
                    }


                    .dpi-upload-stop-headings {
                        display:
                            none;
                    }


                    .dpi-upload-stop-row {
                        grid-template-columns:
                            1fr
                            1fr;

                        gap:
                            10px;

                        padding:
                            12px;
                    }


                    .dpi-upload-stop-name-wrap {
                        grid-column:
                            1 / -1;
                    }


                    .dpi-upload-stop-delete-wrap {
                        grid-column:
                            2;

                        display:
                            flex;

                        justify-content:
                            flex-end;
                    }


                    .dpi-upload-mobile-stop-head {
                        display:
                            flex;

                        align-items:
                            center;

                        justify-content:
                            space-between;

                        grid-column:
                            1 / -1;

                        margin-bottom:
                            -2px;
                    }


                    .dpi-upload-mobile-stop-badge {
                        display:
                            inline-flex;

                        align-items:
                            center;

                        gap:
                            6px;

                        color:
                            var(--dpi-primary);

                        background:
                            var(--dpi-primary-light);

                        padding:
                            5px 8px;

                        border-radius:
                            8px;

                        font-size:
                            9px;

                        font-weight:
                            900;

                        text-transform:
                            uppercase;
                    }


                    .dpi-upload-mobile-remove {
                        border:
                            0;

                        background:
                            transparent;

                        color:
                            var(--dpi-danger);

                        font-size:
                            10px;

                        font-weight:
                            900;

                        cursor:
                            pointer;
                    }


                    .dpi-upload-title {
                        font-size:
                            31px;
                    }

                }


                @media (max-width: 480px) {

                    .dpi-upload-header {
                        margin-bottom:
                            16px;
                    }


                    .dpi-upload-description {
                        font-size:
                            12px;
                    }


                    .dpi-upload-note {
                        font-size:
                            10px;
                    }


                    .dpi-upload-preview-time {
                        font-size:
                            20px;
                    }

                }

            `}</style>


            <div className="dpi-upload-shell">

                {/* =========================================================
                    TOAST
                ========================================================= */}

                {toast.msg && (
                    <div
                        className={`
                            dpi-upload-toast
                            dpi-upload-toast-${toast.type}
                        `}
                        role="alert"
                    >

                        <i
                            className={`
                                bi
                                ${
                                    toast.type ===
                                    "success"
                                        ? "bi-check-circle-fill"
                                        : toast.type ===
                                          "error"
                                        ? "bi-exclamation-triangle-fill"
                                        : "bi-info-circle-fill"
                                }
                            `}
                        />

                        <span className="dpi-upload-toast-message">
                            {toast.msg}
                        </span>

                        <button
                            type="button"
                            className="dpi-upload-toast-close"
                            onClick={closeToast}
                            aria-label="Close alert"
                        >
                            <i className="bi bi-x-lg" />
                        </button>

                    </div>
                )}


                {/* =========================================================
                    HEADER
                ========================================================= */}

                <header className="dpi-upload-header">

                    <div className="dpi-upload-kicker">
                        Dharmapuri Local Bus
                    </div>

                    <h1 className="dpi-upload-title">
                        Upload a Bus Route
                    </h1>

                    <p className="dpi-upload-description">
                        Help improve DPI One by adding
                        accurate bus route information,
                        including stops, timings,
                        distance and ticket fare.
                    </p>

                    <div className="dpi-upload-note">

                        <i className="bi bi-info-circle-fill" />

                        <span>
                            DPI One currently accepts
                            Dharmapuri local bus routes
                            only. All clock fields are
                            shown in 12-hour format.
                        </span>

                    </div>

                </header>


                {/* =========================================================
                    SINGLE OUTER FORM CONTAINER
                ========================================================= */}

                <div className="dpi-upload-form-shell">

                    <form
                        onSubmit={
                            handleFormSubmit
                        }
                        noValidate
                    >

                        {/* =====================================================
                            BUS DETAILS
                        ===================================================== */}

                        <section className="dpi-upload-card">

                            <SectionTitle
                                number="1"
                                title="Bus Details"
                                isDark={isDark}
                            />


                            <div className="dpi-upload-grid">

                                {/* Bus Number */}
                                <div className="dpi-upload-field">

                                    <label
                                        htmlFor="busNumber"
                                        className="dpi-upload-label"
                                    >
                                        Bus Number
                                        <span className="dpi-upload-required">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        id="busNumber"
                                        type="text"
                                        required
                                        maxLength={5}
                                        autoComplete="off"
                                        value={
                                            state.busNumber
                                        }
                                        placeholder="e.g. 12B"
                                        className={inputClass(
                                            "busNumber"
                                        )}
                                        aria-invalid={
                                            Boolean(
                                                fieldErrors.busNumber
                                            )
                                        }
                                        onChange={
                                            (event) =>
                                                dispatch({
                                                    type:
                                                        "SET_FIELD",
                                                    field:
                                                        "busNumber",
                                                    value:
                                                        sanitizeRouteNumber(
                                                            event.target.value
                                                        )
                                                })
                                        }
                                    />

                                    <div className="dpi-upload-field-hint">
                                        Use the public bus /
                                        service number.
                                    </div>

                                    <FieldError>
                                        {
                                            fieldErrors.busNumber
                                        }
                                    </FieldError>

                                </div>


                                {/* Bus Type */}
                                <div className="dpi-upload-field">

                                    <label
                                        htmlFor="busType"
                                        className="dpi-upload-label"
                                    >
                                        Bus Type
                                        <span className="dpi-upload-required">
                                            *
                                        </span>
                                    </label>

                                    <div className="dpi-upload-select-wrap">

                                        <select
                                            id="busType"
                                            className={`
                                                ${
                                                    inputClass(
                                                        "busType"
                                                    )
                                                }
                                                dpi-upload-select
                                            `}
                                            value={
                                                state.busType
                                            }
                                            onChange={
                                                (event) =>
                                                    dispatch({
                                                        type:
                                                            "SET_FIELD",
                                                        field:
                                                            "busType",
                                                        value:
                                                            event.target.value
                                                    })
                                            }
                                        >

                                            <option value="Govt Bus">
                                                Government
                                            </option>

                                            <option value="Private">
                                                Private
                                            </option>

                                        </select>

                                        <i className="bi bi-chevron-down dpi-upload-select-icon" />

                                    </div>

                                    <FieldError />

                                </div>


                                {/* Time Row */}
                                <div className="dpi-upload-field-full">

                                    <div className="dpi-upload-time-row">

                                        {/* Departure */}
                                        <div className="dpi-upload-field">

                                            <label
                                                htmlFor="departureTime"
                                                className="dpi-upload-label"
                                            >
                                                Starting Time
                                                <span className="dpi-upload-required">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                id="departureTime"
                                                type="time"
                                                required
                                                value={
                                                    state.departureTime
                                                }
                                                className={inputClass(
                                                    "departureTime"
                                                )}
                                                aria-invalid={
                                                    Boolean(
                                                        fieldErrors.departureTime
                                                    )
                                                }
                                                onClick={
                                                    (event) =>
                                                        event.target.showPicker?.()
                                                }
                                                onChange={
                                                    (event) =>
                                                        dispatch({
                                                            type:
                                                                "SET_FIELD",
                                                            field:
                                                                "departureTime",
                                                            value:
                                                                event.target.value
                                                        })
                                                }
                                            />

                                            <FieldError>
                                                {
                                                    fieldErrors.departureTime
                                                }
                                            </FieldError>

                                        </div>


                                        {/* Arrival */}
                                        <div className="dpi-upload-field">

                                            <label
                                                htmlFor="arrivalTime"
                                                className="dpi-upload-label"
                                            >
                                                Ending Time
                                                <span className="dpi-upload-required">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                id="arrivalTime"
                                                type="time"
                                                required
                                                value={
                                                    state.arrivalTime
                                                }
                                                className={inputClass(
                                                    "arrivalTime"
                                                )}
                                                aria-invalid={
                                                    Boolean(
                                                        fieldErrors.arrivalTime
                                                    )
                                                }
                                                onClick={
                                                    (event) =>
                                                        event.target.showPicker?.()
                                                }
                                                onChange={
                                                    (event) =>
                                                        dispatch({
                                                            type:
                                                                "SET_FIELD",
                                                            field:
                                                                "arrivalTime",
                                                            value:
                                                                event.target.value
                                                        })
                                                }
                                            />

                                            <FieldError>
                                                {
                                                    fieldErrors.arrivalTime
                                                }
                                            </FieldError>

                                        </div>

                                    </div>

                                </div>


                                {/* Starting Place */}
                                <div className="dpi-upload-field">

                                    <label
                                        htmlFor="startPoint"
                                        className="dpi-upload-label"
                                    >
                                        Starting Place
                                        <span className="dpi-upload-required">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        id="startPoint"
                                        type="text"
                                        required
                                        maxLength={60}
                                        autoComplete="off"
                                        value={
                                            state.startPoint
                                        }
                                        placeholder="e.g. Dharmapuri"
                                        className={inputClass(
                                            "startPoint"
                                        )}
                                        aria-invalid={
                                            Boolean(
                                                fieldErrors.startPoint
                                            )
                                        }
                                        onChange={
                                            (event) =>
                                                dispatch({
                                                    type:
                                                        "SET_FIELD",
                                                    field:
                                                        "startPoint",
                                                    value:
                                                        sanitizeText(
                                                            event.target.value
                                                        )
                                                })
                                        }
                                    />

                                    <FieldError>
                                        {
                                            fieldErrors.startPoint
                                        }
                                    </FieldError>

                                </div>


                                {/* Destination */}
                                <div className="dpi-upload-field">

                                    <label
                                        htmlFor="destination"
                                        className="dpi-upload-label"
                                    >
                                        Ending Place
                                        <span className="dpi-upload-required">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        id="destination"
                                        type="text"
                                        required
                                        maxLength={60}
                                        autoComplete="off"
                                        value={
                                            state.destination
                                        }
                                        placeholder="e.g. Morapur"
                                        className={inputClass(
                                            "destination"
                                        )}
                                        aria-invalid={
                                            Boolean(
                                                fieldErrors.destination
                                            )
                                        }
                                        onChange={
                                            (event) =>
                                                dispatch({
                                                    type:
                                                        "SET_FIELD",
                                                    field:
                                                        "destination",
                                                    value:
                                                        sanitizeText(
                                                            event.target.value
                                                        )
                                                })
                                        }
                                    />

                                    <FieldError>
                                        {
                                            fieldErrors.destination
                                        }
                                    </FieldError>

                                </div>

                            </div>


                            <div className="dpi-upload-route-note">

                                <i className="bi bi-clock-history" />

                                Departure:
                                <strong>
                                    {" "}
                                    {detectedTimeSlot}
                                </strong>
                                {" "}
                                route slot is detected
                                automatically from the
                                starting time.

                            </div>

                        </section>


                        {/* =====================================================
                            BUS STOPS
                        ===================================================== */}

                        <section className="dpi-upload-card">

                            <SectionTitle
                                number="2"
                                title="Bus Stops"
                                isDark={isDark}
                                count={
                                    state.stops.length
                                }
                                action={(
                                    <button
                                        type="button"
                                        className="dpi-upload-stop-action"
                                        disabled={
                                            state.stops.length >=
                                            CONFIG.MAX_STOPS
                                        }
                                        onClick={() =>
                                            dispatch({
                                                type:
                                                    "ADD_STOP"
                                            })
                                        }
                                    >
                                        <i className="bi bi-plus-circle-fill" />
                                        {" "}
                                        Add Stop
                                    </button>
                                )}
                            />


                            <FieldError>
                                {fieldErrors.stops}
                            </FieldError>


                            <div className="dpi-upload-stop-headings">

                                <span>
                                    Place
                                </span>

                                <span>
                                    Time
                                </span>

                                <span>
                                    Kilometre
                                </span>

                                <span>
                                    Ticket Price
                                </span>

                                <span />

                            </div>


                            <div className="dpi-upload-stops">

                                {state.stops.map(
                                    (
                                        stop,
                                        index
                                    ) => (
                                        <div
                                            key={
                                                stop.id
                                            }
                                            className="dpi-upload-stop-row"
                                        >

                                            {/* Mobile header */}
                                            <div className="dpi-upload-mobile-stop-head">

                                                <span className="dpi-upload-mobile-stop-badge">
                                                    Stop {index + 1}
                                                </span>

                                                {state.stops.length > 1 && (
                                                    <button
                                                        type="button"
                                                        className="dpi-upload-mobile-remove"
                                                        onClick={() =>
                                                            dispatch({
                                                                type:
                                                                    "REMOVE_STOP",
                                                                id:
                                                                    stop.id
                                                            })
                                                        }
                                                    >
                                                        Remove
                                                    </button>
                                                )}

                                            </div>


                                            {/* NAME */}
                                            <div className="dpi-upload-stop-name-wrap">

                                                <span className="dpi-upload-stop-index">
                                                    {index + 1}
                                                </span>

                                                <input
                                                    type="text"
                                                    required
                                                    maxLength={40}
                                                    autoComplete="off"
                                                    placeholder="e.g. Bus Stand / Junction"
                                                    value={
                                                        stop.name
                                                    }
                                                    className={`${inputClass(
                                                        "stop"
                                                    )} dpi-upload-stop-input`}
                                                    onChange={
                                                        (event) =>
                                                            dispatch({
                                                                type:
                                                                    "UPDATE_STOP",
                                                                id:
                                                                    stop.id,
                                                                field:
                                                                    "name",
                                                                value:
                                                                    sanitizeText(
                                                                        event.target.value,
                                                                        40
                                                                    )
                                                            })
                                                    }
                                                />

                                            </div>


                                            {/* TIME */}
                                            <div>

                                                <input
                                                    type="time"
                                                    required
                                                    value={
                                                        stop.time
                                                    }
                                                    className={`${inputClass(
                                                        "stopTime"
                                                    )} dpi-upload-stop-input`}
                                                    onClick={
                                                        (event) =>
                                                            event.target.showPicker?.()
                                                    }
                                                    onChange={
                                                        (event) =>
                                                            dispatch({
                                                                type:
                                                                    "UPDATE_STOP",
                                                                id:
                                                                    stop.id,
                                                                field:
                                                                    "time",
                                                                value:
                                                                    event.target.value
                                                            })
                                                    }
                                                />

                                            </div>


                                            {/* DISTANCE */}
                                            <div>

                                                <input
                                                    type="number"
                                                    inputMode="decimal"
                                                    min="0"
                                                    max={
                                                        CONFIG.MAX_DISTANCE_KM
                                                    }
                                                    step="0.1"
                                                    placeholder="km"
                                                    value={
                                                        stop.distance
                                                    }
                                                    className={`${inputClass(
                                                        "stopDistance"
                                                    )} dpi-upload-stop-input`}
                                                    onChange={
                                                        (event) =>
                                                            dispatch({
                                                                type:
                                                                    "UPDATE_STOP",
                                                                id:
                                                                    stop.id,
                                                                field:
                                                                    "distance",
                                                                value:
                                                                    event.target.value
                                                            })
                                                    }
                                                />

                                            </div>


                                            {/* FARE */}
                                            <div>

                                                <input
                                                    type="number"
                                                    inputMode="decimal"
                                                    min="0"
                                                    max={
                                                        CONFIG.MAX_PRICE
                                                    }
                                                    step="1"
                                                    placeholder="₹"
                                                    value={
                                                        stop.price
                                                    }
                                                    className={`${inputClass(
                                                        "stopPrice"
                                                    )} dpi-upload-stop-input`}
                                                    onChange={
                                                        (event) =>
                                                            dispatch({
                                                                type:
                                                                    "UPDATE_STOP",
                                                                id:
                                                                    stop.id,
                                                                field:
                                                                    "price",
                                                                value:
                                                                    event.target.value
                                                            })
                                                    }
                                                />

                                            </div>


                                            {/* DELETE */}
                                            <div className="dpi-upload-stop-delete-wrap">

                                                {state.stops.length > 1 && (
                                                    <button
                                                        type="button"
                                                        className="dpi-upload-delete"
                                                        onClick={() =>
                                                            dispatch({
                                                                type:
                                                                    "REMOVE_STOP",
                                                                id:
                                                                    stop.id
                                                            })
                                                        }
                                                        aria-label={`Remove stop ${
                                                            index + 1
                                                        }`}
                                                    >
                                                        <i className="bi bi-trash-fill" />
                                                    </button>
                                                )}

                                            </div>

                                        </div>
                                    )
                                )}

                            </div>

                        </section>


                        {/* =====================================================
                            ROUTE PREVIEW
                        ===================================================== */}

                        <section className="dpi-upload-card">

                            <SectionTitle
                                number="3"
                                title="Route Preview"
                                isDark={isDark}
                            />


                            <div className="dpi-upload-preview">

                                <div className="dpi-upload-preview-header">

                                    <span className="dpi-upload-preview-title">
                                        Live Preview
                                    </span>

                                    <span className="dpi-upload-preview-slot">

                                        <i className="bi bi-clock-history" />

                                        {detectedTimeSlot}

                                    </span>

                                </div>


                                <div className="dpi-upload-preview-route">

                                    {/* START */}

                                    <div className="dpi-upload-preview-point">

                                        <div className="dpi-upload-preview-time">
                                            {format12Hour(
                                                state.departureTime
                                            )}
                                        </div>

                                        <div className="dpi-upload-preview-place">
                                            {
                                                state.startPoint ||
                                                "Starting Place"
                                            }
                                        </div>

                                    </div>


                                    {/* CENTER */}

                                    <div className="dpi-upload-preview-middle">

                                        <div className="dpi-upload-preview-line">

                                            <div className="dpi-upload-preview-bus">
                                                <i className="bi bi-bus-front-fill" />
                                            </div>

                                        </div>

                                        <div className="dpi-upload-preview-duration">
                                            {formatDuration(
                                                routeDuration
                                            )}
                                        </div>

                                    </div>


                                    {/* END */}

                                    <div className="dpi-upload-preview-point">

                                        <div className="dpi-upload-preview-time">
                                            {format12Hour(
                                                state.arrivalTime
                                            )}
                                        </div>

                                        <div className="dpi-upload-preview-place">
                                            {
                                                state.destination ||
                                                "Ending Place"
                                            }
                                        </div>

                                    </div>

                                </div>


                                {/* STATS */}

                                <div className="dpi-upload-preview-stats">

                                    <div className="dpi-upload-preview-stat">

                                        <div className="dpi-upload-preview-stat-label">
                                            Trip Duration
                                        </div>

                                        <div className="dpi-upload-preview-stat-value">
                                            {formatDuration(
                                                routeDuration
                                            )}
                                        </div>

                                    </div>


                                    <div className="dpi-upload-preview-stat">

                                        <div className="dpi-upload-preview-stat-label">
                                            Stops
                                        </div>

                                        <div className="dpi-upload-preview-stat-value">
                                            {
                                                state.stops.length
                                            }
                                        </div>

                                    </div>


                                    <div className="dpi-upload-preview-stat">

                                        <div className="dpi-upload-preview-stat-label">
                                            Distance
                                        </div>

                                        <div className="dpi-upload-preview-stat-value">
                                            {
                                                totalDistance !==
                                                null
                                                    ? `${totalDistance} km`
                                                    : "--"
                                            }
                                        </div>

                                    </div>

                                </div>


                                {/* REVIEW NOTE */}

                                <div className="dpi-upload-route-note">

                                    <i className="bi bi-shield-check" />

                                    Route submissions are
                                    reviewed before they
                                    become visible on DPI One.

                                </div>


                                {averageSpeed && (
                                    <div className="dpi-upload-field-hint">

                                        Estimated average speed:
                                        {" "}
                                        <strong>
                                            {averageSpeed}
                                            {" "}
                                            km/h
                                        </strong>

                                    </div>
                                )}


                                {finalStopFare !== null && (
                                    <div className="dpi-upload-field-hint">

                                        Highest entered stop fare:
                                        {" "}
                                        <strong>
                                            ₹{finalStopFare}
                                        </strong>

                                    </div>
                                )}

                            </div>

                        </section>


                        {/* =====================================================
                            SUBMIT
                        ===================================================== */}

                        <section className="dpi-upload-card">

                            <button
                                type="submit"
                                disabled={
                                    isLoading
                                }
                                className="dpi-upload-submit"
                            >

                                {isLoading ? (
                                    <>
                                        <span
                                            className="dpi-upload-spinner"
                                            style={{
                                                width: 19,
                                                height: 19,
                                                borderWidth: 2,
                                                borderColor:
                                                    "rgba(255,255,255,.35)",
                                                borderTopColor:
                                                    "#fff"
                                            }}
                                        />

                                        Verifying Route Data...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-shield-check" />

                                        Submit Bus Route
                                    </>
                                )}

                            </button>


                            <p className="dpi-upload-footer-note">
                                Your submission will be
                                reviewed before publication.
                            </p>

                        </section>

                    </form>

                </div>

            </div>

        </div>
    );
};


export default UploadPage;