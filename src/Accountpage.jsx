import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
} from 'react';

import { useNavigate } from 'react-router-dom';

import deleteImage from './assets/delete.png';

import { auth, db } from './firebase.jsx';

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail,
    deleteUser,
    reauthenticateWithCredential,
    reauthenticateWithPopup,
    EmailAuthProvider,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    updateProfile,
} from 'firebase/auth';

import {
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    collection,
    query,
    where,
    onSnapshot,
    serverTimestamp,
} from 'firebase/firestore';


// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const sanitizeText = (str) =>
    typeof str === 'string'
        ? str.replace(/[<>"'`]/g, '').trim()
        : '';

const validateName = (name) =>
    /^[a-zA-Z\u0B80-\u0BFF\s'-]{1,50}$/.test(name.trim());

const validatePassword = (password) =>
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);

const extractName = (
    displayName,
    fallbackFirst = 'DPI',
    fallbackLast = 'User'
) => {
    if (!displayName?.trim()) {
        return {
            first: fallbackFirst,
            last: fallbackLast,
        };
    }

    const parts = displayName.trim().split(/\s+/);

    return {
        first: parts[0] || fallbackFirst,
        last:
            parts.length > 1
                ? parts.slice(1).join(' ')
                : fallbackLast,
    };
};

const getFriendlyError = (code) => {
    const errors = {
        'auth/email-already-in-use':
            'This email is already registered.',

        'auth/invalid-email':
            'Please enter a valid email address.',

        'auth/weak-password':
            'Password must contain 8 characters, uppercase, number and symbol.',

        'auth/user-not-found':
            'Incorrect email or password.',

        'auth/wrong-password':
            'Incorrect email or password.',

        'auth/invalid-credential':
            'Incorrect email or password.',

        'auth/too-many-requests':
            'Too many attempts. Please try again later.',

        'auth/requires-recent-login':
            'Please sign in again before performing this action.',

        'auth/popup-closed-by-user':
            'Google sign-in was cancelled.',

        'auth/network-request-failed':
            'Network error. Check your connection.',

        'permission-denied':
            'You do not have permission to perform this action.',
    };

    return (
        errors[code] ||
        'Something went wrong. Please try again.'
    );
};

const createRateLimiter = (
    maxAttempts = 5,
    windowMs = 5 * 60 * 1000
) => {
    let attempts = 0;
    let windowStart = Date.now();

    return {
        check() {
            const now = Date.now();

            if (now - windowStart > windowMs) {
                attempts = 0;
                windowStart = now;
            }

            if (attempts >= maxAttempts) {
                const waitMin = Math.ceil(
                    (windowMs - (now - windowStart)) / 60000
                );

                return {
                    allowed: false,
                    message: `Too many attempts. Wait ${waitMin} min.`,
                };
            }

            attempts++;

            return {
                allowed: true,
            };
        },

        reset() {
            attempts = 0;
            windowStart = Date.now();
        },
    };
};


// ─────────────────────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────────────────────

const Toast = ({
    message,
    type = 'info',
    onDismiss,
}) => {
    useEffect(() => {
        const timer = setTimeout(
            onDismiss,
            4500
        );

        return () => clearTimeout(timer);
    }, [onDismiss]);

    const styles = {
        success:
            'bg-green-600 border-green-500',

        error:
            'bg-red-600 border-red-500',

        warning:
            'bg-amber-500 border-amber-400',

        info:
            'bg-brand border-brand',
    };

    const icons = {
        success: 'bi-check-circle-fill',
        error: 'bi-exclamation-circle-fill',
        warning: 'bi-exclamation-triangle',
        info: 'bi-info-circle-fill',
    };

    return (
        <div
            role="alert"
            className={`
                fixed top-5
                right-4
                md:right-6
                z-[100]
                w-[calc(100%-2rem)]
                md:w-auto
                md:min-w-[320px]
                max-w-md
                px-4
                py-3
                rounded-2xl
                border
                shadow-2xl
                text-white
                fade-in
                ${styles[type] || styles.info}
            `}
        >
            <div className="flex items-center gap-3">
                <i
                    className={`bi ${icons[type] || icons.info} text-lg`}
                />

                <span className="flex-1 text-xs font-bold leading-relaxed">
                    {message}
                </span>

                <button
                    type="button"
                    onClick={onDismiss}
                    className="opacity-70 hover:opacity-100"
                    aria-label="Close notification"
                >
                    <i className="bi bi-x-lg text-xs" />
                </button>
            </div>
        </div>
    );
};


// ─────────────────────────────────────────────────────────────────────────────
// CONFIRM MODAL
// ─────────────────────────────────────────────────────────────────────────────

const ConfirmModal = ({
    title,
    message,
    confirmLabel = 'Confirm',
    dangerous = false,
    isDark,
    onConfirm,
    onCancel,
}) => {
    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 fade-in">

            <div
                className={`
                    w-full
                    max-w-md
                    rounded-[2rem]
                    p-6
                    md:p-7
                    shadow-2xl
                    border
                    ${
                        isDark
                            ? 'bg-gray-900 border-gray-800'
                            : 'bg-white border-gray-100'
                    }
                `}
            >

                {dangerous ? (
                    <div className="w-40 h-40 md:w-48 md:h-48 mx-auto mb-6 overflow-hidden flex items-center justify-center">
                        <img
                            src={deleteImage}
                            alt="Delete account"
                            className="w-full h-full object-contain"
                        />
                    </div>
                ) : (
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-brand/10 text-brand"
                    >
                        <i className="bi bi-question-circle-fill text-xl" />
                    </div>
                )}

                <h3
                    className={`
                        text-lg
                        font-black
                        mb-2
                        ${
                            dangerous
                                ? 'text-red-500 text-center'
                                : isDark
                                ? 'text-white'
                                : 'text-custom-dark'
                        }
                    `}
                >
                    {title}
                </h3>

                <p
                    className={`
                        text-sm
                        leading-relaxed
                        mb-7
                        ${
                            isDark
                                ? 'text-gray-400'
                                : 'text-gray-500'
                        }
                        ${dangerous ? 'text-center' : ''}
                    `}
                >
                    {message}
                </p>

                <div className="flex gap-3">

                    <button
                        type="button"
                        onClick={onCancel}
                        className={`
                            flex-1
                            py-3
                            rounded-xl
                            text-xs
                            font-black
                            border
                            ${
                                isDark
                                    ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }
                        `}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`
                            flex-1
                            py-3
                            rounded-xl
                            text-xs
                            font-black
                            text-white
                            ${
                                dangerous
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-brand hover:bg-brand-dark'
                            }
                        `}
                    >
                        {confirmLabel}
                    </button>

                </div>
            </div>
        </div>
    );
};


// ─────────────────────────────────────────────────────────────────────────────
// FORGOT PASSWORD MODAL
// ─────────────────────────────────────────────────────────────────────────────

