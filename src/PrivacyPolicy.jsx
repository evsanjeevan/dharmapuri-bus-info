import React from "react";
import { useNavigate } from "react-router-dom";
import tamilFont from "./assets/10_உழவன் தமிழ்.ttf";

const FONT_STYLES = `
@font-face {
    font-family: "DpiTamil";
    src: url("${tamilFont}") format("truetype");
    font-weight: 400;
    font-style: normal;
    font-display: swap;
}

.privacy-font {
    font-family: "DpiTamil", "Nirmala UI", "Segoe UI", Arial, sans-serif;
}
`;

const PrivacyPolicy = ({ isDark = false }) => {
    const navigate = useNavigate();

    const headingClass = `
        privacy-font
        text-xl
        md:text-2xl
        font-black
        mb-3
        ${isDark ? "text-white" : "text-custom-dark"}
    `;

    const bodyClass = `
        privacy-font
        text-sm
        md:text-base
        leading-8
        ${isDark ? "text-gray-300" : "text-gray-600"}
    `;

    const listClass = `
        privacy-font
        mt-3
        pl-6
        list-disc
        space-y-2
        text-sm
        md:text-base
        leading-8
        ${isDark ? "text-gray-300" : "text-gray-600"}
    `;

    const dividerClass = `h-px ${isDark ? "bg-gray-800" : "bg-gray-100"}`;

    return (
        <main
            className={`
                w-full
                min-h-full
                px-4
                md:px-8
                py-6
                md:py-10
                pb-28
                ${isDark ? "bg-gray-950" : "bg-gray-50"}
            `}
        >
            <style>{FONT_STYLES}</style>

            <div className="max-w-4xl mx-auto">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className={`
                        inline-flex
                        items-center
                        gap-2
                        mb-6
                        px-4
                        py-2.5
                        rounded-xl
                        border
                        text-xs
                        font-black
                        transition-all
                        ${
                            isDark
                                ? "border-gray-800 text-gray-300 hover:bg-gray-900"
                                : "border-gray-200 text-gray-600 hover:bg-white"
                        }
                    `}
                >
                    <i className="bi bi-arrow-left text-sm" />
                    Back
                </button>

                <header className="mb-6 md:mb-8">
                    <p className="privacy-font text-[10px] uppercase tracking-[0.18em] font-black text-brand mb-2">
                        Privacy Policy
                    </p>

                    <h1
                        className={`
                            privacy-font
                            text-3xl
                            md:text-4xl
                            font-black
                            tracking-tight
                            ${isDark ? "text-white" : "text-custom-dark"}
                        `}
                    >
                        DPI One & Privacy Policy
                    </h1>

                    <p
                        className={`
                            privacy-font
                            mt-2
                            text-sm
                            md:text-base
                            ${isDark ? "text-gray-400" : "text-gray-500"}
                        `}
                    >
                        கடைசியாக புதுப்பிக்கப்பட்டது: அக்டோபர் 2026
                    </p>
                </header>

                <section
                    className={`
                        rounded-[2rem]
                        border
                        p-6
                        md:p-8
                        shadow-sm
                        ${
                            isDark
                                ? "bg-gray-900 border-gray-800"
                                : "bg-white border-gray-100"
                        }
                    `}
                >
                    <div
                        className={`
                            w-14
                            h-14
                            rounded-2xl
                            flex
                            items-center
                            justify-center
                            mb-6
                            ${
                                isDark
                                    ? "bg-gray-800 text-brand"
                                    : "bg-brand/10 text-brand"
                            }
                        `}
                    >
                        <i className="bi bi-shield text-2xl" />
                    </div>

                    <div className="space-y-8">
                        {/* 1. Introduction */}
                        <section>
                            <h2 className={headingClass}>1. அறிமுகம்</h2>

                            <p className={bodyClass}>
                                DPI One என்பது பேருந்து வழித்தடங்கள், நேரங்கள்,
                                நிறுத்தங்கள் மற்றும் தொடர்புடைய பயணத் தகவல்களை
                                பயனர்களுக்கு வழங்கும் சேவையாகும். இந்த Privacy
                                Policy, DPI One பயன்படுத்தும் போது கணக்கு மற்றும்
                                சேவை தொடர்பாக கையாளப்படும் தகவல்களை விளக்குகிறது.
                            </p>
                        </section>

                        <div className={dividerClass} />

                        {/* 2. Account Information */}
                        <section>
                            <h2 className={headingClass}>2. கணக்கு தகவல்கள்</h2>

                            <p className={bodyClass}>
                                கணக்கை உருவாக்கி நிர்வகிக்க DPI One-ன் தற்போதைய
                                account features மூலம் கீழ்கண்ட அடிப்படை தகவல்கள்
                                சேமிக்கப்படலாம்:
                            </p>

                            <ul className={listClass}>
                                <li>முதல் பெயர்</li>
                                <li>கடைசி பெயர்</li>
                                <li>மின்னஞ்சல் முகவரி</li>
                                <li>கணக்கு உருவாக்கப்பட்ட நேரம் போன்ற account metadata</li>
                            </ul>

                            <p className={`${bodyClass} mt-3`}>
                                Email/Password மற்றும் Google Sign-In போன்ற Firebase
                                Authentication வசதிகள் உள்நுழைவு மற்றும் கணக்கு
                                மேலாண்மைக்காக பயன்படுத்தப்படுகின்றன. Firebase
                                Authentication பயனர் profile-ல் email மற்றும்
                                display name போன்ற basic properties வைத்திருக்கலாம்.
                            </p>
                        </section>

                        <div className={dividerClass} />

                        {/* 3. Saved & Favourite Information */}
                        <section>
                            <h2 className={headingClass}>
                                3. Saved மற்றும் Favourite தகவல்கள்
                            </h2>

                            <p className={bodyClass}>
                                பயனர் சேமிக்கும் பேருந்து routes மற்றும் favourite
                                routes போன்ற account-specific தகவல்கள், அந்த பயனர்
                                மீண்டும் அணுகுவதற்காக அவரது account-க்கு கீழ்
                                சேமிக்கப்படலாம்.
                            </p>

                            <p className={`${bodyClass} mt-3`}>
                                இவை பிற பயனர்களின் account data-வுடன் கலக்காமல்,
                                user-specific access rules மூலம் பாதுகாக்கப்பட வேண்டும்.
                            </p>
                        </section>

                        <div className={dividerClass} />

                        {/* 4. User Submitted Route Information */}
                        <section>
                            <h2 className={headingClass}>
                                4. பயனர் வழங்கும் route தகவல்கள்
                            </h2>

                            <p className={bodyClass}>
                                பயனர் ஒரு பேருந்து route-ஐ upload செய்யும் போது,
                                submission-ல் வழங்கப்படும் route மற்றும் bus-related
                                தகவல்கள் DPI One-ல் சேமிக்கப்படலாம்.
                            </p>

                            <p className={`${bodyClass} mt-3`}>
                                இந்த தகவல்கள் review, approval மற்றும் பயணிகளுக்கு
                                route information-ஐ காட்டுதல் போன்ற சேவை
                                செயல்பாடுகளுக்காக பயன்படுத்தப்படலாம்.
                            </p>

                            <p className={`${bodyClass} mt-3`}>
                                Route தகவல்களுக்குள் தேவையற்ற தனிப்பட்ட தகவல்களை
                                சேர்க்க வேண்டாம். தவறுதலாக சேர்க்கப்பட்ட தனிப்பட்ட
                                தகவல்கள் சேவை தேவைக்கு ஏற்ப அகற்றப்படலாம்.
                            </p>
                        </section>

                        <div className={dividerClass} />

                        {/* 5. Profile Information Not Collected */}
                        <section>
                            <h2 className={headingClass}>
                                5. சேகரிக்கப்படாத profile தகவல்கள்
                            </h2>

                            <p className={bodyClass}>
                                DPI One-ன் தற்போதைய AccountPage செயல்பாடுகளில்
                                phone number, வீட்டு முகவரி அல்லது GPS/location
                                தகவல்கள் profile தகவல்களாக கேட்கப்படுவதில்லை.
                            </p>

                            <p className={`${bodyClass} mt-3`}>
                                Future features அல்லது வேறு சேவைகள் மூலம் data
                                practices மாறினால், இந்த Privacy Policy அதற்கேற்ப
                                புதுப்பிக்கப்படும்.
                            </p>
                        </section>

                        <div className={dividerClass} />

                        {/* 6. Use of Information */}
                        <section>
                            <h2 className={headingClass}>6. தகவல்களின் பயன்பாடு</h2>

                            <ul className={listClass}>
                                <li>கணக்கை உருவாக்கவும் நிர்வகிக்கவும்</li>

                                <li>
                                    உள்நுழைவு மற்றும் email verification போன்ற
                                    account security செயல்பாடுகளுக்கு
                                </li>

                                <li>
                                    Saved மற்றும் Favourite route வசதிகளை வழங்கவும்
                                </li>

                                <li>
                                    பயனர் upload செய்த route submissions-ஐ
                                    நிர்வகிக்கவும்
                                </li>

                                <li>
                                    DPI One bus-information service-ஐ இயக்கவும்
                                    பராமரிக்கவும்
                                </li>
                            </ul>
                        </section>

                        <div className={dividerClass} />

                        {/* 7. Information Security */}
                        <section>
                            <h2 className={headingClass}>
                                7. தகவல் பாதுகாப்பு
                            </h2>

                            <p className={bodyClass}>
                                DPI One உங்கள் கணக்கு மற்றும் தகவல்களின் பாதுகாப்பை
                                முக்கியமாகக் கருதுகிறது. உங்கள் தகவல்களை பாதுகாப்பாக
                                நிர்வகிக்க தேவையான பாதுகாப்பு நடவடிக்கைகள்
                                பயன்படுத்தப்படுகின்றன.
                            </p>

                            <p className={`${bodyClass} mt-3`}>
                                உங்கள் கணக்கு மற்றும் தகவல்களை பாதுகாப்பாக வைத்திருக்க
                                தேவையான பாதுகாப்பு நடவடிக்கைகள் அமைக்கப்பட்டுள்ளன.
                                இணையத்தில் அனுப்பப்படும் மற்றும் சேமித்து வைக்கப்படும்
                                தகவல்களுக்கும் பாதுகாப்பு நடவடிக்கைகள் பயன்படுத்தப்படுகின்றன.
                            </p>

                            <p className={`${bodyClass} mt-3`}>
                                இருப்பினும், இணையத்தில் எந்த சேவையும் முழுமையான
                                பாதுகாப்பை உறுதி செய்ய முடியாது. எனவே, உங்கள்
                                கடவுச்சொல் மற்றும் கணக்கு உள்நுழைவு விவரங்களை
                                பாதுகாப்பாக வைத்திருப்பது முக்கியம்.
                            </p>
                        </section>

                        <div className={dividerClass} />

                        {/* 8. Information Sharing */}
                        <section>
                            <h2 className={headingClass}>8. தகவல் பகிர்வு</h2>

                            <p className={bodyClass}>
                                Approved செய்யப்பட்ட bus route information DPI One-ல்
                                பொதுப் பயனர்களுக்குக் காட்டப்படலாம். Account profile
                                தகவல்கள் public route information-இன் ஒரு பகுதியாக
                                காட்டப்பட வேண்டியதில்லை.
                            </p>

                            <p className={`${bodyClass} mt-3`}>
                                Authentication மற்றும் database செயல்பாடுகளுக்கு
                                பயன்படுத்தப்படும் Firebase போன்ற service providers,
                                அந்த சேவைகளை வழங்க தேவையான அளவில் data-ஐ process செய்யலாம்.
                            </p>
                        </section>

                        <div className={dividerClass} />

                        {/* 9. Account Deletion */}
                        <section>
                            <h2 className={headingClass}>9. Account deletion</h2>

                            <p className={bodyClass}>
                                பயனர் AccountPage மூலம் account deletion தொடங்கலாம்.
                                தற்போதைய flow, Firebase Authentication account மற்றும்
                                user profile document-ஐ நீக்க முயற்சிக்கிறது.
                            </p>

                            <p className={`${bodyClass} mt-3`}>
                                Saved routes, favourite routes அல்லது uploaded route
                                records போன்ற தொடர்புடைய records அனைத்தும் account
                                deletion-ன் மூலம் தானாக அழிக்கப்படும் என்று இப்போதைய
                                client flow உத்தரவாதம் அளிக்கவில்லை.
                            </p>
                        </section>

                        <div className={dividerClass} />

                        {/* 10. Browser Storage */}
                        <section>
                            <h2 className={headingClass}>10. Browser storage</h2>

                            <p className={bodyClass}>
                                DPI One சில browser-side features க்காக local/session
                                browser storage பயன்படுத்தக்கூடும். உதாரணமாக login
                                persistence மற்றும் சில client-side rate-limit state
                                போன்ற functionality browser storage-ஐ பயன்படுத்தலாம்.
                            </p>
                        </section>

                        <div className={dividerClass} />

                        {/* 11. Reward Points */}
                        <section>
                            <h2 className={headingClass}>11. Reward Points</h2>

                            <p className={bodyClass}>
                                DPI One-ன் தற்போதைய account system-ல் Reward Points
                                feature இல்லை. Reward Points தொடர்பான புதிய account
                                data சேமிக்கப்படாது.
                            </p>
                        </section>

                        <div className={dividerClass} />

                        {/* 12. Policy Changes */}
                        <section>
                            <h2 className={headingClass}>12. Policy மாற்றங்கள்</h2>

                            <p className={bodyClass}>
                                DPI One-ன் features, data practices அல்லது security
                                controls மாறினால் இந்த Privacy Policy புதுப்பிக்கப்படலாம்.
                                புதுப்பிக்கப்பட்ட பதிப்பில் புதிய update date காட்டப்படும்.
                            </p>
                        </section>

                        <div className={dividerClass} />

                        {/* 13. Contact */}
                        <section>
                            <h2 className={headingClass}>13. தொடர்பு</h2>

                            <p className={bodyClass}>
                                இந்த Privacy Policy அல்லது DPI One-ன் data practices
                                குறித்து கேள்விகள் இருந்தால், DPI One வழங்கும்
                                அதிகாரப்பூர்வ தொடர்பு வழிமுறைகள் மூலம் அணுகலாம்.
                            </p>
                        </section>

                        {/* Disclaimer Note */}
                        <div
                            className={`
                                rounded-2xl
                                border
                                p-4
                                md:p-5
                                ${
                                    isDark
                                        ? "bg-gray-950 border-gray-800"
                                        : "bg-gray-50 border-gray-100"
                                }
                            `}
                        >
                            <div className="flex items-start gap-3">
                                <i className="bi bi-info-circle text-brand mt-1" />

                                <p
                                    className={`
                                        privacy-font
                                        text-xs
                                        md:text-sm
                                        leading-7
                                        ${
                                            isDark
                                                ? "text-gray-400"
                                                : "text-gray-500"
                                        }
                                    `}
                                >
                                    இந்த Privacy Policy DPI One-ன் தற்போதைய
                                    பயன்பாட்டு செயல்பாடுகளை அடிப்படையாகக் கொண்டது.
                                    இது சட்ட ஆலோசனை அல்ல.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="py-8 text-center">
                    <p
                        className={`
                            privacy-font
                            text-xs
                            ${isDark ? "text-gray-500" : "text-gray-400"}
                        `}
                    >
                        © {new Date().getFullYear()} DPI One
                    </p>
                </div>
            </div>
        </main>
    );
};

export default PrivacyPolicy;