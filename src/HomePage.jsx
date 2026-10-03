import React, { useEffect, useMemo, useRef, useState } from "react";
import { db, auth } from "./firebase.jsx";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

import BusResultCard from "./BusResultCard.jsx";
import BusStoppingCard from "./BusStoppingCard.jsx";

/* =========================================================
   TIMING OPTIONS
========================================================= */

const timingOptions = [
  {
    id: "",
    label: "All timings",
    icon: "bi-grid",
  },
  {
    id: "Morning",
    label: "Morning",
    icon: "bi-brightness-high",
  },
  {
    id: "Afternoon",
    label: "Afternoon",
    icon: "bi-cloud-sun",
  },
  {
    id: "Evening",
    label: "Evening",
    icon: "bi-sunset",
  },
  {
    id: "Night",
    label: "Night",
    icon: "bi-moon-stars",
  },
];

/* =========================================================
   SANITIZATION
========================================================= */

const sanitize = (value) =>
  typeof value === "string"
    ? value
        .replace(/[<>"'`\\;=(){}\[\]|&]/g, "")
        .replace(/\s{2,}/g, " ")
        .trim()
        .slice(0, 60)
    : "";

const sanitizeTyping = (value) =>
  typeof value === "string"
    ? value
        .replace(/[<>"'`\\;=(){}\[\]|&]/g, "")
        .slice(0, 60)
    : "";

const sanitizeBusNo = (value) =>
  typeof value === "string"
    ? value
        .toUpperCase()
        .replace(/[^A-Z0-9\s-]/g, "")
        .replace(/\s{2,}/g, " ")
        .slice(0, 20)
    : "";

/* =========================================================
   FIREBASE DATA SANITIZER
========================================================= */

const sanitizeBusDoc = (snapshot) => {
  const data = snapshot.data() || {};

  return {
    id: snapshot.id,

    bus: sanitizeBusNo(data.bus || ""),

    start: sanitize(data.start || ""),

    dest: sanitize(data.dest || ""),

    type: ["Private", "Govt Bus"].includes(data.type)
      ? data.type
      : "Private",

    slot: ["Morning", "Afternoon", "Evening", "Night"].includes(
      data.slot
    )
      ? data.slot
      : "Morning",

    time: sanitize(data.time || ""),

    arrivalTime: sanitize(data.arrivalTime || ""),

    km: sanitize(data.km || ""),

    duration: sanitize(data.duration || ""),

    basePrice:
      typeof data.basePrice === "number" && data.basePrice >= 0
        ? data.basePrice
        : 0,

    seats:
      typeof data.seats === "number"
        ? data.seats
        : 30,

    stops: Array.isArray(data.stops)
      ? data.stops.map((stop) => ({
          name: sanitize(stop?.name || ""),

          time: sanitize(stop?.time || ""),

          price:
            typeof stop?.price === "number" &&
            stop.price >= 0
              ? stop.price
              : 0,
        }))
      : [],
  };
};

/* =========================================================
   DPI TOGGLE
   KEEPING ORIGINAL TOGGLE CSS
========================================================= */

const DpiToggle = ({
  checked,
  onChange,
  label = "Toggle",
}) => {
  return (
    <label className="inline-flex cursor-pointer items-center gap-3 select-none">
      <span className="text-xs font-bold text-[#6B7280]">
        {label}
      </span>

      <span className="relative inline-flex h-7 w-12 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) =>
            onChange(event.target.checked)
          }
          aria-label={label}
          className="peer sr-only"
        />

        <span
          aria-hidden="true"
          className="
            absolute inset-0
            rounded-full
            border
            border-[#D9DBE5]
            bg-[#E5E7EB]
            p-0.5
            shadow-none
            outline-none
            transition-colors
            duration-200
            ease-out
            peer-checked:border-[#6657D8]
            peer-checked:bg-[#7667E8]
          "
        />

        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-1
            top-1
            h-5
            w-5
            rounded-full
            bg-white
            shadow-[0_1px_3px_rgba(17,24,39,0.18)]
            outline-none
            transition-transform
            duration-200
            ease-out
            peer-checked:translate-x-5
          "
        />
      </span>
    </label>
  );
};

/* =========================================================
   HOMEPAGE
========================================================= */

const HomePage = () => {
  /* -------------------------------------------------------
     AUTH
  ------------------------------------------------------- */

  const [user, setUser] = useState(null);

  /* -------------------------------------------------------
     SEARCH STATE
  ------------------------------------------------------- */

  const [busNumber, setBusNumber] = useState("");

  const [startPoint, setStartPoint] = useState("");

  const [destination, setDestination] = useState("");

  const [selectedTimeFilter, setSelectedTimeFilter] =
    useState("");

  /* -------------------------------------------------------
     BUS DATA
  ------------------------------------------------------- */

  const [buses, setBuses] = useState([]);

  const [isFetching, setIsFetching] =
    useState(true);

  const [fetchError, setFetchError] =
    useState(false);

  /* -------------------------------------------------------
     SEARCH RESULTS
  ------------------------------------------------------- */

  const [matchedRoutes, setMatchedRoutes] =
    useState([]);

  const [hasSearched, setHasSearched] =
    useState(false);

  const [validationError, setValidationError] =
    useState("");

  /* -------------------------------------------------------
     ACTIVE INPUT
  ------------------------------------------------------- */

  const [activeInput, setActiveInput] =
    useState(null);

  /* -------------------------------------------------------
     SWAP
  ------------------------------------------------------- */

  const [isSwapping, setIsSwapping] =
    useState(false);

  const [isSwapped, setIsSwapped] =
    useState(false);

  /* -------------------------------------------------------
     RESULTS EXPANSION
  ------------------------------------------------------- */

  const [expandedBusId, setExpandedBusId] =
    useState(null);

  /* -------------------------------------------------------
     SAVED ROUTES
  ------------------------------------------------------- */

  const [savedRoutes, setSavedRoutes] =
    useState([]);

  /* -------------------------------------------------------
     EXISTING DPI TOGGLE
  ------------------------------------------------------- */

  const [isEnabled, setIsEnabled] =
    useState(false);

  /* -------------------------------------------------------
     FORM REF
  ------------------------------------------------------- */

  const formRef = useRef(null);

  /* =======================================================
     AUTH LISTENER
  ====================================================== */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
      }
    );

    return unsubscribe;
  }, []);

  /* =======================================================
     CLOSE DROPDOWN ON OUTSIDE CLICK
  ====================================================== */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        formRef.current &&
        !formRef.current.contains(event.target)
      ) {
        setActiveInput(null);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /* =======================================================
     FETCH APPROVED BUSES
  ====================================================== */

  const fetchBuses = async () => {
    setIsFetching(true);
    setFetchError(false);

    try {
      const busesQuery = query(
        collection(db, "busRoutes"),
        where("status", "==", "approved")
      );

      const snapshot =
        await getDocs(busesQuery);

      setBuses(
        snapshot.docs.map(sanitizeBusDoc)
      );
    } catch (error) {
      console.error(
        "DPI One fetch error:",
        error
      );

      setFetchError(true);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  /* =======================================================
     SAVED ROUTES LISTENER
  ====================================================== */

  useEffect(() => {
    if (!user) {
      setSavedRoutes([]);
      return undefined;
    }

    const savedRef = collection(
      db,
      "users",
      user.uid,
      "savedRoutes"
    );

    const unsubscribe = onSnapshot(
      savedRef,
      (snapshot) => {
        setSavedRoutes(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))
        );
      },
      (error) => {
        console.error(
          "Saved routes error:",
          error
        );

        setSavedRoutes([]);
      }
    );

    return unsubscribe;
  }, [user]);

  /* =======================================================
     CITY LIST
  ====================================================== */

  const allCities = useMemo(() => {
    return [
      ...new Set(
        buses
          .flatMap((route) => [
            route.start,
            route.dest,
          ])
          .filter(Boolean)
      ),
    ].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [buses]);

  /* =======================================================
     BUS NUMBER LIST
  ====================================================== */

  const allBusNumbers = useMemo(() => {
    return [
      ...new Set(
        buses
          .map((route) => route.bus)
          .filter(Boolean)
      ),
    ].sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );
  }, [buses]);

  /* =======================================================
     BUS NUMBER SUGGESTIONS
  ====================================================== */

  const busSuggestions = useMemo(() => {
    const value =
      busNumber.trim().toLowerCase();

    if (!value) {
      return allBusNumbers.slice(0, 7);
    }

    return allBusNumbers
      .filter((bus) =>
        bus.toLowerCase().includes(value)
      )
      .slice(0, 7);
  }, [busNumber, allBusNumbers]);

  /* =======================================================
     FROM SUGGESTIONS
  ====================================================== */

  const startSuggestions = useMemo(() => {
    const value =
      startPoint.trim().toLowerCase();

    if (!value) {
      return [];
    }

    return allCities
      .filter((city) => {
        const normalized =
          city.toLowerCase();

        return (
          normalized.includes(value) &&
          normalized !== value &&
          normalized !==
            destination.trim().toLowerCase()
        );
      })
      .slice(0, 6);
  }, [
    startPoint,
    allCities,
    destination,
  ]);

  /* =======================================================
     TO SUGGESTIONS
  ====================================================== */

  const destinationSuggestions = useMemo(() => {
    const value =
      destination.trim().toLowerCase();

    if (!value) {
      return [];
    }

    return allCities
      .filter((city) => {
        const normalized =
          city.toLowerCase();

        return (
          normalized.includes(value) &&
          normalized !== value &&
          normalized !==
            startPoint.trim().toLowerCase()
        );
      })
      .slice(0, 6);
  }, [
    destination,
    allCities,
    startPoint,
  ]);

  /* =======================================================
     CURRENT BUS KEY
  ====================================================== */

  const currentBusKey = () =>
    sanitizeBusNo(busNumber);

  /* =======================================================
     SAVED ROUTE CHECK
  ====================================================== */

  const isCurrentRouteSaved = useMemo(() => {
    if (
      !startPoint.trim() ||
      !destination.trim() ||
      !busNumber.trim()
    ) {
      return false;
    }

    const busKey =
      currentBusKey();

    return savedRoutes.some(
      (route) =>
        route.start?.toLowerCase() ===
          startPoint
            .trim()
            .toLowerCase() &&
        route.dest?.toLowerCase() ===
          destination
            .trim()
            .toLowerCase() &&
        sanitizeBusNo(
          route.bus || ""
        ) === busKey
    );
  }, [
    startPoint,
    destination,
    busNumber,
    savedRoutes,
  ]);

  /* =======================================================
     SWAP FROM / TO
  ====================================================== */

  const handleSwap = () => {
    if (isSwapping) {
      return;
    }

    setIsSwapping(true);

    setValidationError("");

    const temporary = startPoint;

    setStartPoint(destination);

    setDestination(temporary);

    setIsSwapped(
      (previous) => !previous
    );

    window.setTimeout(() => {
      setIsSwapping(false);
    }, 220);
  };

  /* =======================================================
     SAVE ROUTE
  ====================================================== */

  const toggleSaveRoute = async () => {
    if (!user) {
      setValidationError(
        "Sign in to save routes."
      );

      return;
    }

    const start =
      sanitize(startPoint);

    const dest =
      sanitize(destination);

    const bus =
      sanitizeBusNo(busNumber);

    if (!start || !dest || !bus) {
      setValidationError(
        "Enter bus number, from and to before saving."
      );

      return;
    }

    if (
      start.toLowerCase() ===
      dest.toLowerCase()
    ) {
      setValidationError(
        "Start and destination cannot be the same."
      );

      return;
    }

    const documentKey =
      `${start.toLowerCase()}_to_${dest.toLowerCase()}_${bus.toLowerCase()}`;

    const reference = doc(
      db,
      "users",
      user.uid,
      "savedRoutes",
      documentKey
    );

    const existing =
      savedRoutes.find(
        (route) =>
          route.start?.toLowerCase() ===
            start.toLowerCase() &&
          route.dest?.toLowerCase() ===
            dest.toLowerCase() &&
          sanitizeBusNo(
            route.bus || ""
          ) === bus
      );

    try {
      if (existing) {
        await deleteDoc(
          doc(
            db,
            "users",
            user.uid,
            "savedRoutes",
            existing.id
          )
        );
      } else {
        await setDoc(reference, {
          start,
          dest,
          bus,
          createdAt:
            serverTimestamp(),
        });
      }
    } catch (error) {
      console.error(
        "Save route error:",
        error
      );

      setValidationError(
        "Could not update the saved route. Please try again."
      );
    }
  };

  /* =======================================================
     USE SAVED ROUTE
  ====================================================== */

  const handleUseRoute = (route) => {
    setBusNumber(
      route.bus && route.bus !== "Any"
        ? sanitizeBusNo(route.bus)
        : ""
    );

    setStartPoint(
      route.start || ""
    );

    setDestination(
      route.dest || ""
    );

    setSelectedTimeFilter("");

    setHasSearched(false);

    setMatchedRoutes([]);

    setValidationError("");

    setExpandedBusId(null);

    setActiveInput(null);
  };

  /* =======================================================
     REMOVE SAVED ROUTE
  ====================================================== */

  const removeSavedRoute = async (
    event,
    id
  ) => {
    event.stopPropagation();

    if (!user) {
      return;
    }

    try {
      await deleteDoc(
        doc(
          db,
          "users",
          user.uid,
          "savedRoutes",
          id
        )
      );
    } catch (error) {
      console.error(
        "Delete route error:",
        error
      );

      setValidationError(
        "Could not remove the saved route."
      );
    }
  };

  /* =======================================================
     CLEAR SEARCH
  ====================================================== */

  const clearSearch = () => {
    setBusNumber("");

    setStartPoint("");

    setDestination("");

    setSelectedTimeFilter("");

    setValidationError("");

    setHasSearched(false);

    setMatchedRoutes([]);

    setExpandedBusId(null);

    setActiveInput(null);

    setIsSwapped(false);
  };

  /* =======================================================
     SEARCH SUBMIT
  ====================================================== */

  const handleSearchSubmit = (
    event
  ) => {
    event.preventDefault();

    setActiveInput(null);

    setValidationError("");

    setExpandedBusId(null);

    const bus =
      sanitizeBusNo(busNumber);

    const start =
      sanitize(startPoint);

    const dest =
      sanitize(destination);

    /* -----------------------------------------------
       BUS NUMBER REQUIRED
    ----------------------------------------------- */

    if (!bus) {
      setHasSearched(true);

      setValidationError(
        "Please enter the bus number."
      );

      setMatchedRoutes([]);

      return;
    }

    /* -----------------------------------------------
       FROM REQUIRED
    ----------------------------------------------- */

    if (!start) {
      setHasSearched(true);

      setValidationError(
        "Please enter your departure place."
      );

      setMatchedRoutes([]);

      return;
    }

    /* -----------------------------------------------
       TO REQUIRED
    ----------------------------------------------- */

    if (!dest) {
      setHasSearched(true);

      setValidationError(
        "Please enter your destination."
      );

      setMatchedRoutes([]);

      return;
    }

    /* -----------------------------------------------
       SAME PLACE VALIDATION
    ----------------------------------------------- */

    if (
      start.toLowerCase() ===
      dest.toLowerCase()
    ) {
      setHasSearched(true);

      setValidationError(
        "Start and destination cannot be the same."
      );

      setMatchedRoutes([]);

      return;
    }

    /* -----------------------------------------------
       EXACT SERVICE SEARCH
    ----------------------------------------------- */

    const results =
      buses.filter((route) => {
        const routeStart =
          route.start
            ?.trim()
            .toLowerCase();

        const routeDest =
          route.dest
            ?.trim()
            .toLowerCase();

        const routeBus =
          sanitizeBusNo(
            route.bus || ""
          );

        return (
          routeStart ===
            start.toLowerCase() &&
          routeDest ===
            dest.toLowerCase() &&
          routeBus === bus &&
          (selectedTimeFilter
            ? route.slot ===
              selectedTimeFilter
            : true)
        );
      });

    setMatchedRoutes(results);

    setHasSearched(true);
  };

  /* =======================================================
     SELECTED TIMING
  ====================================================== */

  const selectedTiming =
    timingOptions.find(
      (option) =>
        option.id ===
        selectedTimeFilter
    ) ||
    timingOptions[0];

  /* =======================================================
     LOADING
  ====================================================== */

  if (isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FC] px-6 font-[Montserrat,sans-serif] text-[#111827]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ECE9FF] border-t-[#7667E8]" />

          <p className="text-sm font-semibold text-[#374151]">
            Connecting to DPI One...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ====================================================== */

  if (fetchError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FC] px-6 font-[Montserrat,sans-serif]">
        <div className="w-full max-w-sm rounded-3xl border border-[#E7E7EF] bg-white p-8 text-center shadow-[0_12px_40px_rgba(17,24,39,0.08)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <i className="bi bi-wifi-off text-2xl" />
          </div>

          <h2 className="text-lg font-extrabold text-[#111827]">
            Connection Failed
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#8B93A3]">
            We could not load the approved bus
            routes right now.
          </p>

          <button
            type="button"
            onClick={fetchBuses}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#7667E8] px-6 text-sm font-bold text-white transition hover:bg-[#6657D8] active:scale-[0.98]"
          >
            <i className="bi bi-arrow-clockwise mr-2" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN PAGE
  ====================================================== */

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F8FC] font-[Montserrat,sans-serif] text-[#111827]">
      <main>

        {/* =====================================================
            HERO
        ====================================================== */}

        <section className="relative overflow-hidden bg-white">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-28 -top-32 h-80 w-80 rounded-full bg-[#7667E8]/[0.08] blur-3xl" />

            <div className="absolute -left-28 bottom-0 h-72 w-72 rounded-full bg-[#7667E8]/[0.055] blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-5xl px-5 pb-20 pt-12 sm:px-8 sm:pb-24 sm:pt-16 lg:px-10 lg:pt-20">
            <div className="max-w-3xl">

              <div className="inline-flex items-center gap-2 rounded-full border border-[#DDD8FA] bg-[#F4F2FF] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#6657D8]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7667E8]" />

                Dharmapuri Bus Information
              </div>

              <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.06] tracking-[-0.045em] text-[#111827] sm:text-5xl lg:text-[60px]">
                Find the right bus.
                <span className="block text-[#7667E8]">
                  Reach your destination.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-[#6B7280] sm:text-base sm:leading-7">
                Search Dharmapuri bus services by
                bus number, route and timing.
              </p>

            </div>
          </div>
        </section>

        {/* =====================================================
            SEARCH CARD
        ====================================================== */}

        <section className="relative z-20 px-4 sm:px-6 lg:px-8">
          <div
            ref={formRef}
            className="mx-auto -mt-10 w-full max-w-4xl rounded-[24px] border border-[#E7E7EF] bg-white p-5 shadow-[0_18px_50px_rgba(31,25,80,0.075)] sm:-mt-12 sm:p-6 lg:p-7"
          >

            {/* HEADER */}

            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F4F2FF] text-[#7667E8]">
                  <i className="bi bi-search" />
                </span>

                <div>
                  <h2 className="text-base font-extrabold tracking-tight text-[#111827] sm:text-lg">
                    Search your bus
                  </h2>

                  <p className="mt-0.5 text-[10px] font-medium text-[#9CA3AF] sm:text-xs">
                    Enter your bus number and route.
                  </p>
                </div>
              </div>

              <div className="hidden rounded-full bg-[#F7F8FC] px-2.5 py-1.5 text-[10px] font-extrabold text-[#8B93A3] sm:block">
                {buses.length} approved services
              </div>
            </div>

            {/* ERROR */}

            {validationError && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-100 bg-[#FFF9F9] px-3.5 py-2.5 text-xs font-bold text-red-500"
              >
                <i className="bi bi-exclamation-circle-fill mt-0.5" />

                <span>
                  {validationError}
                </span>
              </div>
            )}

            <form
              onSubmit={handleSearchSubmit}
              noValidate
              className="space-y-4"
            >

              {/* =================================================
                  1. BUS NUMBER
              ================================================= */}

              <div className="relative z-[100]">
                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#6B7280]">
                  Bus Number
                  <span className="ml-1 text-[#7667E8]">
                    *
                  </span>
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-[#F4F2FF] text-[#7667E8]">
                    <i className="bi bi-bus-front-fill text-sm" />
                  </span>

                  <input
                    type="text"
                    value={busNumber}
                    autoComplete="off"
                    maxLength={20}
                    inputMode="text"
                    aria-autocomplete="list"
                    placeholder="Enter bus number"
                    onFocus={() =>
                      setActiveInput("bus")
                    }
                    onChange={(event) => {
                      setBusNumber(
                        sanitizeBusNo(
                          event.target.value
                        )
                      );

                      setValidationError("");
                    }}
                    className="h-12 w-full rounded-xl border border-[#E7E7EF] bg-white pl-14 pr-4 text-sm font-extrabold uppercase tracking-wide text-[#111827] outline-none transition placeholder:font-semibold placeholder:normal-case placeholder:tracking-normal placeholder:text-[#A3A8B5] hover:border-[#DDD8FA] focus:border-[#7667E8] focus:bg-[#FCFBFF] focus:ring-4 focus:ring-[#7667E8]/[0.08]"
                  />

                  {activeInput === "bus" &&
                    busSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[999] max-h-[230px] overflow-y-auto rounded-[14px] border border-[#E7E7EF] bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
                        {busSuggestions.map(
                          (bus) => (
                            <button
                              key={bus}
                              type="button"
                              onClick={() => {
                                setBusNumber(bus);
                                setActiveInput(
                                  null
                                );
                              }}
                              className="flex min-h-[44px] w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-left transition hover:bg-[#F4F2FF]"
                            >
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F4F2FF] text-[#7667E8]">
                                <i className="bi bi-bus-front-fill text-xs" />
                              </span>

                              <span className="text-sm font-extrabold tracking-wide text-[#374151]">
                                {bus}
                              </span>
                            </button>
                          )
                        )}
                      </div>
                    )}
                </div>
              </div>

              {/* =================================================
                  2. FROM + TO
              ================================================= */}

              <div className="grid gap-3 md:grid-cols-[1fr_44px_1fr] md:items-end">

                {/* FROM */}

                <div className="relative z-[80]">
                  <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#6B7280]">
                    From
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-[#F4F2FF] text-[#7667E8]">
                      <i className="bi bi-geo-alt-fill text-sm" />
                    </span>

                    <input
                      type="text"
                      value={startPoint}
                      autoComplete="off"
                      maxLength={60}
                      aria-autocomplete="list"
                      placeholder="Departure place"
                      onFocus={() =>
                        setActiveInput(
                          "departure"
                        )
                      }
                      onChange={(event) => {
                        setStartPoint(
                          sanitizeTyping(
                            event.target.value
                          )
                        );

                        setValidationError("");
                      }}
                      className="h-12 w-full rounded-xl border border-[#E7E7EF] bg-white pl-14 pr-4 text-sm font-semibold text-[#111827] outline-none transition placeholder:text-[#A3A8B5] hover:border-[#DDD8FA] focus:border-[#7667E8] focus:bg-[#FCFBFF] focus:ring-4 focus:ring-[#7667E8]/[0.08]"
                    />

                    {activeInput ===
                      "departure" &&
                      startSuggestions.length >
                        0 && (
                        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[999] max-h-[230px] overflow-y-auto rounded-[14px] border border-[#E7E7EF] bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
                          {startSuggestions.map(
                            (city) => (
                              <button
                                key={city}
                                type="button"
                                onClick={() => {
                                  setStartPoint(
                                    city
                                  );

                                  setActiveInput(
                                    null
                                  );
                                }}
                                className="flex min-h-[44px] w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-left text-xs font-semibold text-[#374151] transition hover:bg-[#F4F2FF] hover:text-[#7667E8]"
                              >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F4F2FF] text-[#7667E8]">
                                  <i className="bi bi-geo-alt-fill text-xs" />
                                </span>

                                <span className="truncate">
                                  {city}
                                </span>
                              </button>
                            )
                          )}
                        </div>
                      )}
                  </div>
                </div>

                {/* SWAP */}

                <div className="flex items-center justify-center md:pb-1">
                  <button
                    type="button"
                    aria-label="Swap departure and arrival"
                    aria-pressed={isSwapped}
                    title="Swap"
                    onClick={handleSwap}
                    className={`
                      flex h-10 w-10
                      items-center justify-center
                      rounded-full
                      border
                      outline-none
                      shadow-[0_4px_14px_rgba(118,103,232,0.08)]
                      transition-all
                      duration-200
                      hover:scale-[1.05]
                      active:scale-95
                      ${
                        isSwapped
                          ? "!border-[#6657D8] !bg-[#7667E8] !text-white rotate-180"
                          : "border-[#DDD8FA] bg-white text-[#7667E8] hover:bg-[#F4F2FF]"
                      }
                    `}
                  >
                    <i className="bi bi-arrow-down-up text-sm" />
                  </button>
                </div>

                {/* TO */}

                <div className="relative z-[70]">
                  <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#6B7280]">
                    To
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-[#F4F2FF] text-[#7667E8]">
                      <i className="bi bi-geo-fill text-sm" />
                    </span>

                    <input
                      type="text"
                      value={destination}
                      autoComplete="off"
                      maxLength={60}
                      aria-autocomplete="list"
                      placeholder="Arrival place"
                      onFocus={() =>
                        setActiveInput(
                          "arrival"
                        )
                      }
                      onChange={(event) => {
                        setDestination(
                          sanitizeTyping(
                            event.target.value
                          )
                        );

                        setValidationError("");
                      }}
                      className="h-12 w-full rounded-xl border border-[#E7E7EF] bg-white pl-14 pr-4 text-sm font-semibold text-[#111827] outline-none transition placeholder:text-[#A3A8B5] hover:border-[#DDD8FA] focus:border-[#7667E8] focus:bg-[#FCFBFF] focus:ring-4 focus:ring-[#7667E8]/[0.08]"
                    />

                    {activeInput ===
                      "arrival" &&
                      destinationSuggestions.length >
                        0 && (
                        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[999] max-h-[230px] overflow-y-auto rounded-[14px] border border-[#E7E7EF] bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
                          {destinationSuggestions.map(
                            (city) => (
                              <button
                                key={city}
                                type="button"
                                onClick={() => {
                                  setDestination(
                                    city
                                  );

                                  setActiveInput(
                                    null
                                  );
                                }}
                                className="flex min-h-[44px] w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-left text-xs font-semibold text-[#374151] transition hover:bg-[#F4F2FF] hover:text-[#7667E8]"
                              >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F4F2FF] text-[#7667E8]">
                                  <i className="bi bi-geo-fill text-xs" />
                                </span>

                                <span className="truncate">
                                  {city}
                                </span>
                              </button>
                            )
                          )}
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* =================================================
                  3. TIMING
              ================================================= */}

              <div className="relative z-[50]">
                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#6B7280]">
                  Timing
                  <span className="ml-1.5 text-[9px] font-semibold normal-case tracking-normal text-[#A3A8B5]">
                    optional
                  </span>
                </label>

                <button
                  type="button"
                  aria-expanded={
                    activeInput ===
                    "timeFilter"
                  }
                  aria-haspopup="listbox"
                  onClick={() =>
                    setActiveInput(
                      activeInput ===
                        "timeFilter"
                        ? null
                        : "timeFilter"
                    )
                  }
                  className="flex h-12 w-full items-center justify-between rounded-xl border border-[#E7E7EF] bg-white px-3.5 text-left text-sm font-semibold text-[#374151] outline-none transition hover:border-[#DDD8FA] focus:border-[#7667E8] focus:ring-4 focus:ring-[#7667E8]/[0.08]"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F4F2FF] text-[#7667E8]">
                      <i
                        className={`bi ${selectedTiming.icon} text-xs`}
                      />
                    </span>

                    <span className="truncate">
                      {selectedTiming.label}
                    </span>
                  </span>

                  <i
                    className={`bi bi-chevron-down ml-2 shrink-0 text-[#8B93A3] transition-transform duration-200 ${
                      activeInput ===
                      "timeFilter"
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {activeInput ===
                  "timeFilter" && (
                  <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[999] rounded-[14px] border border-[#E7E7EF] bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
                    {timingOptions.map(
                      (option) => (
                        <button
                          key={
                            option.id ||
                            "all"
                          }
                          type="button"
                          role="option"
                          aria-selected={
                            selectedTimeFilter ===
                            option.id
                          }
                          onClick={() => {
                            setSelectedTimeFilter(
                              option.id
                            );

                            setActiveInput(
                              null
                            );
                          }}
                          className={`flex min-h-[44px] w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left text-xs font-semibold transition ${
                            selectedTimeFilter ===
                            option.id
                              ? "bg-[#7667E8] text-white"
                              : "text-[#374151] hover:bg-[#F4F2FF] hover:text-[#7667E8]"
                          }`}
                        >
                          <i
                            className={`bi ${option.icon} w-5 text-center`}
                          />

                          {
                            option.label
                          }
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* =================================================
                  4. SEARCH
              ================================================= */}

              <button
                type="submit"
                className="
                  flex h-12 w-full
                  items-center justify-center
                  gap-2
                  rounded-xl
                  border-0
                  bg-gradient-to-br
                  from-[#8174EC]
                  to-[#6D5DDE]
                  text-sm
                  font-extrabold
                  text-white
                  shadow-[0_8px_20px_rgba(118,103,232,0.18)]
                  transition
                  hover:-translate-y-px
                  hover:shadow-[0_12px_26px_rgba(118,103,232,0.23)]
                  active:scale-[0.98]
                "
              >
                <i className="bi bi-search" />

                <span>
                  Search Buses
                </span>
              </button>

              {/* =================================================
                  SAVE
              ================================================= */}

              <div className="flex items-center justify-between gap-3 pt-0.5">
                <p className="text-[10px] font-medium text-[#A3A8B5]">
                  Bus number is required to find
                  the exact service.
                </p>

                <button
                  type="button"
                  onClick={
                    toggleSaveRoute
                  }
                  aria-label={
                    isCurrentRouteSaved
                      ? "Remove saved route"
                      : "Save route"
                  }
                  className={`
                    inline-flex
                    h-9
                    shrink-0
                    items-center
                    justify-center
                    gap-1.5
                    rounded-lg
                    border
                    px-3
                    text-[11px]
                    font-extrabold
                    outline-none
                    transition
                    active:scale-[0.98]
                    ${
                      isCurrentRouteSaved
                        ? "border-[#DDD8FA] bg-[#F4F2FF] text-[#6657D8]"
                        : "border-[#E7E7EF] bg-white text-[#374151] hover:border-[#DDD8FA] hover:bg-[#F7F8FC]"
                    }
                  `}
                >
                  <i
                    className={`bi ${
                      isCurrentRouteSaved
                        ? "bi-bookmark"
                        : "bi-bookmark"
                    }`}
                  />

                  <span>
                    {isCurrentRouteSaved
                      ? "Saved"
                      : "Save Route"}
                  </span>
                </button>
              </div>

            </form>
          </div>
        </section>

        {/* =====================================================
            QUICK INFO
        ====================================================== */}

        {!hasSearched && (
          <section className="mx-auto max-w-4xl px-5 pb-16 pt-8 sm:px-8 sm:pt-10 lg:px-10">
            <div className="grid gap-3 sm:grid-cols-3">

              <div className="rounded-2xl border border-[#E7E7EF] bg-white p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F4F2FF] text-[#7667E8]">
                  <i className="bi bi-bus-front-fill text-sm" />
                </div>

                <h3 className="mt-3 text-xs font-extrabold text-[#111827]">
                  Search by bus number
                </h3>

                <p className="mt-1.5 text-[10px] leading-4 text-[#8B93A3]">
                  Select the bus service number from
                  the suggestions.
                </p>
              </div>

              <div className="rounded-2xl border border-[#E7E7EF] bg-white p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F4F2FF] text-[#7667E8]">
                  <i className="bi bi-signpost-2-fill text-sm" />
                </div>

                <h3 className="mt-3 text-xs font-extrabold text-[#111827]">
                  Choose your route
                </h3>

                <p className="mt-1.5 text-[10px] leading-4 text-[#8B93A3]">
                  Select your departure and destination
                  from the live list.
                </p>
              </div>

              <div className="rounded-2xl border border-[#E7E7EF] bg-white p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F4F2FF] text-[#7667E8]">
                  <i className="bi bi-clock-history text-sm" />
                </div>

                <h3 className="mt-3 text-xs font-extrabold text-[#111827]">
                  Filter by timing
                </h3>

                <p className="mt-1.5 text-[10px] leading-4 text-[#8B93A3]">
                  Narrow the service by morning, afternoon,
                  evening or night.
                </p>
              </div>

            </div>
          </section>
        )}

        {/* =====================================================
            SAVED ROUTES
        ====================================================== */}

        {user &&
          savedRoutes.length > 0 && (
            <section className="mx-auto max-w-4xl px-5 pb-8 sm:px-8 lg:px-10">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <i className="bi bi-save-fill text-[#7667E8]" />

                    <h2 className="text-sm font-extrabold text-[#111827]">
                      Saved Routes
                    </h2>
                  </div>

                  <p className="mt-1 text-[10px] font-medium text-[#8B93A3]">
                    Tap a saved route to fill the search.
                  </p>
                </div>

                <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#F4F2FF] px-2 text-[10px] font-extrabold text-[#6657D8]">
                  {savedRoutes.length}
                </span>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {savedRoutes.map(
                  (route) => (
                    <div
                      key={route.id}
                      className="flex min-w-[250px] items-center gap-3 rounded-2xl border border-[#E7E7EF] bg-white p-3 shadow-[0_5px_18px_rgba(17,24,39,0.035)]"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleUseRoute(
                            route
                          )
                        }
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F4F2FF] text-[#7667E8]">
                          <i className="bi bi-bus-front-fill text-sm" />
                        </span>

                        <span className="min-w-0">
                          <span className="block truncate text-[11px] font-extrabold text-[#111827]">
                            {route.start} →{" "}
                            {route.dest}
                          </span>

                          <span className="mt-1 block truncate text-[10px] font-semibold text-[#8B93A3]">
                            Bus{" "}
                            {route.bus ||
                              "—"}
                          </span>
                        </span>
                      </button>

                      <button
                        type="button"
                        aria-label="Remove saved route"
                        onClick={(
                          event
                        ) =>
                          removeSavedRoute(
                            event,
                            route.id
                          )
                        }
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#8B93A3] transition hover:bg-red-50 hover:text-red-500"
                      >
                        <i className="bi bi-x text-base" />
                      </button>
                    </div>
                  )
                )}
              </div>
            </section>
          )}

        {/* =====================================================
            RESULTS
        ====================================================== */}

        {hasSearched && (
          <section
            aria-live="polite"
            className="mx-auto max-w-4xl px-5 pb-20 pt-10 sm:px-8 lg:px-10"
          >

            {/* RESULTS HEADER */}

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F4F2FF] text-[#7667E8]">
                    <i className="bi bi-signpost-split text-sm" />
                  </span>

                  <h2 className="text-lg font-extrabold tracking-tight text-[#111827]">
                    Bus Results
                  </h2>
                </div>

                <p className="mt-1 pl-10 text-[11px] font-semibold text-[#8B93A3]">
                  {matchedRoutes.length}{" "}
                  {matchedRoutes.length === 1
                    ? "bus"
                    : "buses"}{" "}
                  found
                </p>
              </div>

              <button
                type="button"
                onClick={clearSearch}
                className="self-start rounded-lg px-2 py-1 text-[11px] font-extrabold text-[#6657D8] transition hover:bg-[#F4F2FF]"
              >
                Clear search
              </button>
            </div>

            {/* RESULTS */}

            {matchedRoutes.length >
            0 ? (
              <div className="space-y-4">

                {matchedRoutes.map(
                  (route) => {
                    const expanded =
                      expandedBusId ===
                      route.id;

                    return (
                      <div
                        key={route.id}
                        className="overflow-hidden rounded-2xl border border-[#E7E7EF] bg-white shadow-[0_8px_28px_rgba(17,24,39,0.045)]"
                      >

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedBusId(
                              expanded
                                ? null
                                : route.id
                            )
                          }
                          className="block w-full text-left outline-none"
                          aria-expanded={
                            expanded
                          }
                        >
                          <BusResultCard
                            bus={route.bus}
                            start={
                              route.start
                            }
                            dest={
                              route.dest
                            }
                            time={
                              route.time
                            }
                            arrivalTime={
                              route.arrivalTime
                            }
                            km={
                              route.km
                            }
                            duration={
                              route.duration
                            }
                            type={
                              route.type
                            }
                            slot={
                              route.slot
                            }
                            basePrice={
                              route.basePrice
                            }
                            seats={
                              route.seats
                            }
                            isDark={false}
                            isMinimal={
                              !expanded
                            }
                          />
                        </button>

                        {expanded && (
                          <div className="border-t border-[#E7E7EF] bg-[#FAFAFD] p-3 sm:p-4">
                            <BusStoppingCard
                              stops={
                                route.stops
                              }
                              isDark={
                                false
                              }
                            />
                          </div>
                        )}

                      </div>
                    );
                  }
                )}

                {/* EXISTING DPI TOGGLE */}

                <div className="flex justify-end pt-1">
                  <DpiToggle
                    checked={
                      isEnabled
                    }
                    onChange={
                      setIsEnabled
                    }
                    label="Toggle"
                  />
                </div>

              </div>
            ) : (
              <div className="rounded-[22px] border border-[#E7E7EF] bg-white px-6 py-12 text-center shadow-[0_8px_28px_rgba(17,24,39,0.04)]">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4F2FF] text-2xl text-[#7667E8]">
                  <i className="bi bi-bus-front" />
                </div>

                <h3 className="mt-4 text-base font-extrabold text-[#111827]">
                  No Bus Found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#8B93A3]">
                  No approved bus service matches
                  this bus number and route.
                  Check your details and try again.
                </p>

                <button
                  type="button"
                  onClick={
                    clearSearch
                  }
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-[#7667E8] px-5 text-xs font-extrabold text-white transition hover:bg-[#6657D8] active:scale-[0.98]"
                >
                  <i className="bi bi-arrow-left mr-2" />
                  Search Again
                </button>

              </div>
            )}

          </section>
        )}

      </main>
    </div>
  );
};

export default HomePage;