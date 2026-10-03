import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { db } from "./firebase.jsx";

import {
  collection,
  getDocs,
  limit,
  query,
  startAfter,
  where,
} from "firebase/firestore";

import BusResultCard from "./BusResultCard.jsx";
import BusStoppingCard from "./BusStoppingCard.jsx";

import whiteLogo from "./assets/white color logo.svg";


/* =========================================================
   CONSTANTS
========================================================= */

const PAGE_SIZE = 20;


/* =========================================================
   SANITIZATION
========================================================= */

const sanitizeSearch = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[^a-zA-Z0-9\u0B80-\u0BFF\s\-\/\.,]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 40);
};


const sanitizeField = (
  value,
  maxLength = 100
) => {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/[<>"'`\\;=(){}\[\]|&]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, maxLength);
};


const sanitizeBusNumber = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .toUpperCase()
    .replace(/[^A-Z0-9\s\-\/]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 20);
};


/* =========================================================
   FIRESTORE DOCUMENT SANITIZER
========================================================= */

const sanitizeBusDoc = (snapshot) => {
  const data = snapshot.data() || {};

  return {
    id: snapshot.id,

    bus: sanitizeBusNumber(data.bus),

    start: sanitizeField(data.start, 60),

    dest: sanitizeField(data.dest, 60),

    type: ["Private", "Govt Bus"].includes(data.type)
      ? data.type
      : "Private",

    slot: [
      "Morning",
      "Afternoon",
      "Evening",
      "Night",
    ].includes(data.slot)
      ? data.slot
      : "Morning",

    time: sanitizeField(data.time, 20),

    arrivalTime: sanitizeField(
      data.arrivalTime,
      20
    ),

    km: sanitizeField(data.km, 20),

    duration: sanitizeField(
      data.duration,
      20
    ),

    basePrice:
      typeof data.basePrice === "number" &&
      data.basePrice >= 0
        ? data.basePrice
        : 0,

    seats:
      typeof data.seats === "number"
        ? data.seats
        : 30,

    status: data.status || "",

    createdAt: data.createdAt || null,

    stops: Array.isArray(data.stops)
      ? data.stops.map((stop) => ({
          name: sanitizeField(
            stop?.name,
            50
          ),

          time: sanitizeField(
            stop?.time,
            20
          ),

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
   SEARCH RANKING
========================================================= */

const rankRoutes = (
  routes,
  searchTerm
) => {
  if (!searchTerm) {
    return routes;
  }

  const term = searchTerm
    .trim()
    .toLowerCase();

  if (!term) {
    return routes;
  }

  return routes
    .map((route) => {
      let score = 0;

      const bus =
        route.bus?.toLowerCase() || "";

      const start =
        route.start?.toLowerCase() || "";

      const dest =
        route.dest?.toLowerCase() || "";


      /* -----------------------------------------------
         BUS NUMBER
      ----------------------------------------------- */

      if (bus === term) {
        score += 100;
      } else if (bus.startsWith(term)) {
        score += 50;
      } else if (bus.includes(term)) {
        score += 10;
      }


      /* -----------------------------------------------
         START / DESTINATION
      ----------------------------------------------- */

      if (
        start === term ||
        dest === term
      ) {
        score += 80;
      } else if (
        start.startsWith(term) ||
        dest.startsWith(term)
      ) {
        score += 40;
      } else if (
        start.includes(term) ||
        dest.includes(term)
      ) {
        score += 20;
      }


      /* -----------------------------------------------
         STOPS
      ----------------------------------------------- */

      route.stops.forEach((stop) => {
        const stopName =
          stop?.name?.toLowerCase() || "";

        if (stopName === term) {
          score += 60;
        } else if (
          stopName.startsWith(term)
        ) {
          score += 30;
        } else if (
          stopName.includes(term)
        ) {
          score += 5;
        }
      });


      return {
        ...route,
        _score: score,
      };
    })
    .filter(
      (route) => route._score > 0
    )
    .sort(
      (a, b) =>
        b._score - a._score
    );
};


/* =========================================================
   SEARCH BAR
========================================================= */

const SearchBar = memo(
  ({
    isDark,
    value,
    onChange,
    onClear,
  }) => {
    return (
      <div className="relative">

        {/* Search Icon */}
        <i
          className={`
            bi bi-search
            pointer-events-none
            absolute
            left-4
            top-1/2
            z-10
            -translate-y-1/2
            text-sm
            ${
              value
                ? "text-[#6D5CE7]"
                : isDark
                ? "text-gray-500"
                : "text-[#9997A8]"
            }
          `}
        />

        {/* Search Input */}
        <input
          type="search"
          id="exploreSearch"
          role="searchbox"
          aria-label="Search bus, city or stop"
          value={value}
          onChange={(event) =>
            onChange(
              sanitizeSearch(
                event.target.value
              )
            )
          }
          placeholder="Search bus, city or stop..."
          maxLength={40}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          className={`
            h-[56px]
            w-full
            rounded-[16px]
            border
            py-3
            pl-11
            pr-12
            text-sm
            font-semibold
            outline-none
            transition
            placeholder:text-[#9997A8]
            ${
              isDark
                ? "border-gray-800 bg-gray-900 text-white focus:border-[#6D5CE7]"
                : "border-[#EAE9F1] bg-white text-[#17162A] shadow-[0_4px_16px_rgba(24,20,60,0.035)] focus:border-[#6D5CE7]"
            }
          `}
        />

        {/* Clear Search */}
        {value && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className={`
              absolute
              right-3
              top-1/2
              flex
              h-8
              w-8
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              transition
              ${
                isDark
                  ? "text-gray-500 hover:bg-gray-800 hover:text-red-400"
                  : "text-[#9997A8] hover:bg-[#FFF0F0] hover:text-[#C94343]"
              }
            `}
          >
            <i className="bi bi-x-circle-fill text-xs" />
          </button>
        )}

      </div>
    );
  }
);

SearchBar.displayName = "SearchBar";


/* =========================================================
   HERO
========================================================= */

const ExploreHero = memo(() => {
  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[24px]
        bg-gradient-to-br
        from-[#8274F2]
        via-[#6D5CE7]
        to-[#5645D2]
        px-[clamp(20px,3vw,34px)]
        py-[clamp(24px,3vw,34px)]
        text-white
        shadow-[0_2px_8px_rgba(23,18,56,0.18),0_22px_42px_rgba(86,69,210,0.25)]
      "
    >

      {/* Decorative Circle */}
      <div
        className="
          pointer-events-none
          absolute
          -right-20
          -top-24
          h-64
          w-64
          rounded-full
          bg-white/[0.07]
          blur-2xl
        "
      />

      {/* Decorative Circle */}
      <div
        className="
          pointer-events-none
          absolute
          -bottom-20
          -right-10
          h-48
          w-48
          rounded-full
          bg-white/[0.045]
          blur-2xl
        "
      />


      {/* Curved Route */}
      <svg
        className="
          pointer-events-none
          absolute
          bottom-0
          right-0
          w-[clamp(150px,20vw,280px)]
          opacity-[0.16]
        "
        viewBox="0 0 190 120"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="
            M -10 95
            C 30 95, 40 40, 75 40
            S 120 85, 155 60
            S 175 20, 205 20
          "
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="1 9"
        />

        <circle
          cx="-2"
          cy="94.5"
          r="5"
          fill="white"
        />

        <circle
          cx="75"
          cy="40"
          r="4"
          fill="white"
          opacity=".8"
        />

        <circle
          cx="155"
          cy="60"
          r="4"
          fill="white"
          opacity=".8"
        />

        <circle
          cx="197"
          cy="21"
          r="5"
          fill="white"
        />
      </svg>


      {/* Hero Content */}
      <div className="relative z-10">

        {/* White Logo + Badge */}
        <div className="mb-4 flex items-center gap-3">

          <img
            src={whiteLogo}
            alt="DPI One"
            className="
              h-8
              w-auto
              max-w-[120px]
              object-contain
            "
          />

          <span
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-full
              border
              border-white/20
              bg-white/10
              px-2.5
              py-1.5
              text-[9px]
              font-bold
              tracking-wide
              text-white/90
              backdrop-blur-md
            "
          >
            <i className="bi bi-geo-alt-fill" />
            Dharmapuri Bus Network
          </span>

        </div>


        {/* Hero Title */}
        <h1
          className="
            max-w-[700px]
            text-[clamp(22px,2.5vw,36px)]
            font-extrabold
            leading-[1.12]
            tracking-[-0.045em]
          "
        >
          Explore DPI One
        </h1>


        {/* Hero Description */}
        <p
          className="
            mt-2
            max-w-[600px]
            text-[clamp(12px,1vw,15px)]
            font-medium
            leading-6
            text-white/85
          "
        >
          Find bus routes, stops and schedules
          across Dharmapuri.
        </p>

      </div>

    </section>
  );
});

ExploreHero.displayName = "ExploreHero";


/* =========================================================
   SKELETON
========================================================= */

const SkeletonLoader = memo(
  ({ isDark }) => {
    const cardClass = isDark
      ? "border-gray-800 bg-gray-900/70"
      : "border-[#EAE9F1] bg-white";

    const blockClass = isDark
      ? "bg-gray-800"
      : "bg-gray-100";

    return (
      <div
        className="
          grid
          gap-3
          md:grid-cols-2
          md:gap-4
          animate-pulse
        "
        aria-busy="true"
      >

        {[1, 2, 3, 4].map(
          (item) => (
            <div
              key={item}
              className={`
                rounded-[18px]
                border
                p-5
                ${cardClass}
              `}
            >

              <div className="flex items-center justify-between">

                <div
                  className={`
                    h-8
                    w-16
                    rounded-lg
                    ${blockClass}
                  `}
                />

                <div
                  className={`
                    h-9
                    w-9
                    rounded-full
                    ${blockClass}
                  `}
                />

              </div>


              <div className="mt-6 grid grid-cols-[1fr_80px_1fr] gap-2">

                <div>

                  <div
                    className={`
                      h-3
                      w-12
                      rounded
                      ${blockClass}
                    `}
                  />

                  <div
                    className={`
                      mt-2
                      h-5
                      w-24
                      rounded
                      ${blockClass}
                    `}
                  />

                </div>


                <div
                  className={`
                    mt-4
                    h-4
                    rounded
                    ${blockClass}
                  `}
                />


                <div>

                  <div
                    className={`
                      ml-auto
                      h-3
                      w-12
                      rounded
                      ${blockClass}
                    `}
                  />

                  <div
                    className={`
                      ml-auto
                      mt-2
                      h-5
                      w-24
                      rounded
                      ${blockClass}
                    `}
                  />

                </div>

              </div>


              <div
                className={`
                  mt-5
                  h-px
                  ${blockClass}
                `}
              />


              <div className="mt-4 grid grid-cols-3 gap-3">

                {[1, 2, 3].map(
                  (value) => (
                    <div
                      key={value}
                      className="space-y-2"
                    >

                      <div
                        className={`
                          h-3
                          w-16
                          rounded
                          ${blockClass}
                        `}
                      />

                      <div
                        className={`
                          h-4
                          w-20
                          rounded
                          ${blockClass}
                        `}
                      />

                    </div>
                  )
                )}

              </div>

            </div>
          )
        )}

        <span className="sr-only">
          Loading routes...
        </span>

      </div>
    );
  }
);

SkeletonLoader.displayName = "SkeletonLoader";


/* =========================================================
   ERROR STATE
========================================================= */

const ErrorState = memo(
  ({
    fetchError,
    isDark,
    onRetry,
  }) => {
    return (
      <div
        className={`
          flex
          flex-col
          items-center
          justify-center
          rounded-[24px]
          border
          px-5
          py-16
          text-center
          ${
            isDark
              ? "border-gray-800 bg-gray-900/40"
              : "border-[#EAE9F1] bg-white"
          }
        `}
      >

        <div
          className={`
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            text-2xl
            ${
              isDark
                ? "bg-gray-800 text-red-400"
                : "bg-[#FFF0F0] text-[#C94343]"
            }
          `}
        >
          <i className="bi bi-wifi-off" />
        </div>


        <h2
          className={`
            mt-4
            text-sm
            font-extrabold
            ${
              isDark
                ? "text-white"
                : "text-[#17162A]"
            }
          `}
        >
          Could not load routes
        </h2>


        <p
          className={`
            mt-2
            max-w-[280px]
            text-xs
            leading-5
            ${
              isDark
                ? "text-gray-500"
                : "text-[#9997A8]"
            }
          `}
        >
          {fetchError}
        </p>


        <button
          type="button"
          onClick={onRetry}
          className="
            mt-5
            inline-flex
            h-10
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[#6D5CE7]
            px-5
            text-xs
            font-extrabold
            text-white
            transition
            hover:bg-[#5645D2]
            active:scale-[0.97]
          "
        >
          <i className="bi bi-arrow-clockwise" />
          Retry Connection
        </button>

      </div>
    );
  }
);

ErrorState.displayName = "ErrorState";


/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = memo(
  ({
    isDark,
    searchQuery,
    onClear,
  }) => {
    return (
      <div
        className={`
          flex
          flex-col
          items-center
          justify-center
          rounded-[24px]
          border
          px-5
          py-16
          text-center
          ${
            isDark
              ? "border-gray-800 bg-gray-900/40"
              : "border-[#EAE9F1] bg-white"
          }
        `}
      >

        <div
          className={`
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-[18px]
            text-2xl
            ${
              isDark
                ? "bg-gray-800 text-[#A9A0F5]"
                : "bg-[#F1EFFC] text-[#6D5CE7]"
            }
          `}
        >
          <i className="bi bi-signpost-2" />
        </div>


        <h2
          className={`
            mt-4
            text-base
            font-extrabold
            ${
              isDark
                ? "text-white"
                : "text-[#17162A]"
            }
          `}
        >
          No routes found
        </h2>


        <p
          className={`
            mt-2
            max-w-[300px]
            text-xs
            leading-5
            ${
              isDark
                ? "text-gray-500"
                : "text-[#9997A8]"
            }
          `}
        >
          {searchQuery
            ? `We couldn't find an approved route matching "${searchQuery}".`
            : "There are no approved bus routes available right now."}
        </p>


        {searchQuery && (
          <button
            type="button"
            onClick={onClear}
            className="
              mt-5
              h-10
              rounded-xl
              bg-[#6D5CE7]
              px-5
              text-xs
              font-extrabold
              text-white
              transition
              hover:bg-[#5645D2]
              active:scale-[0.97]
            "
          >
            Clear Search
          </button>
        )}

      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";


/* =========================================================
   EXPLORE PAGE
========================================================= */

const ExplorePage = ({
  isDark = false,
}) => {

  /* =======================================================
     SEARCH STATE
  ====================================================== */

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState("");


  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          setDebouncedSearch(
            searchQuery
          );
        },
        300
      );

    return () =>
      window.clearTimeout(timer);
  }, [searchQuery]);


  /* =======================================================
     ROUTE DATA
  ====================================================== */

  const [buses, setBuses] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [
    isLoadingMore,
    setIsLoadingMore,
  ] = useState(false);

  const [fetchError, setFetchError] =
    useState(null);


  /* =======================================================
     PAGINATION
  ====================================================== */

  const [lastDoc, setLastDoc] =
    useState(null);

  const [hasMore, setHasMore] =
    useState(true);

  const [retryCount, setRetryCount] =
    useState(0);

  const fetchIdRef = useRef(0);

  const observerTarget =
    useRef(null);


  /* =======================================================
     EXPAND / COLLAPSE
  ====================================================== */

  const [
    expandedBusId,
    setExpandedBusId,
  ] = useState(null);


  const toggleExpanded =
    useCallback((busId) => {
      setExpandedBusId(
        (previous) =>
          previous === busId
            ? null
            : busId
      );
    }, []);


  /* =======================================================
     FETCH APPROVED ROUTES
  ====================================================== */

  const fetchRoutes =
    useCallback(
      async ({
        isLoadMore = false,
        currentCursor = null,
      } = {}) => {

        const currentFetchId =
          ++fetchIdRef.current;


        if (isLoadMore) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
          setFetchError(null);
          setHasMore(true);
          setLastDoc(null);
          setExpandedBusId(null);
        }


        try {

          const firestoreQuery =
            query(
              collection(
                db,
                "busRoutes"
              ),

              where(
                "status",
                "==",
                "approved"
              ),

              ...(isLoadMore &&
              currentCursor
                ? [
                    startAfter(
                      currentCursor
                    ),
                  ]
                : []),

              limit(PAGE_SIZE)
            );


          const snapshot =
            await getDocs(
              firestoreQuery
            );


          /* Ignore stale request */
          if (
            currentFetchId !==
            fetchIdRef.current
          ) {
            return;
          }


          const fetchedRoutes =
            snapshot.docs.map(
              sanitizeBusDoc
            );


          setBuses(
            (previous) => {

              if (!isLoadMore) {
                return fetchedRoutes;
              }


              const existingIds =
                new Set(
                  previous.map(
                    (item) => item.id
                  )
                );


              const uniqueRoutes =
                fetchedRoutes.filter(
                  (item) =>
                    !existingIds.has(
                      item.id
                    )
                );


              return [
                ...previous,
                ...uniqueRoutes,
              ];
            }
          );


          /* Pagination */
          if (
            snapshot.docs.length > 0
          ) {

            setLastDoc(
              snapshot.docs[
                snapshot.docs.length - 1
              ]
            );


            setHasMore(
              snapshot.docs.length >=
                PAGE_SIZE
            );

          } else {

            setHasMore(false);

          }

        } catch (error) {

          if (
            currentFetchId !==
            fetchIdRef.current
          ) {
            return;
          }


          console.error(
            "Explore fetch error:",
            error
          );


          setFetchError(
            "Connection failed. Please check your network and try again."
          );

        } finally {

          if (
            currentFetchId ===
            fetchIdRef.current
          ) {

            setIsLoading(false);

            setIsLoadingMore(
              false
            );

          }

        }
      },
      []
    );


  /* =======================================================
     INITIAL LOAD
  ====================================================== */

  useEffect(() => {

    fetchRoutes({
      isLoadMore: false,
      currentCursor: null,
    });

  }, [
    fetchRoutes,
    retryCount,
  ]);


  /* =======================================================
     INFINITE SCROLL
  ====================================================== */

  useEffect(() => {

    const target =
      observerTarget.current;

    if (!target) {
      return undefined;
    }


    const observer =
      new IntersectionObserver(
        (entries) => {

          const first =
            entries[0];


          if (
            first?.isIntersecting &&
            hasMore &&
            !isLoading &&
            !isLoadingMore &&
            lastDoc
          ) {

            fetchRoutes({
              isLoadMore: true,
              currentCursor:
                lastDoc,
            });

          }

        },
        {
          rootMargin: "260px",
          threshold: 0.01,
        }
      );


    observer.observe(target);


    return () =>
      observer.disconnect();

  }, [
    hasMore,
    isLoading,
    isLoadingMore,
    lastDoc,
    fetchRoutes,
  ]);


  /* =======================================================
     SEARCHED / RANKED ROUTES
  ====================================================== */

  const visibleBuses =
    useMemo(() => {

      if (!debouncedSearch) {
        return buses;
      }

      return rankRoutes(
        buses,
        debouncedSearch
      );

    }, [
      buses,
      debouncedSearch,
    ]);


  /* =======================================================
     CLEAR SEARCH
  ====================================================== */

  const clearSearch =
    useCallback(() => {

      setSearchQuery("");
      setDebouncedSearch("");
      setExpandedBusId(null);

    }, []);


  /* =======================================================
     SECTION TITLE
  ====================================================== */

  const sectionTitle =
    debouncedSearch
      ? "Search Results"
      : "All Routes";


  /* =======================================================
     RENDER
  ====================================================== */

  return (
    <div
      className={`
        min-h-full
        w-full
        overflow-x-hidden
        font-[Montserrat,sans-serif]
        ${
          isDark
            ? "bg-[#0A0A0D] text-white"
            : "bg-[#FBFBFD] text-[#17162A]"
        }
      `}
    >

      <main
        className="
          mx-auto
          w-full
          max-w-[1180px]
          px-[clamp(14px,2.5vw,32px)]
          py-[clamp(20px,3vw,34px)]
          pb-10
        "
      >

        {/* =================================================
            HERO
        ================================================= */}

        <ExploreHero />


        {/* =================================================
            SEARCH
        ================================================= */}

        <section
          aria-label="Search bus routes"
          className="mt-5"
        >

          <SearchBar
            isDark={isDark}
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={clearSearch}
          />

        </section>


        {/* =================================================
            SECTION HEADER
        ================================================= */}

        <div
          className="
            mt-7
            flex
            flex-wrap
            items-center
            justify-between
            gap-2
            px-0.5
          "
        >

          <span
            className={`
              text-[10px]
              font-extrabold
              uppercase
              tracking-[0.07em]
              ${
                isDark
                  ? "text-gray-400"
                  : "text-[#5B5A6E]"
              }
            `}
          >
            {sectionTitle}
          </span>


          <span
            className={`
              text-[10px]
              font-bold
              ${
                isDark
                  ? "text-gray-600"
                  : "text-[#9997A8]"
              }
            `}
          >
            {debouncedSearch
              ? `${visibleBuses.length} matches`
              : `${buses.length} routes loaded`}
          </span>

        </div>


        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <section className="mt-3">

          {/* LOADING */}
          {isLoading && (
            <SkeletonLoader
              isDark={isDark}
            />
          )}


          {/* ERROR */}
          {!isLoading &&
            fetchError && (
              <ErrorState
                fetchError={fetchError}
                isDark={isDark}
                onRetry={() =>
                  setRetryCount(
                    (count) =>
                      count + 1
                  )
                }
              />
            )}


          {/* ROUTES */}
          {!isLoading &&
            !fetchError &&
            visibleBuses.length > 0 && (
              <>

                <div
                  role="list"
                  aria-label="Bus routes"
                  className="
                    grid
                    gap-3
                    md:grid-cols-2
                    md:gap-4
                  "
                >

                  {/* =================================================
                      ONE MAP ONLY
                  ================================================= */}

                  {visibleBuses.map((bus) => {

                    const expanded =
                      expandedBusId === bus.id;


                    return (
                      <article
                        key={bus.id}
                        role="listitem"
                        className="min-w-0"
                      >

                        <div
                          className={`
                            relative
                            rounded-[22px]
                            transition
                            ${
                              expanded
                                ? "ring-1 ring-[#6D5CE7]/20"
                                : ""
                            }
                          `}
                        >

                          {/* =================================================
                              MAIN BUS CARD
                          ================================================= */}

                          <BusResultCard
                            bus={bus.bus}
                            start={bus.start}
                            dest={bus.dest}
                            time={bus.time}
                            arrivalTime={
                              bus.arrivalTime
                            }
                            km={bus.km}
                            duration={
                              bus.duration
                            }
                            type={bus.type}
                            slot={bus.slot}
                            basePrice={
                              bus.basePrice
                            }
                            seats={
                              bus.seats
                            }
                            isDark={isDark}
                            isMinimal={true}
                          />


                          {/* =================================================
                              EXPAND BUTTON
                          ================================================= */}

                          <button
                            type="button"
                            onClick={() =>
                              toggleExpanded(
                                bus.id
                              )
                            }
                            aria-expanded={
                              expanded
                            }
                            aria-label={
                              expanded
                                ? `Hide stops for bus ${bus.bus}`
                                : `Show stops for bus ${bus.bus}`
                            }
                            className={`
                              absolute
                              right-3
                              top-3
                              z-30
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-full
                              border
                              transition-all
                              duration-200
                              ${
                                isDark
                                  ? "border-gray-700 bg-gray-900 text-[#A9A0F5] hover:bg-gray-800"
                                  : "border-[#DED9F4] bg-[#F7F5FF] text-[#6D5CE7] hover:bg-[#F1EFFC]"
                              }
                              ${
                                expanded
                                  ? "rotate-180"
                                  : ""
                              }
                            `}
                          >
                            <i className="bi bi-chevron-down text-xs" />
                          </button>


                          {/* =================================================
                              EXPANDED STOPS
                          ================================================= */}

                          {expanded && (
                            <div
                              className={`
                                mt-[-1px]
                                rounded-b-[22px]
                                border
                                border-t-0
                                px-4
                                pb-5
                                pt-4
                                sm:px-5
                                ${
                                  isDark
                                    ? "border-gray-800 bg-gray-900/70"
                                    : "border-[#EAE9F1] bg-[#FCFBFF]"
                                }
                              `}
                            >

                              <BusStoppingCard
                                stops={
                                  bus.stops || []
                                }
                                isDark={
                                  isDark
                                }
                              />

                            </div>
                          )}

                        </div>

                      </article>
                    );
                  })}

                </div>


                {/* =================================================
                    INFINITE SCROLL
                ================================================= */}

                <div
                  ref={observerTarget}
                  className="
                    flex
                    h-16
                    items-center
                    justify-center
                  "
                >

                  {isLoadingMore && (
                    <div
                      className={`
                        flex
                        items-center
                        gap-2
                        text-xs
                        font-bold
                        ${
                          isDark
                            ? "text-[#A9A0F5]"
                            : "text-[#6D5CE7]"
                        }
                      `}
                    >

                      <span
                        className="
                          h-3.5
                          w-3.5
                          animate-spin
                          rounded-full
                          border-2
                          border-current
                          border-t-transparent
                        "
                      />

                      Loading routes...

                    </div>
                  )}


                  {!isLoadingMore &&
                    !hasMore &&
                    buses.length > 0 && (
                      <span
                        className={`
                          text-[10px]
                          font-semibold
                          ${
                            isDark
                              ? "text-gray-700"
                              : "text-[#B2B0BD]"
                          }
                        `}
                      >
                        You've reached the end
                        of the directory.
                      </span>
                    )}

                </div>

              </>
            )}


          {/* EMPTY */}
          {!isLoading &&
            !fetchError &&
            visibleBuses.length === 0 && (
              <EmptyState
                isDark={isDark}
                searchQuery={
                  debouncedSearch
                }
                onClear={clearSearch}
              />
            )}

        </section>

      </main>

    </div>
  );
};


export default ExplorePage;