const ForgotPasswordModal = ({
    prefillEmail,
    isDark,
    onClose,
}) => {
    const [resetEmail, setResetEmail] =
        useState(prefillEmail || '');

    const [loading, setLoading] =
        useState(false);

    const [sent, setSent] =
        useState(false);

    const [error, setError] =
        useState('');

    const handleSend = async () => {
        const cleanEmail =
            resetEmail.trim();

        if (!cleanEmail) {
            setError(
                'Please enter your email address.'
            );
            return;
        }

        setLoading(true);
        setError('');

        try {
            await sendPasswordResetEmail(
                auth,
                cleanEmail
            );

            setSent(true);
        } catch (err) {
            setError(
                getFriendlyError(err.code)
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 fade-in">

            <div
                className={`
                    w-full
                    max-w-md
                    rounded-[2rem]
                    p-6
                    md:p-7
                    border
                    shadow-2xl
                    ${
                        isDark
                            ? 'bg-gray-900 border-gray-800'
                            : 'bg-white border-gray-100'
                    }
                `}
            >

                <div className="flex items-center justify-between mb-6">

                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand mb-1">
                            Account Security
                        </p>

                        <h3
                            className={`
                                text-xl
                                font-black
                                ${
                                    isDark
                                        ? 'text-white'
                                        : 'text-custom-dark'
                                }
                            `}
                        >
                            Reset Password
                        </h3>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className={`
                            w-9
                            h-9
                            rounded-xl
                            flex
                            items-center
                            justify-center
                            ${
                                isDark
                                    ? 'bg-gray-800 text-gray-400'
                                    : 'bg-gray-100 text-gray-500'
                            }
                        `}
                    >
                        <i className="bi bi-x-lg text-xs" />
                    </button>

                </div>

                {!sent ? (
                    <>
                        <p
                            className={`
                                text-sm
                                leading-relaxed
                                mb-5
                                ${
                                    isDark
                                        ? 'text-gray-400'
                                        : 'text-gray-500'
                                }
                            `}
                        >
                            Enter your registered email and we'll send you a password reset link.
                        </p>

                        <input
                            type="email"
                            value={resetEmail}
                            onChange={(e) =>
                                setResetEmail(
                                    e.target.value
                                )
                            }
                            placeholder="you@example.com"
                            autoFocus
                            className={`
                                w-full
                                px-4
                                py-3.5
                                rounded-xl
                                text-sm
                                font-semibold
                                outline-none
                                border-2
                                focus:border-brand
                                ${
                                    isDark
                                        ? 'bg-gray-950 border-gray-800 text-white'
                                        : 'bg-gray-50 border-gray-200 text-gray-900'
                                }
                            `}
                        />

                        {error && (
                            <p className="text-xs text-red-500 font-bold mt-2">
                                {error}
                            </p>
                        )}

                        <div className="flex gap-3 mt-5">

                            <button
                                type="button"
                                onClick={onClose}
                                className={`
                                    flex-1
                                    py-3
                                    rounded-xl
                                    text-xs
                                    font-black
                                    border
                                    ${
                                        isDark
                                            ? 'border-gray-700 text-gray-300'
                                            : 'border-gray-200 text-gray-600'
                                    }
                                `}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleSend}
                                disabled={loading}
                                className="
                                    flex-1
                                    py-3
                                    rounded-xl
                                    bg-brand
                                    hover:bg-brand-dark
                                    text-white
                                    text-xs
                                    font-black
                                    disabled:opacity-50
                                "
                            >
                                {loading
                                    ? 'Sending…'
                                    : 'Send Link'}
                            </button>

                        </div>
                    </>
                ) : (
                    <div className="text-center py-4">

                        <div className="w-16 h-16 mx-auto rounded-3xl bg-green-100 text-green-600 flex items-center justify-center mb-5">
                            <i className="bi bi-envelope-check-fill text-2xl" />
                        </div>

                        <h4
                            className={`
                                text-lg
                                font-black
                                ${
                                    isDark
                                        ? 'text-white'
                                        : 'text-custom-dark'
                                }
                            `}
                        >
                            Check your inbox
                        </h4>

                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                            A password reset link has been sent to{' '}
                            <strong>
                                {resetEmail}
                            </strong>
                        </p>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full mt-6 py-3 rounded-xl bg-brand text-white text-xs font-black"
                        >
                            Done
                        </button>

                    </div>
                )}

            </div>
        </div>
    );
};


// ─────────────────────────────────────────────────────────────────────────────
// RE-AUTH MODAL
// ─────────────────────────────────────────────────────────────────────────────

const ReauthModal = ({
    currentUser,
    isDark,
    onSuccess,
    onClose,
}) => {
    const [password, setPassword] =
        useState('');

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState('');

    const providerId =
        currentUser?.providerData?.[0]
            ?.providerId;

    const isGoogle =
        providerId === 'google.com';

    const handlePasswordReauth =
        async () => {

            if (!password) {
                setError(
                    'Enter your current password.'
                );
                return;
            }

            setLoading(true);
            setError('');

            try {
                const credential =
                    EmailAuthProvider.credential(
                        currentUser.email,
                        password
                    );

                await reauthenticateWithCredential(
                    currentUser,
                    credential
                );

                onSuccess();

            } catch (err) {
                setError(
                    getFriendlyError(err.code)
                );
            } finally {
                setLoading(false);
            }
        };

    const handleGoogleReauth =
        async () => {

            setLoading(true);
            setError('');

            try {
                const provider =
                    new GoogleAuthProvider();

                await reauthenticateWithPopup(
                    currentUser,
                    provider
                );

                onSuccess();

            } catch (err) {

                if (
                    err.code !==
                    'auth/popup-closed-by-user'
                ) {
                    setError(
                        getFriendlyError(
                            err.code
                        )
                    );
                }

            } finally {
                setLoading(false);
            }
        };

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 fade-in">

            <div
                className={`
                    w-full
                    max-w-md
                    rounded-[2rem]
                    p-6
                    border
                    shadow-2xl
                    ${
                        isDark
                            ? 'bg-gray-900 border-gray-800'
                            : 'bg-white border-gray-100'
                    }
                `}
            >

                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-5">
                    <i className="bi bi-shield-lock-fill text-xl" />
                </div>

                <h3 className="text-xl font-black text-red-500">
                    Confirm Identity
                </h3>

                <p
                    className={`
                        text-sm
                        leading-relaxed
                        mt-2
                        mb-6
                        ${
                            isDark
                                ? 'text-gray-400'
                                : 'text-gray-500'
                        }
                    `}
                >
                    Re-authentication is required before permanently deleting your account.
                </p>

                {isGoogle ? (
                    <button
                        type="button"
                        onClick={handleGoogleReauth}
                        disabled={loading}
                        className="
                            w-full
                            py-3.5
                            rounded-xl
                            bg-brand
                            text-white
                            text-xs
                            font-black
                            disabled:opacity-50
                        "
                    >
                        {loading
                            ? 'Verifying…'
                            : 'Verify with Google'}
                    </button>
                ) : (
                    <>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                            placeholder="Current password"
                            autoFocus
                            className={`
                                w-full
                                px-4
                                py-3.5
                                rounded-xl
                                text-sm
                                font-semibold
                                outline-none
                                border-2
                                focus:border-red-500
                                ${
                                    isDark
                                        ? 'bg-gray-950 border-gray-800 text-white'
                                        : 'bg-gray-50 border-gray-200 text-gray-900'
                                }
                            `}
                        />

                        {error && (
                            <p className="text-xs text-red-500 font-bold mt-2">
                                {error}
                            </p>
                        )}

                        <div className="flex gap-3 mt-5">

                            <button
                                type="button"
                                onClick={onClose}
                                className={`
                                    flex-1
                                    py-3
                                    rounded-xl
                                    text-xs
                                    font-black
                                    border
                                    ${
                                        isDark
                                            ? 'border-gray-700 text-gray-300'
                                            : 'border-gray-200 text-gray-600'
                                    }
                                `}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handlePasswordReauth}
                                disabled={loading}
                                className="
                                    flex-1
                                    py-3
                                    rounded-xl
                                    bg-red-600
                                    hover:bg-red-700
                                    text-white
                                    text-xs
                                    font-black
                                    disabled:opacity-50
                                "
                            >
                                {loading
                                    ? 'Verifying…'
                                    : 'Confirm Delete'}
                            </button>

                        </div>
                    </>
                )}

                {isGoogle && (
                    <>
                        {error && (
                            <p className="text-xs text-red-500 font-bold mt-3 text-center">
                                {error}
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={onClose}
                            className={`
                                w-full
                                mt-3
                                py-3
                                rounded-xl
                                text-xs
                                font-black
                                border
                                ${
                                    isDark
                                        ? 'border-gray-700 text-gray-300'
                                        : 'border-gray-200 text-gray-600'
                                }
                            `}
                        >
                            Cancel
                        </button>
                    </>
                )}

            </div>
        </div>
    );
};


// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────────────────────

const StatCard = ({
    icon,
    label,
    value,
    isDark,
}) => (
    <div
        className={`
            rounded-2xl
            border
            p-4
            ${
                isDark
                    ? 'bg-gray-900 border-gray-800'
                    : 'bg-white border-gray-100'
            }
        `}
    >
        <div className="flex items-center gap-3">

            <div
                className={`
                    w-10
                    h-10
                    rounded-xl
                    flex
                    items-center
                    justify-center
                    bg-brand/10
                    text-brand
                `}
            >
                <i className={`bi ${icon}`} />
            </div>

            <div>
                <p
                    className={`
                        text-xl
                        font-black
                        ${
                            isDark
                                ? 'text-white'
                                : 'text-custom-dark'
                        }
                    `}
                >
                    {value}
                </p>

                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                    {label}
                </p>
            </div>

        </div>
    </div>
);


// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD ITEM
// ─────────────────────────────────────────────────────────────────────────────

const UploadItem = ({
    route,
    isDark,
    onDelete,
}) => {

    const status =
        route.status || 'pending';

    const statusClass =
        status === 'approved'
            ? 'bg-green-100 text-green-700'
            : status === 'rejected'
            ? 'bg-red-100 text-red-600'
            : 'bg-amber-100 text-amber-700';

    return (
        <div
            className={`
                rounded-2xl
                border
                p-4
                flex
                items-center
                gap-4
                ${
                    isDark
                        ? 'bg-gray-900 border-gray-800'
                        : 'bg-white border-gray-100'
                }
            `}
        >

            <div className="w-11 h-11 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                <i className="bi bi-bus-front-fill" />
            </div>

            <div className="flex-1 min-w-0">

                <div
                    className={`
                        text-sm
                        font-black
                        truncate
                        ${
                            isDark
                                ? 'text-white'
                                : 'text-custom-dark'
                        }
                    `}
                >
                    {route.start || 'Unknown'}{' '}
                    <span className="text-brand">
                        →
                    </span>{' '}
                    {route.dest || 'Unknown'}
                </div>

                <div className="flex items-center gap-2 mt-1.5 flex-wrap">

                    <span className="text-[10px] font-black text-brand">
                        {route.bus || '—'}
                    </span>

                    <span
                        className={`
                            text-[9px]
                            font-black
                            uppercase
                            px-2
                            py-1
                            rounded-full
                            ${statusClass}
                        `}
                    >
                        {status}
                    </span>

                    {route.basePrice !==
                        undefined && (
                        <span className="text-[10px] font-bold text-gray-400">
                            ₹{route.basePrice}
                        </span>
                    )}

                </div>

            </div>

            {(status === 'pending' ||
                !route.status) && (
                <button
                    type="button"
                    onClick={() =>
                        onDelete(route.id)
                    }
                    className="
                        w-9
                        h-9
                        rounded-xl
                        bg-red-50
                        text-red-500
                        hover:bg-red-100
                        flex
                        items-center
                        justify-center
                        shrink-0
                    "
                    aria-label="Delete uploaded route"
                >
                    <i className="bi bi-trash3-fill text-xs" />
                </button>
            )}

        </div>
    );
};


// ─────────────────────────────────────────────────────────────────────────────
// MAIN ACCOUNT PAGE
// ─────────────────────────────────────────────────────────────────────────────

const AccountPage = ({
    isDark,
    setIsDark,
}) => {

    const navigate = useNavigate();

    // Auth
    const [currentUser, setCurrentUser] =
        useState(null);

    const [isAuthenticated, setIsAuthenticated] =
        useState(false);

    const [isLoading, setIsLoading] =
        useState(true);

    const [authMode, setAuthMode] =
        useState('login');


    // Profile
    const [firstName, setFirstName] =
        useState('');

    const [lastName, setLastName] =
        useState('');

    const [profileEmail, setProfileEmail] =
        useState('');

    const [rewardPoints, setRewardPoints] =
        useState(0);

    const [isEditing, setIsEditing] =
        useState(false);


    // Auth form
    const [regFirstName, setRegFirstName] =
        useState('');

    const [regLastName, setRegLastName] =
        useState('');

    const [email, setEmail] =
        useState('');

    const [password, setPassword] =
        useState('');

    const [showPassword, setShowPassword] =
        useState(false);


    // UI
    const [toast, setToast] =
        useState(null);

    const [fieldErrors, setFieldErrors] =
        useState({});

    const [loadingAction, setLoadingAction] =
        useState(null);

    const [showForgotModal, setShowForgotModal] =
        useState(false);

    const [showDeleteConfirm, setShowDeleteConfirm] =
        useState(false);

    const [showReauthModal, setShowReauthModal] =
        useState(false);


    // Data
    const [uploadedRoutes, setUploadedRoutes] =
        useState([]);

    const [savedCount, setSavedCount] =
        useState(0);

    const [favCount, setFavCount] =
        useState(0);


    const authLimiter = useRef(
        createRateLimiter()
    );


    const showToast = useCallback(
        (message, type = 'info') => {
            setToast({
                message,
                type,
            });
        },
        []
    );


    const clearSecrets = useCallback(() => {
        setPassword('');
        setShowPassword(false);
    }, []);


    // ─────────────────────────────────────────
    // AUTH LISTENER
    // ─────────────────────────────────────────

    useEffect(() => {

        const unsubscribe =
            onAuthStateChanged(
                auth,
                (user) => {

                    setCurrentUser(user);
                    setIsAuthenticated(
                        !!user
                    );

                    if (user) {

                        setProfileEmail(
                            user.email || ''
                        );

                    } else {

                        setFirstName('');
                        setLastName('');
                        setProfileEmail('');

                        setUploadedRoutes([]);
                        setSavedCount(0);
                        setFavCount(0);

                        setAuthMode('login');
                    }

                    setIsLoading(false);
                }
            );

        return () => unsubscribe();

    }, []);


    // ─────────────────────────────────────────
    // PROFILE REALTIME DATA
    // ─────────────────────────────────────────

    useEffect(() => {

        if (!currentUser) return;

        const userRef = doc(
            db,
            'users',
            currentUser.uid
        );

        const unsubscribe =
            onSnapshot(
                userRef,
                (snapshot) => {

                    if (snapshot.exists()) {

                        const data =
                            snapshot.data();

                        setFirstName(
                            data.firstName || ''
                        );

                        setLastName(
                            data.lastName || ''
                        );

                        setRewardPoints(
                            typeof data.rewardPoints ===
                                'number'
                                ? data.rewardPoints
                                : 0
                        );

                    } else {

                        const name =
                            extractName(
                                currentUser.displayName
                            );

                        setFirstName(
                            name.first
                        );

                        setLastName(
                            name.last
                        );
                    }
                },
                (error) => {

                    console.error(
                        'Account profile listener:',
                        error
                    );

                    // Graceful fallback.
                    const name =
                        extractName(
                            currentUser.displayName
                        );

                    setFirstName(
                        name.first
                    );

                    setLastName(
                        name.last
                    );
                }
            );

        return () => unsubscribe();

    }, [currentUser]);


    // ─────────────────────────────────────────
    // USER DATA LISTENERS
    // ─────────────────────────────────────────

    useEffect(() => {

        if (!currentUser) return;

        const uid =
            currentUser.uid;

        const uploadsQuery =
            query(
                collection(
                    db,
                    'busRoutes'
                ),
                where(
                    'uploadedBy',
                    '==',
                    uid
                )
            );

        const unsubscribeUploads =
            onSnapshot(
                uploadsQuery,
                (snapshot) => {

                    setUploadedRoutes(
                        snapshot.docs.map(
                            (item) => ({
                                id: item.id,
                                ...item.data(),
                            })
                        )
                    );
                },
                (error) => {

                    console.error(
                        'Account uploads error:',
                        error
                    );

                    setUploadedRoutes([]);
                }
            );


        const savedRef =
            collection(
                db,
                'users',
                uid,
                'savedRoutes'
            );

        const unsubscribeSaved =
            onSnapshot(
                savedRef,
                (snapshot) => {
                    setSavedCount(
                        snapshot.size
                    );
                },
                (error) => {
                    console.error(
                        'Account saved routes error:',
                        error
                    );
                    setSavedCount(0);
                }
            );


        const favRef =
            collection(
                db,
                'users',
                uid,
                'favRoutes'
            );

        const unsubscribeFav =
            onSnapshot(
                favRef,
                (snapshot) => {
                    setFavCount(
                        snapshot.size
                    );
                },
                (error) => {
                    console.error(
                        'Account favourites error:',
                        error
                    );
                    setFavCount(0);
                }
            );


        return () => {
            unsubscribeUploads();
            unsubscribeSaved();
            unsubscribeFav();
        };

    }, [currentUser]);


    // ─────────────────────────────────────────
    // REGISTER
    // ─────────────────────────────────────────

    const handleRegister = async (event) => {

        event.preventDefault();

        const limit =
            authLimiter.current.check();

        if (!limit.allowed) {
            showToast(
                limit.message,
                'warning'
            );
            return;
        }

        const errors = {};

        const cleanFirst =
            sanitizeText(regFirstName);

        const cleanLast =
            sanitizeText(regLastName);

        const cleanEmail =
            email.trim();


        if (!validateName(cleanFirst)) {
            errors.regFirstName =
                'Use letters only. Maximum 50 characters.';
        }

        if (!validateName(cleanLast)) {
            errors.regLastName =
                'Use letters only. Maximum 50 characters.';
        }

        if (!validatePassword(password)) {
            errors.password =
                'Use 8+ characters with uppercase, number and symbol.';
        }

        if (!cleanEmail) {
            errors.email =
                'Email is required.';
        }


        if (Object.keys(errors).length) {
            setFieldErrors(errors);
            return;
        }


        setFieldErrors({});
        setLoadingAction('register');


        try {

            const result =
                await createUserWithEmailAndPassword(
                    auth,
                    cleanEmail,
                    password
                );

            const user =
                result.user;


            await updateProfile(
                user,
                {
                    displayName:
                        `${cleanFirst} ${cleanLast}`.trim(),
                }
            );

            // Send email verification for email/password accounts
            await sendEmailVerification(user);

            await setDoc(
                doc(
                    db,
                    'users',
                    user.uid
                ),
                {
                    firstName: cleanFirst,
                    lastName: cleanLast,
                    email: cleanEmail,
                    rewardPoints: 5,
                    createdAt:
                        serverTimestamp(),
                }
            );


            clearSecrets();

            setRegFirstName('');
            setRegLastName('');
            setEmail('');

            authLimiter.current.reset();

            setAuthMode('login');

            showToast(
                'Welcome to DPI One! You earned 5 Reward Points.',
                'success'
            );

        } catch (error) {

            showToast(
                getFriendlyError(
                    error.code
                ),
                'error'
            );

        } finally {

            setLoadingAction(null);
        }
    };


    // ─────────────────────────────────────────
    // LOGIN
    // ─────────────────────────────────────────

    const handleLogin = async (event) => {

        event.preventDefault();

        const limit =
            authLimiter.current.check();

        if (!limit.allowed) {
            showToast(
                limit.message,
                'warning'
            );
            return;
        }

        if (!email.trim()) {
            showToast(
                'Enter your email address.',
                'error'
            );
            return;
        }

        if (!password) {
            showToast(
                'Enter your password.',
                'error'
            );
            return;
        }

        setLoadingAction('login');

        try {

            await signInWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );

            clearSecrets();

            authLimiter.current.reset();

            showToast(
                'Welcome back!',
                'success'
            );

        } catch (error) {

            showToast(
                getFriendlyError(
                    error.code
                ),
                'error'
            );

        } finally {

            setLoadingAction(null);
        }
    };


    // ─────────────────────────────────────────
    // GOOGLE
    // ─────────────────────────────────────────

    const handleGoogleSignIn =
        async () => {

            setLoadingAction('google');

            try {

                const provider =
                    new GoogleAuthProvider();

                const result =
                    await signInWithPopup(
                        auth,
                        provider
                    );

                const user =
                    result.user;

                const userRef =
                    doc(
                        db,
                        'users',
                        user.uid
                    );


                /*
                 * Only create the profile document
                 * if it does not already exist.
                 */
                const { first, last } =
                    extractName(
                        user.displayName,
                        'Google',
                        'User'
                    );


                await setDoc(
                    userRef,
                    {
                        firstName: first,
                        lastName: last,
                        email:
                            user.email || '',
                    },
                    {
                        merge: true,
                    }
                );


                clearSecrets();

                showToast(
                    'Signed in with Google.',
                    'success'
                );

            } catch (error) {

                if (
                    error.code !==
                    'auth/popup-closed-by-user'
                ) {
                    showToast(
                        getFriendlyError(
                            error.code
                        ),
                        'error'
                    );
                }

            } finally {

                setLoadingAction(null);
            }
        };


    // ─────────────────────────────────────────
    // SAVE PROFILE
    // ─────────────────────────────────────────

    const handleSaveProfile =
        async () => {

            if (!currentUser) return;

            const cleanFirst =
                sanitizeText(firstName);

            const cleanLast =
                sanitizeText(lastName);


            if (
                !validateName(cleanFirst) ||
                !validateName(cleanLast)
            ) {

                showToast(
                    'Name must contain letters only and be 1–50 characters.',
                    'error'
                );

                return;
            }


            setLoadingAction('save');


            try {

                await updateDoc(
                    doc(
                        db,
                        'users',
                        currentUser.uid
                    ),
                    {
                        firstName:
                            cleanFirst,

                        lastName:
                            cleanLast,
                    }
                );


                await updateProfile(
                    currentUser,
                    {
                        displayName:
                            `${cleanFirst} ${cleanLast}`.trim(),
                    }
                );


                setIsEditing(false);

                showToast(
                    'Profile updated successfully.',
                    'success'
                );

            } catch (error) {

                showToast(
                    getFriendlyError(
                        error.code
                    ),
                    'error'
                );

            } finally {

                setLoadingAction(null);
            }
        };


    // ─────────────────────────────────────────
    // DELETE UPLOAD
    // ─────────────────────────────────────────

    const handleDeleteUpload =
        async (routeId) => {

            if (!currentUser) return;

            try {

                await deleteDoc(
                    doc(
                        db,
                        'busRoutes',
                        routeId
                    )
                );

                showToast(
                    'Route removed successfully.',
                    'success'
                );

            } catch (error) {

                console.error(
                    'Delete upload error:',
                    error
                );

                showToast(
                    getFriendlyError(
                        error.code
                    ),
                    'error'
                );
            }
        };


    // ─────────────────────────────────────────
    // LOGOUT
    // ─────────────────────────────────────────

    const handleLogout =
        async () => {

            try {

                await signOut(auth);

                setIsEditing(false);
                setEmail('');

                clearSecrets();

                setAuthMode('login');

                showToast(
                    'You have been signed out.',
                    'info'
                );

            } catch (error) {

                showToast(
                    'Logout failed. Please try again.',
                    'error'
                );
            }
        };


    // ─────────────────────────────────────────
    // DELETE ACCOUNT
    // ─────────────────────────────────────────

    const handleDeleteAccount =
        () => {

            setShowDeleteConfirm(true);
        };


    const handleDeleteConfirmed =
        () => {

            setShowDeleteConfirm(false);
            setShowReauthModal(true);
        };


    const handleReauthSuccess =
        async () => {

            setShowReauthModal(false);

            if (!currentUser) return;

            setLoadingAction('delete');


            try {

                /*
                 * Delete profile document first.
                 */
                try {

                    await deleteDoc(
                        doc(
                            db,
                            'users',
                            currentUser.uid
                        )
                    );

                } catch (firestoreError) {

                    console.error(
                        'Firestore cleanup:',
                        firestoreError
                    );
                }


                await deleteUser(
                    currentUser
                );


                setIsAuthenticated(false);
                setCurrentUser(null);

                setAuthMode('login');

                showToast(
                    'Your account has been permanently deleted.',
                    'info'
                );

            } catch (error) {

                showToast(
                    getFriendlyError(
                        error.code
                    ),
                    'error'
                );

            } finally {

                setLoadingAction(null);
            }
        };


    // ─────────────────────────────────────────
    // LOADING
    // ─────────────────────────────────────────

    if (isLoading) {

        return (
            <div className="min-h-[500px] flex items-center justify-center">

                <div className="text-center">

                    <div className="w-11 h-11 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto" />

                    <p className="text-brand font-black text-xs mt-4 animate-pulse">
                        Loading Account…
                    </p>

                </div>

            </div>
        );
    }


    // ─────────────────────────────────────────
    // MAIN
    // ─────────────────────────────────────────

    return (
        <div className="w-full min-h-full pb-24 relative overflow-x-hidden">

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onDismiss={() =>
                        setToast(null)
                    }
                />
            )}


            {showForgotModal && (
                <ForgotPasswordModal
                    prefillEmail={email}
                    isDark={isDark}
                    onClose={() =>
                        setShowForgotModal(false)
                    }
                />
            )}


            {showDeleteConfirm && (
                <ConfirmModal
                    title="Delete Account?"
                    message="Your profile and personal account data will be permanently removed. This action cannot be undone."
                    confirmLabel="Continue"
                    dangerous
                    isDark={isDark}
                    onConfirm={
                        handleDeleteConfirmed
                    }
                    onCancel={() =>
                        setShowDeleteConfirm(
                            false
                        )
                    }
                />
            )}


            {showReauthModal && (
                <ReauthModal
                    currentUser={currentUser}
                    isDark={isDark}
                    onSuccess={
                        handleReauthSuccess
                    }
                    onClose={() =>
                        setShowReauthModal(
                            false
                        )
                    }
                />
            )}


            {isAuthenticated ? (

                /* ═══════════════════════════════════════════════
                   AUTHENTICATED ACCOUNT
                   ═══════════════════════════════════════════════ */

                <main className="max-w-5xl mx-auto px-4 md:px-8 pt-6 md:pt-10 space-y-6">

                    {/* HEADER */}

                    <header>

                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand mb-1">
                            DPI One Account
                        </p>

                        <h1
                            className={`
                                text-3xl
                                md:text-4xl
                                font-black
                                tracking-tight
                                ${
                                    isDark
                                        ? 'text-white'
                                        : 'text-custom-dark'
                                }
                            `}
                        >
                            Account
                        </h1>

                        <p
                            className={`
                                text-xs
                                md:text-sm
                                mt-1
                                ${
                                    isDark
                                        ? 'text-gray-400'
                                        : 'text-gray-500'
                                }
                            `}
                        >
                            Manage your profile, routes and preferences.
                        </p>

                    </header>


                    {/* PROFILE HERO */}

                    <section
                        className={`
                            relative
                            overflow-hidden
                            rounded-[2rem]
                            border
                            p-5
                            md:p-7
                            shadow-sm
                            ${
                                isDark
                                    ? 'bg-gray-900 border-gray-800'
                                    : 'bg-white border-gray-100'
                            }
                        `}
                    >

                        <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-brand/10 blur-3xl pointer-events-none" />

                        <div className="relative z-10">

                            <div className="flex flex-col md:flex-row md:items-center gap-5">

                                {/* AVATAR */}

                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.7rem] bg-gradient-custom flex items-center justify-center text-white text-2xl md:text-3xl font-black shadow-lg shadow-brand/20 shrink-0 mx-auto md:mx-0">
                                    {(firstName?.[0] || 'D').toUpperCase()}
                                    {(lastName?.[0] || '').toUpperCase()}
                                </div>


                                {/* INFO */}

                                <div className="flex-1 min-w-0 text-center md:text-left">

                                    <div className="flex flex-col md:flex-row md:items-center gap-2">

                                        <h2
                                            className={`
                                                text-xl
                                                md:text-2xl
                                                font-black
                                                truncate
                                                ${
                                                    isDark
                                                        ? 'text-white'
                                                        : 'text-custom-dark'
                                                }
                                            `}
                                        >
                                            {firstName || 'DPI'}{' '}
                                            {lastName || 'User'}
                                        </h2>

                                        <span className="mx-auto md:mx-0 inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-wider">
                                            <i className="bi bi-patch-check-fill" />
                                            Active
                                        </span>

                                    </div>

                                    <p className="text-xs md:text-sm text-gray-500 mt-1 truncate">
                                        {profileEmail}
                                    </p>

                                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">

                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand/10 text-brand text-[9px] font-black">
                                            <i className="bi bi-person-check-fill" />
                                            Member
                                        </span>

                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-[9px] font-black">
                                            <i className="bi bi-stars" />
                                            {rewardPoints} Points
                                        </span>

                                    </div>

                                </div>


                                {/* ACTIONS */}

                                <div className="flex gap-2">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsEditing(
                                                !isEditing
                                            )
                                        }
                                        className="
                                            flex-1
                                            md:flex-none
                                            px-5
                                            py-3
                                            rounded-xl
                                            bg-brand
                                            hover:bg-brand-dark
                                            text-white
                                            text-xs
                                            font-black
                                            transition-all
                                        "
                                    >
                                        <i
                                            className={`bi ${
                                                isEditing
                                                    ? 'bi-x-lg'
                                                    : 'bi-pencil-fill'
                                            } mr-2`}
                                        />

                                        {isEditing
                                            ? 'Cancel'
                                            : 'Edit Profile'}
                                    </button>

                                </div>

                            </div>


                            {/* EDIT FORM */}

                            {isEditing && (
                                <div
                                    className={`
                                        mt-7
                                        pt-6
                                        border-t
                                        grid
                                        grid-cols-1
                                        md:grid-cols-2
                                        gap-4
                                        fade-in
                                        ${
                                            isDark
                                                ? 'border-gray-800'
                                                : 'border-gray-100'
                                        }
                                    `}
                                >

                                    <div>

                                        <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">
                                            First Name
                                        </label>

                                        <input
                                            value={firstName}
                                            onChange={(e) =>
                                                setFirstName(
                                                    e.target.value
                                                )
                                            }
                                            maxLength={50}
                                            className={`
                                                w-full
                                                px-4
                                                py-3.5
                                                rounded-xl
                                                border-2
                                                text-sm
                                                font-bold
                                                outline-none
                                                focus:border-brand
                                                ${
                                                    isDark
                                                        ? 'bg-gray-950 border-gray-800 text-white'
                                                        : 'bg-gray-50 border-gray-200 text-gray-900'
                                                }
                                            `}
                                        />

                                    </div>


                                    <div>

                                        <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">
                                            Last Name
                                        </label>

                                        <input
                                            value={lastName}
                                            onChange={(e) =>
                                                setLastName(
                                                    e.target.value
                                                )
                                            }
                                            maxLength={50}
                                            className={`
                                                w-full
                                                px-4
                                                py-3.5
                                                rounded-xl
                                                border-2
                                                text-sm
                                                font-bold
                                                outline-none
                                                focus:border-brand
                                                ${
                                                    isDark
                                                        ? 'bg-gray-950 border-gray-800 text-white'
                                                        : 'bg-gray-50 border-gray-200 text-gray-900'
                                                }
                                            `}
                                        />

                                    </div>


                                    <div className="md:col-span-2 flex justify-end">

                                        <button
                                            type="button"
                                            onClick={
                                                handleSaveProfile
                                            }
                                            disabled={
                                                loadingAction ===
                                                'save'
                                            }
                                            className="
                                                px-6
                                                py-3
                                                rounded-xl
                                                bg-brand
                                                text-white
                                                text-xs
                                                font-black
                                                disabled:opacity-50
                                            "
                                        >
                                            {loadingAction ===
                                            'save'
                                                ? 'Saving…'
                                                : 'Save Changes'}
                                        </button>

                                    </div>

                                </div>
                            )}

                        </div>

                    </section>


                    {/* STATS */}

                    <section className="grid grid-cols-3 gap-3">

                        <StatCard
                            icon="bi-upload"
                            label="Uploads"
                            value={
                                uploadedRoutes.length
                            }
                            isDark={isDark}
                        />

                        <StatCard
                            icon="bi-bookmark"
                            label="Saved"
                            value={savedCount}
                            isDark={isDark}
                        />

                        <StatCard
                            icon="bi-heart"
                            label="Favourites"
                            value={favCount}
                            isDark={isDark}
                        />

                    </section>


                    {/* MY UPLOADS */}

                    <section className="space-y-3">

                        <div className="flex items-center justify-between px-1">

                            <div>

                                <p className="text-[10px] uppercase tracking-widest font-black text-brand">
                                    Contributions
                                </p>

                                <h3
                                    className={`
                                        text-lg
                                        font-black
                                        ${
                                            isDark
                                                ? 'text-white'
                                                : 'text-custom-dark'
                                        }
                                    `}
                                >
                                    My Uploads
                                </h3>

                            </div>

                            <span className="px-3 py-1.5 rounded-full bg-brand/10 text-brand text-[9px] font-black">
                                {uploadedRoutes.length} ROUTE
                                {uploadedRoutes.length !== 1
                                    ? 'S'
                                    : ''}
                            </span>

                        </div>


                        {uploadedRoutes.length === 0 ? (

                            <div
                                className={`
                                    rounded-[2rem]
                                    border
                                    p-8
                                    text-center
                                    ${
                                        isDark
                                            ? 'bg-gray-900 border-gray-800'
                                            : 'bg-white border-gray-100'
                                    }
                                `}
                            >

                                <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto mb-4">
                                    <i className="bi bi-upload text-xl" />
                                </div>

                                <h4
                                    className={`
                                        text-sm
                                        font-black
                                        ${
                                            isDark
                                                ? 'text-white'
                                                : 'text-custom-dark'
                                        }
                                    `}
                                >
                                    No uploaded routes yet
                                </h4>

                                <p className="text-xs text-gray-400 mt-1">
                                    Your submitted bus routes will appear here.
                                </p>

                            </div>

                        ) : (

                            <div className="space-y-2">

                                {uploadedRoutes.map(
                                    (route) => (
                                        <UploadItem
                                            key={route.id}
                                            route={route}
                                            isDark={isDark}
                                            onDelete={
                                                handleDeleteUpload
                                            }
                                        />
                                    )
                                )}

                            </div>

                        )}

                    </section>


                    {/* PREFERENCES */}

                    <section className="space-y-3">

                        <div className="px-1">

                            <p className="text-[10px] uppercase tracking-widest font-black text-brand">
                                App Settings
                            </p>

                            <h3
                                className={`
                                    text-lg
                                    font-black
                                    ${
                                        isDark
                                            ? 'text-white'
                                            : 'text-custom-dark'
                                    }
                                `}
                            >
                                Preferences
                            </h3>

                        </div>


                        <div
                            className={`
                                rounded-[2rem]
                                border
                                overflow-hidden
                                ${
                                    isDark
                                        ? 'bg-gray-900 border-gray-800'
                                        : 'bg-white border-gray-100'
                                }
                            `}
                        >

                            {/* THEME */}

                            <div
                                className={`
                                    px-5
                                    md:px-6
                                    py-5
                                    flex
                                    items-center
                                    justify-between
                                    border-b
                                    ${
                                        isDark
                                            ? 'border-gray-800'
                                            : 'border-gray-100'
                                    }
                                `}
                            >

                                <div className="flex items-center gap-4">

                                    <div className="w-11 h-11 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
                                        <i
                                            className={`bi ${
                                                isDark
                                                    ? 'bi-moon-stars-fill'
                                                    : 'bi-brightness-high'
                                            }`}
                                        />
                                    </div>

                                    <div>

                                        <p
                                            className={`
                                                text-sm
                                                font-black
                                                ${
                                                    isDark
                                                        ? 'text-white'
                                                        : 'text-custom-dark'
                                                }
                                            `}
                                        >
                                            Appearance
                                        </p>

                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                            {isDark
                                                ? 'Dark mode enabled'
                                                : 'Light mode enabled'}
                                        </p>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsDark(
                                            !isDark
                                        )
                                    }
                                    aria-label={
                                        isDark
                                            ? 'Switch to light mode'
                                            : 'Switch to dark mode'
                                    }
                                    className={`
                                        w-14
                                        h-8
                                        rounded-full
                                        p-1
                                        flex
                                        items-center
                                        transition-all
                                        ${
                                            isDark
                                                ? 'bg-brand justify-end'
                                                : 'bg-gray-200 justify-start'
                                        }
                                    `}
                                >

                                    <span className="w-6 h-6 rounded-full bg-white shadow-md" />

                                </button>

                            </div>


                            {/* INFORMATION & POLICIES */}

                            <button
                                type="button"
                                onClick={() => navigate('/disclaimer')}
                                className={`
                                    w-full
                                    px-5
                                    md:px-6
                                    py-5
                                    flex
                                    items-center
                                    justify-between
                                    text-left
                                    border-b
                                    ${
                                        isDark
                                            ? 'border-gray-800 hover:bg-gray-800/50'
                                            : 'border-gray-100 hover:bg-gray-50'
                                    }
                                `}
                            >

                                <div className="flex items-center gap-4">

                                    <div
                                        className={`
                                            w-11
                                            h-11
                                            rounded-2xl
                                            flex
                                            items-center
                                            justify-center
                                            ${
                                                isDark
                                                    ? 'bg-gray-800 text-amber-400'
                                                    : 'bg-amber-50 text-amber-600'
                                            }
                                        `}
                                    >
                                        <i className="bi bi-exclamation text-lg" />
                                    </div>

                                    <div>
                                        <p
                                            className={`
                                                text-sm
                                                font-black
                                                ${
                                                    isDark
                                                        ? 'text-white'
                                                        : 'text-custom-dark'
                                                }
                                            `}
                                        >
                                            Disclaimer
                                        </p>

                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                            Important information about route data
                                        </p>
                                    </div>

                                </div>

                                <i className="bi bi-chevron-right text-gray-400" />

                            </button>


                            {/* PRIVACY POLICY */}

                            <button
                                type="button"
                                onClick={() => navigate('/privacy-policy')}
                                className={`
                                    w-full
                                    px-5
                                    md:px-6
                                    py-5
                                    flex
                                    items-center
                                    justify-between
                                    text-left
                                    border-b
                                    ${
                                        isDark
                                            ? 'border-gray-800 hover:bg-gray-800/50'
                                            : 'border-gray-100 hover:bg-gray-50'
                                    }
                                `}
                            >

                                <div className="flex items-center gap-4">

                                    <div
                                        className={`
                                            w-11
                                            h-11
                                            rounded-2xl
                                            flex
                                            items-center
                                            justify-center
                                            ${
                                                isDark
                                                    ? 'bg-gray-800 text-brand'
                                                    : 'bg-purple-50 text-brand'
                                            }
                                        `}
                                    >
                                        <i className="bi bi-shield text-lg" />
                                    </div>

                                    <div>
                                        <p
                                            className={`
                                                text-sm
                                                font-black
                                                ${
                                                    isDark
                                                        ? 'text-white'
                                                        : 'text-custom-dark'
                                                }
                                            `}
                                        >
                                            Privacy Policy
                                        </p>

                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                            Learn how DPI One handles information
                                        </p>
                                    </div>

                                </div>

                                <i className="bi bi-chevron-right text-gray-400" />

                            </button>


                            {/* ABOUT */}

                            <button
                                type="button"
                                onClick={() => navigate('/about')}
                                className={`
                                    w-full
                                    px-5
                                    md:px-6
                                    py-5
                                    flex
                                    items-center
                                    justify-between
                                    text-left
                                    ${
                                        isDark
                                            ? 'hover:bg-gray-800/50'
                                            : 'hover:bg-gray-50'
                                    }
                                `}
                            >

                                <div className="flex items-center gap-4">

                                    <div
                                        className={`
                                            w-11
                                            h-11
                                            rounded-2xl
                                            flex
                                            items-center
                                            justify-center
                                            ${
                                                isDark
                                                    ? 'bg-gray-800 text-blue-400'
                                                    : 'bg-blue-50 text-blue-600'
                                            }
                                        `}
                                    >
                                        <i className="bi bi-info-circle text-lg" />
                                    </div>

                                    <div>
                                        <p
                                            className={`
                                                text-sm
                                                font-black
                                                ${
                                                    isDark
                                                        ? 'text-white'
                                                        : 'text-custom-dark'
                                                }
                                            `}
                                        >
                                            About DPI One
                                        </p>

                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                            Learn more about DPI One
                                        </p>
                                    </div>

                                </div>

                                <i className="bi bi-chevron-right text-gray-400" />

                            </button>

                        </div>

                    </section>


                    {/* ACCOUNT ACTIONS */}

                    <section className="space-y-3">

                        <div className="px-1">

                            <p className="text-[10px] uppercase tracking-widest font-black text-brand">
                                Account
                            </p>

                            <h3
                                className={`
                                    text-lg
                                    font-black
                                    ${
                                        isDark
                                            ? 'text-white'
                                            : 'text-custom-dark'
                                    }
                                `}
                            >
                                Security & Access
                            </h3>

                        </div>


                        <div
                            className={`
                                rounded-[2rem]
                                border
                                overflow-hidden
                                ${
                                    isDark
                                        ? 'bg-gray-900 border-gray-800'
                                        : 'bg-white border-gray-100'
                                }
                            `}
                        >

                            {/* PASSWORD RESET */}

                            <button
                                type="button"
                                onClick={() =>
                                    setShowForgotModal(
                                        true
                                    )
                                }
                                className={`
                                    w-full
                                    px-5
                                    md:px-6
                                    py-5
                                    flex
                                    items-center
                                    justify-between
                                    text-left
                                    border-b
                                    ${
                                        isDark
                                            ? 'border-gray-800 hover:bg-gray-800/50'
                                            : 'border-gray-100 hover:bg-gray-50'
                                    }
                                `}
                            >

                                <div className="flex items-center gap-4">

                                    <div className="w-11 h-11 rounded-2xl bg-purple-50 text-brand flex items-center justify-center">
                                        <i className="bi bi-key-fill" />
                                    </div>

                                    <div>

                                        <p
                                            className={`
                                                text-sm
                                                font-black
                                                ${
                                                    isDark
                                                        ? 'text-white'
                                                        : 'text-custom-dark'
                                                }
                                            `}
                                        >
                                            Reset Password
                                        </p>

                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                            Send a password reset link
                                        </p>

                                    </div>

                                </div>

                                <i className="bi bi-chevron-right text-gray-400" />

                            </button>


                            {/* LOGOUT */}

                            <button
                                type="button"
                                onClick={
                                    handleLogout
                                }
                                className={`
                                    w-full
                                    px-5
                                    md:px-6
                                    py-5
                                    flex
                                    items-center
                                    justify-between
                                    text-left
                                    ${
                                        isDark
                                            ? 'hover:bg-gray-800/50'
                                            : 'hover:bg-gray-50'
                                    }
                                `}
                            >

                                <div className="flex items-center gap-4">

                                    <div className="w-11 h-11 rounded-2xl bg-gray-100 text-gray-600 flex items-center justify-center">
                                        <i className="bi bi-box-arrow-right" />
                                    </div>

                                    <div>

                                        <p
                                            className={`
                                                text-sm
                                                font-black
                                                ${
                                                    isDark
                                                        ? 'text-white'
                                                        : 'text-custom-dark'
                                                }
                                            `}
                                        >
                                            Sign Out
                                        </p>

                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                            Sign out from this device
                                        </p>

                                    </div>

                                </div>

                                <i className="bi bi-chevron-right text-gray-400" />

                            </button>

                        </div>

                    </section>


                    {/* DANGER ZONE */}

                    <section className="pb-6">

                        <div className="px-1 mb-3">

                            <p className="text-[10px] uppercase tracking-widest font-black text-red-500">
                                Danger Zone
                            </p>

                        </div>

                        <div
                            className={`
                                rounded-[2rem]
                                border
                                p-5
                                md:p-6
                                ${
                                    isDark
                                        ? 'bg-red-950/20 border-red-900/40'
                                        : 'bg-red-50/70 border-red-100'
                                }
                            `}
                        >

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">

                                <div>

                                    <h4 className="text-sm font-black text-red-600 flex items-center gap-2">
                                        <i className="bi bi-trash3-fill" />
                                        Delete Account
                                    </h4>

                                    <p
                                        className={`
                                            text-xs
                                            leading-relaxed
                                            mt-1.5
                                            max-w-lg
                                            ${
                                                isDark
                                                    ? 'text-red-300/70'
                                                    : 'text-red-800/70'
                                            }
                                        `}
                                    >
                                        Permanently delete your DPI One account and profile data. You will be asked to verify your identity first.
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        handleDeleteAccount
                                    }
                                    disabled={
                                        loadingAction ===
                                        'delete'
                                    }
                                    className="
                                        shrink-0
                                        px-5
                                        py-3
                                        rounded-xl
                                        bg-red-600
                                        hover:bg-red-700
                                        text-white
                                        text-xs
                                        font-black
                                        disabled:opacity-50
                                    "
                                >
                                    {loadingAction ===
                                    'delete'
                                        ? 'Deleting…'
                                        : 'Delete Account'}
                                </button>

                            </div>

                        </div>

                    </section>

                </main>

            ) : (

                /* ═══════════════════════════════════════════════
                   LOGIN / REGISTER
                   ═══════════════════════════════════════════════ */

                <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8 md:py-12">

                    <div className="w-full max-w-md">

                        {/* LOGIN CARD */}

                        <div
                            className={`
                                rounded-[2rem]
                                border
                                shadow-xl
                                overflow-hidden
                                ${
                                    isDark
                                        ? 'bg-gray-900 border-gray-800'
                                        : 'bg-white border-gray-100'
                                }
                            `}
                        >

                            {/* CARD HEADER */}

                            <div className="p-6 md:p-8 pb-5">

                                <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-5">
                                    <i className="bi bi-person-circle text-2xl" />
                                </div>

                                <p className="text-[10px] uppercase tracking-widest font-black text-brand mb-1">
                                    DPI One Account
                                </p>

                                <h1
                                    className={`
                                        text-2xl
                                        md:text-3xl
                                        font-black
                                        tracking-tight
                                        ${
                                            isDark
                                                ? 'text-white'
                                                : 'text-custom-dark'
                                        }
                                    `}
                                >
                                    {authMode === 'login'
                                        ? 'Welcome back'
                                        : 'Create your account'}
                                </h1>

                                <p className="text-xs md:text-sm text-gray-400 mt-2 leading-relaxed">
                                    {authMode === 'login'
                                        ? 'Sign in to manage your routes and account.'
                                        : 'Join DPI One and contribute useful local bus information.'}
                                </p>

                            </div>


                            {/* FORM */}

                            <form
                                onSubmit={
                                    authMode === 'login'
                                        ? handleLogin
                                        : handleRegister
                                }
                                noValidate
                                className="px-6 md:px-8 pb-6 md:pb-8 space-y-4"
                            >

                                {authMode === 'register' && (

                                    <div className="grid grid-cols-2 gap-3">

                                        <div>

                                            <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">
                                                First Name
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    regFirstName
                                                }
                                                maxLength={50}
                                                onChange={(e) =>
                                                    setRegFirstName(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="John"
                                                className={`
                                                    w-full
                                                    px-3.5
                                                    py-3.5
                                                    rounded-xl
                                                    border-2
                                                    text-sm
                                                    font-semibold
                                                    outline-none
                                                    focus:border-brand
                                                    ${
                                                        isDark
                                                            ? 'bg-gray-950 border-gray-800 text-white'
                                                            : 'bg-gray-50 border-gray-200 text-gray-900'
                                                    }
                                                `}
                                            />

                                            {fieldErrors.regFirstName && (
                                                <p className="text-[10px] text-red-500 font-bold mt-1">
                                                    {fieldErrors.regFirstName}
                                                </p>
                                            )}

                                        </div>


                                        <div>

                                            <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">
                                                Last Name
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    regLastName
                                                }
                                                maxLength={50}
                                                onChange={(e) =>
                                                    setRegLastName(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Doe"
                                                className={`
                                                    w-full
                                                    px-3.5
                                                    py-3.5
                                                    rounded-xl
                                                    border-2
                                                    text-sm
                                                    font-semibold
                                                    outline-none
                                                    focus:border-brand
                                                    ${
                                                        isDark
                                                            ? 'bg-gray-950 border-gray-800 text-white'
                                                            : 'bg-gray-50 border-gray-200 text-gray-900'
                                                    }
                                                `}
                                            />

                                            {fieldErrors.regLastName && (
                                                <p className="text-[10px] text-red-500 font-bold mt-1">
                                                    {fieldErrors.regLastName}
                                                </p>
                                            )}

                                        </div>

                                    </div>
                                )}


                                {/* EMAIL */}

                                <div>

                                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(
                                                e.target.value
                                            )
                                        }
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        className={`
                                            w-full
                                            px-3.5
                                            py-3.5
                                            rounded-xl
                                            border-2
                                            text-sm
                                            font-semibold
                                            outline-none
                                            focus:border-brand
                                            ${
                                                isDark
                                                    ? 'bg-gray-950 border-gray-800 text-white'
                                                    : 'bg-gray-50 border-gray-200 text-gray-900'
                                            }
                                        `}
                                    />

                                    {fieldErrors.email && (
                                        <p className="text-[10px] text-red-500 font-bold mt-1">
                                            {fieldErrors.email}
                                        </p>
                                    )}

                                </div>


                                {/* PASSWORD */}

                                <div>

                                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">
                                        Password
                                    </label>

                                    <div className="relative">

                                        <input
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="••••••••"
                                            autoComplete={
                                                authMode ===
                                                'login'
                                                    ? 'current-password'
                                                    : 'new-password'
                                            }
                                            className={`
                                                w-full
                                                px-3.5
                                                py-3.5
                                                pr-12
                                                rounded-xl
                                                border-2
                                                text-sm
                                                font-semibold
                                                outline-none
                                                focus:border-brand
                                                ${
                                                    isDark
                                                        ? 'bg-gray-950 border-gray-800 text-white'
                                                        : 'bg-gray-50 border-gray-200 text-gray-900'
                                                }
                                            `}
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    !showPassword
                                                )
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                            aria-label="Toggle password visibility"
                                        >
                                            <i
                                                className={`bi ${
                                                    showPassword
                                                        ? 'bi-eye-slash-fill'
                                                        : 'bi-eye-fill'
                                                }`}
                                            />
                                        </button>

                                    </div>

                                    {fieldErrors.password && (
                                        <p className="text-[10px] text-red-500 font-bold mt-1">
                                            {fieldErrors.password}
                                        </p>
                                    )}

                                    {authMode ===
                                        'register' &&
                                        password && (
                                            <p
                                                className={`
                                                    text-[10px]
                                                    font-bold
                                                    mt-1.5
                                                    ${
                                                        validatePassword(
                                                            password
                                                        )
                                                            ? 'text-green-500'
                                                            : 'text-amber-500'
                                                    }
                                                `}
                                            >
                                                {validatePassword(
                                                    password
                                                )
                                                    ? '✓ Strong password'
                                                    : '8+ chars • uppercase • number • symbol'}
                                            </p>
                                        )}

                                </div>


                                {/* LOGIN OPTIONS */}

                                {authMode ===
                                    'login' && (

                                    <div className="flex items-center justify-between gap-3">

                                        <label className="flex items-center gap-2 cursor-pointer">

                                            <input
                                                type="checkbox"
                                                className="accent-[#6D5CE7]"
                                                onChange={async (
                                                    e
                                                ) => {
                                                    try {
                                                        await setPersistence(
                                                            auth,
                                                            e.target
                                                                .checked
                                                                ? browserLocalPersistence
                                                                : browserSessionPersistence
                                                        );
                                                    } catch (
                                                        error
                                                    ) {
                                                        console.error(
                                                            'Persistence error:',
                                                            error
                                                        );
                                                    }
                                                }}
                                            />

                                            <span className="text-[10px] font-bold text-gray-500">
                                                Remember me
                                            </span>

                                        </label>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowForgotModal(
                                                    true
                                                )
                                            }
                                            className="text-[10px] font-black text-brand hover:underline"
                                        >
                                            Forgot password?
                                        </button>

                                    </div>
                                )}


                                {/* SUBMIT */}

                                <button
                                    type="submit"
                                    disabled={
                                        !!loadingAction
                                    }
                                    className="
                                        w-full
                                        py-3.5
                                        rounded-xl
                                        bg-gradient-custom
                                        text-white
                                        text-xs
                                        font-black
                                        shadow-lg
                                        shadow-brand/20
                                        disabled:opacity-50
                                        transition-all
                                        active:scale-[0.98]
                                    "
                                >

                                    {loadingAction ===
                                        'login' ||
                                    loadingAction ===
                                        'register' ? (

                                        <span className="flex items-center justify-center gap-2">

                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />

                                            {authMode ===
                                            'login'
                                                ? 'Signing in…'
                                                : 'Creating account…'}

                                        </span>

                                    ) : (
                                        authMode ===
                                        'login'
                                            ? 'Sign In'
                                            : 'Create Account'
                                    )}

                                </button>


                                {/* DIVIDER */}

                                <div className="flex items-center gap-3 py-1">

                                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />

                                    <span className="text-[9px] uppercase tracking-widest font-black text-gray-400">
                                        OR
                                    </span>

                                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />

                                </div>


                                {/* GOOGLE */}

                                <button
                                    type="button"
                                    onClick={
                                        handleGoogleSignIn
                                    }
                                    disabled={
                                        !!loadingAction
                                    }
                                    className={`
                                        w-full
                                        py-3.5
                                        rounded-xl
                                        border-2
                                        text-xs
                                        font-black
                                        flex
                                        items-center
                                        justify-center
                                        gap-2
                                        transition-all
                                        disabled:opacity-50
                                        ${
                                            isDark
                                                ? 'border-gray-800 text-white hover:bg-gray-800'
                                                : 'border-gray-200 text-gray-800 hover:bg-gray-50'
                                        }
                                    `}
                                >

                                    {loadingAction ===
                                    'google' ? (

                                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />

                                    ) : (

                                        <span className="text-base">
                                            G
                                        </span>

                                    )}

                                    {loadingAction ===
                                    'google'
                                        ? 'Connecting…'
                                        : 'Continue with Google'}

                                </button>


                                {/* SWITCH */}

                                <p className="text-center text-xs text-gray-500 pt-2">

                                    {authMode ===
                                    'login'
                                        ? "Don't have an account?"
                                        : 'Already have an account?'}

                                    <button
                                        type="button"
                                        onClick={() => {

                                            setAuthMode(
                                                authMode ===
                                                    'login'
                                                    ? 'register'
                                                    : 'login'
                                            );

                                            setFieldErrors(
                                                {}
                                            );

                                            clearSecrets();

                                        }}
                                        className="ml-1.5 text-brand font-black hover:underline"
                                    >
                                        {authMode ===
                                        'login'
                                            ? 'Create one'
                                            : 'Sign in'}
                                    </button>

                                </p>

                            </form>

                        </div>

                    </div>

                </main>
            )}

        </div>
    );
};

export default AccountPage;