import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase.jsx';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

import logo from './assets/orginal logo.svg';

const Navbar = ({ isDark }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userInitials, setUserInitials] = useState('');

    useEffect(() => {
        let unsubscribeUser = null;

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            // Remove previous Firestore listener when user changes
            if (unsubscribeUser) {
                unsubscribeUser();
                unsubscribeUser = null;
            }

            if (user) {
                setIsAuthenticated(true);

                // Listen for realtime profile changes
                const userRef = doc(db, 'users', user.uid);

                unsubscribeUser = onSnapshot(
                    userRef,
                    (docSnap) => {
                        if (docSnap.exists()) {
                            const data = docSnap.data();

                            const first = data.firstName?.[0] || 'U';
                            const last = data.lastName?.[0] || '';

                            setUserInitials(
                                (first + last).toUpperCase()
                            );
                        } else {
                            setUserInitials('U');
                        }
                    },
                    (err) => {
                        console.error(
                            'Navbar profile snapshot error:',
                            err
                        );

                        setUserInitials('U');
                    }
                );
            } else {
                setIsAuthenticated(false);
                setUserInitials('');
            }
        });

        return () => {
            unsubscribeAuth();

            if (unsubscribeUser) {
                unsubscribeUser();
            }
        };
    }, []);

    return (
        <nav
            className={`
                shadow-sm
                px-4 md:px-8
                py-3.5
                flex
                items-center
                justify-between
                sticky
                top-0
                z-50
                w-full
                border-b
                transition-all
                duration-300
                ${
                    isDark
                        ? 'bg-gray-900/95 backdrop-blur-md border-gray-800'
                        : 'bg-white/95 backdrop-blur-md border-gray-100'
                }
            `}
        >

            {/* ─────────────────────────────
                DPI ONE BRAND
            ───────────────────────────── */}
            <div className="flex items-center gap-2.5">

                {/* Logo */}
                <img
                    src={logo}
                    alt="DPI One"
                    className="h-9 md:h-10 w-auto object-contain"
                />

                {/* Beta + Version */}
                <div className="flex items-center gap-1.5">

                    <span
                        className={`
                            inline-flex
                            items-center
                            rounded-md
                            px-2
                            py-0.5
                            text-[9px]
                            md:text-[10px]
                            font-extrabold
                            tracking-wide
                            uppercase
                            border
                            ${
                                isDark
                                    ? 'bg-brand/15 text-purple-300 border-brand/30'
                                    : 'bg-brand/10 text-brand border-brand/20'
                            }
                        `}
                    >
                        Beta
                    </span>

                    <span
                        className={`
                            hidden sm:inline
                            text-[9px]
                            md:text-[10px]
                            font-semibold
                            tracking-wide
                            ${
                                isDark
                                    ? 'text-gray-500'
                                    : 'text-gray-400'
                            }
                        `}
                    >
                        v1.0.0
                    </span>

                </div>
            </div>


            {/* ─────────────────────────────
                USER AREA
            ───────────────────────────── */}
            <div className="flex items-center gap-4">

                {isAuthenticated ? (
                    <>
                        {/* Welcome text - desktop only */}
                        <span
                            className={`
                                hidden md:block
                                text-xs
                                font-bold
                                ${
                                    isDark
                                        ? 'text-gray-400'
                                        : 'text-gray-500'
                                }
                            `}
                        >
                            Welcome back!
                        </span>

                        {/* User initials */}
                        <div
                            className="
                                w-9
                                h-9
                                bg-gradient-custom
                                rounded-full
                                flex
                                items-center
                                justify-center
                                text-white
                                text-xs
                                font-bold
                                shadow-sm
                                cursor-pointer
                                hover:shadow-md
                                transition-shadow
                                uppercase
                            "
                        >
                            {userInitials}
                        </div>
                    </>
                ) : (

                    /* Logged-out user icon */
                    <div
                        className={`
                            w-9
                            h-9
                            rounded-full
                            flex
                            items-center
                            justify-center
                            text-sm
                            shadow-sm
                            ${
                                isDark
                                    ? 'bg-gray-800 text-gray-500'
                                    : 'bg-gray-100 text-gray-400'
                            }
                        `}
                    >
                        <i className="bi bi-person-fill"></i>
                    </div>

                )}

            </div>

        </nav>
    );
};

export default Navbar;