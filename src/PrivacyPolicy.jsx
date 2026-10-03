import React from "react";
import { useNavigate } from "react-router-dom";

import font206 from "./assets/10_உழவன் தமிழ்.TTF";
import bodyFont from "./assets/10_உழவன் தமிழ்.ttf";

const FONT_STYLES = `
@font-face {
    font-family: "Dpi206";
    src: url("${font206}") format("truetype");
    font-weight: 400;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: "DpiTamilBody";
    src: url("${bodyFont}") format("truetype");
    font-weight: 400;
    font-style: normal;
    font-display: swap;
}

.privacy-title-font {
    font-family: "Dpi206", "Nirmala UI", sans-serif;
}

.privacy-body-font {
    font-family: "DpiTamilBody", "Nirmala UI", "Segoe UI", Arial, sans-serif;
}
`;

const PrivacyPolicy = ({ isDark = false }) => {
    const navigate = useNavigate();

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

                {/* BACK BUTTON */}
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


                {/* PAGE HEADER */}
                <header className="mb-6 md:mb-8">

                    <p className="text-[10px] uppercase tracking-[0.18em] font-black text-brand mb-2">
                        Privacy Policy
                    </p>

                    <h1
                        className={`
                            privacy-title-font
                            text-3xl
                            md:text-4xl
                            font-black
                            tracking-tight
                            ${
                                isDark
                                    ? "text-white"
                                    : "text-custom-dark"
                            }
                        `}
                    >
                        DPI One & Privacy Policy
                    </h1>

                    <p
                        className={`
                            privacy-body-font
                            mt-2
                            text-sm
                            md:text-base
                            ${
                                isDark
                                    ? "text-gray-400"
                                    : "text-gray-500"
                            }
                        `}
                    >
                        கடைசியாக புதுப்பிக்கப்பட்டது: அக்டோபர் 2026
                    </p>

                </header>


                {/* MAIN CARD */}
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

                    {/* INTRO ICON */}
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

                        {/* SECTION 1 */}
                        <section>

                            <h2
                                className={`
                                    privacy-title-font
                                    text-xl
                                    md:text-2xl
                                    font-black
                                    mb-3
                                    ${
                                        isDark
                                            ? "text-white"
                                            : "text-custom-dark"
                                    }
                                `}
                            >
                                1. தகவல் சேகரிப்பு
                            </h2>

                            <p
                                className={`
                                    privacy-body-font
                                    text-sm
                                    md:text-base
                                    leading-8
                                    ${
                                        isDark
                                            ? "text-gray-300"
                                            : "text-gray-600"
                                    }
                                `}
                            >
                                DPI One-ன் முக்கிய நோக்கம் பேருந்து தொடர்பான
                                தகவல்களை பயணிகளுக்கு வழங்குவதாகும்.
                            </p>

                            <p
                                className={`
                                    privacy-body-font
                                    mt-3
                                    text-sm
                                    md:text-base
                                    leading-8
                                    ${
                                        isDark
                                            ? "text-gray-300"
                                            : "text-gray-600"
                                    }
                                `}
                            >
                                DPI One தனிப்பட்ட தகவல்களை சேமிப்பதை
                                நோக்கமாகக் கொண்டிருக்கவில்லை.
                            </p>

                            <p
                                className={`
                                    privacy-body-font
                                    mt-3
                                    text-sm
                                    md:text-base
                                    leading-8
                                    ${
                                        isDark
                                            ? "text-gray-300"
                                            : "text-gray-600"
                                    }
                                `}
                            >
                                பயனர்களின்:
                            </p>

                            <ul
                                className={`
                                    privacy-body-font
                                    mt-3
                                    pl-6
                                    list-disc
                                    space-y-2
                                    text-sm
                                    md:text-base
                                    leading-8
                                    ${
                                        isDark
                                            ? "text-gray-300"
                                            : "text-gray-600"
                                    }
                                `}
                            >
                                <li>பெயர்</li>
                                <li>மின்னஞ்சல் முகவரி</li>
                                <li>தொலைபேசி எண்</li>
                                <li>வீட்டு முகவரி</li>
                                <li>GPS / Location தகவல்</li>
                                <li>பிற தனிப்பட்ட தகவல்கள்</li>
                            </ul>

                            <p
                                className={`
                                    privacy-body-font
                                    mt-3
                                    text-sm
                                    md:text-base
                                    leading-8
                                    ${
                                        isDark
                                            ? "text-gray-300"
                                            : "text-gray-600"
                                    }
                                `}
                            >
                                ஆகியவை DPI One-ன் பேருந்து தகவல் சேவைக்காக
                                சேமிக்கப்படுவதில்லை.
                            </p>

                        </section>


                        {/* DIVIDER */}
                        <div
                            className={`h-px ${
                                isDark
                                    ? "bg-gray-800"
                                    : "bg-gray-100"
                            }`}
                        />


                        {/* SECTION 2 */}
                        <section>

                            <h2
                                className={`
                                    privacy-title-font
                                    text-xl
                                    md:text-2xl
                                    font-black
                                    mb-3
                                    ${
                                        isDark
                                            ? "text-white"
                                            : "text-custom-dark"
                                    }
                                `}
                            >
                                2. சேமிக்கப்படும் தகவல்கள்
                            </h2>

                            <p
                                className={`
                                    privacy-body-font
                                    text-sm
                                    md:text-base
                                    leading-8
                                    ${
                                        isDark
                                            ? "text-gray-300"
                                            : "text-gray-600"
                                    }
                                `}
                            >
                                DPI One-ல் சேமிக்கப்படும் தகவல்கள் பேருந்து
                                சேவை தொடர்பான தகவல்கள் மட்டுமே.
                            </p>

                            <p
                                className={`
                                    privacy-body-font
                                    mt-3
                                    text-sm
                                    md:text-base
                                    leading-8
                                    ${
                                        isDark
                                            ? "text-gray-300"
                                            : "text-gray-600"
                                    }
                                `}
                            >
                                உதாரணமாக:
                            </p>

                            <ul
                                className={`
                                    privacy-body-font
                                    mt-3
                                    pl-6
                                    list-disc
                                    space-y-2
                                    text-sm
                                    md:text-base
                                    leading-8
                                    ${
                                        isDark
                                            ? "text-gray-300"
                                            : "text-gray-600"
                                    }
                                `}
                            >
                                <li>பேருந்து வழித்தடம்</li>
                                <li>தொடக்க இடம் மற்றும் சேருமிடம்</li>
                                <li>பேருந்து நேரம்</li>
                                <li>பேருந்து நிறுத்தங்கள்</li>
                                <li>பேருந்து எண் / route தகவல்கள்</li>
                                <li>
                                    பேருந்து சேவையை விளக்கும் பிற
                                    தொடர்புடைய தகவல்கள்
                                </li>
                            </ul>

                            <p
                                className={`
                                    privacy-body-font
                                    mt-3
                                    text-sm
                                    md:text-base
                                    leading-8
                                    ${
                                        isDark
                                            ? "text-gray-300"
                                            : "text-gray-600"
                                    }
                                `}
                            >
                                இந்த தகவல்கள் பயணிகளுக்கு பேருந்து சேவையை
                                எளிதாகக் கண்டறிந்து பயன்படுத்த உதவும்
                                நோக்கத்திற்காக மட்டுமே பயன்படுத்தப்படுகின்றன.
                            </p>

                        </section>


                        {/* DIVIDER */}
                        <div
                            className={`h-px ${
                                isDark
                                    ? "bg-gray-800"
                                    : "bg-gray-100"
                            }`}
                        />


                        {/* SECTION 3 */}
                        <section>

                            <h2
                                className={`
                                    privacy-title-font
                                    text-xl
                                    md:text-2xl
                                    font-black
                                    mb-3
                                    ${
                                        isDark
                                            ? "text-white"
                                            : "text-custom-dark"
                                    }
                                `}
                            >
                                3. தனிப்பட்ட தகவல்கள்
                            </h2>

                            <p
                                className={`
                                    privacy-body-font
                                    text-sm
                                    md:text-base
                                    leading-8
                                    ${
                                        isDark
                                            ? "text-gray-300"
                                            : "text-gray-600"
                                    }
                                `}
                            >
                                DPI One-ன் பேருந்து தகவல் சேவைக்காக
                                பயனர்களின் தனிப்பட்ட தகவல்கள்
                                சேமிக்கப்படுவதில்லை.
                            </p>

                            <p
                                className={`
                                    privacy-body-font
                                    mt-3
                                    text-sm
                                    md:text-base
                                    leading-8
                                    ${
                                        isDark
                                            ? "text-gray-300"
                                            : "text-gray-600"
                                    }
                                `}
                            >
                                ஒரு பயனர் வழங்கும் பேருந்து தகவலில்
                                தவறுதலாக தனிப்பட்ட தகவல் சேர்க்கப்பட்டிருந்தால்,
                                அந்தத் தகவலை தேவையற்றதாகக் கருதி
                                அகற்றுவதற்கான நடவடிக்கை எடுக்கப்படலாம்.
                            </p>

                        </section>


                        {/* DIVIDER */}
                        <div
                            className={`h-px ${
                                isDark
                                    ? "bg-gray-800"
                                    : "bg-gray-100"
                            }`}
                        />


                        {/* SECTION 4 */}
                        <section>

                            <h2
                                className={`
                                    privacy-title-font
                                    text-xl
                                    md:text-2xl
                                    font-black
                                    mb-3
                                    ${
                                        isDark
                                            ? "text-white"
                                            : "text-custom-dark"
                                    }
                                `}
                            >
                                4. தகவல்களின் பயன்பாடு
                            </h2>

                            <p
                                className={`
                                    privacy-body-font
                                    text-sm
                                    md:text-base
                                    leading-8
                                    ${
                                        isDark
                                            ? "text-gray-300"
                                            : "text-gray-600"
                                    }
                                `}
                            >
                                சேமிக்கப்படும் பேருந்து தகவல்கள் DPI One-ல்
                                பேருந்து வழித்தடங்கள், நேரங்கள் மற்றும்
                                நிறுத்தங்களை பயணிகளுக்குக் காண்பிப்பதற்காக
                                பயன்படுத்தப்படுகின்றன.
                            </p>

                            <p
                                className={`
                                    privacy-body-font
                                    mt-3
                                    text-sm
                                    md:text-base
                                    leading-8
                                    ${
                                        isDark
                                            ? "text-gray-300"
                                            : "text-gray-600"
                                    }
                                `}
                            >
                                இந்த தகவல்கள் தனிப்பட்ட நபரைப் பற்றிய
                                profile உருவாக்குவதற்காக
                                பயன்படுத்தப்படுவதில்லை.
                            </p>

                        </section>


                        {/* DIVIDER */}
                        <div
                            className={`h-px ${
                                isDark
                                    ? "bg-gray-800"
                                    : "bg-gray-100"
                            }`}
                        />


                        {/* SECTION 5 */}
                        <section>

                            <h2
                                className={`
                                    privacy-title-font
                                    text-xl
                                    md:text-2xl
                                    font-black
                                    mb-3
                                    ${
                                        isDark
                                            ? "text-white"
                                            : "text-custom-dark"
                                    }
                                `}
                            >
                                5. தகவல் பாதுகாப்பு
                            </h2>

                            <p
                                className={`
                                    privacy-body-font
                                    text-sm
                                    md:text-base
                                    leading-8
                                    ${
                                        isDark
                                            ? "text-gray-300"
                                            : "text-gray-600"
                                    }
                                `}
                            >
                                DPI One-ல் சேமிக்கப்படும் பேருந்து
                                தொடர்பான தகவல்களை பாதுகாப்பாக
                                நிர்வகிக்க பொருத்தமான நடவடிக்கைகள்
                                எடுக்கப்படுகின்றன.
                            </p>

                        </section>


                        {/* DIVIDER */}
                        <div
                            className={`h-px ${
                                isDark
                                    ? "bg-gray-800"
                                    : "bg-gray-100"
                            }`}
                        />


                        {/* SECTION 6 */}
                        <section>

                            <h2
                                className={`
                                    privacy-title-font
                                    text-xl
                                    md:text-2xl
                                    font-black
                                    mb-3
                                    ${
                                        isDark
                                            ? "text-white"
                                            : "text-custom-dark"
                                    }
                                `}
                            >
                                6. Privacy Policy மாற்றங்கள்
                            </h2>

                            <p
                                className={`
                                    privacy-body-font
                                    text-sm
                                    md:text-base
                                    leading-8
                                    ${
                                        isDark
                                            ? "text-gray-300"
                                            : "text-gray-600"
                                    }
                                `}
                            >
                                DPI One-ன் செயல்பாடுகளில் மாற்றங்கள்
                                ஏற்பட்டால், அதற்கேற்ப இந்த Privacy Policy
                                புதுப்பிக்கப்படலாம்.
                            </p>

                            <p
                                className={`
                                    privacy-body-font
                                    mt-3
                                    text-sm
                                    md:text-base
                                    leading-8
                                    ${
                                        isDark
                                            ? "text-gray-300"
                                            : "text-gray-600"
                                    }
                                `}
                            >
                                புதுப்பிக்கப்பட்ட Privacy Policy
                                DPI One-ல் வெளியிடப்படும்.
                            </p>

                        </section>


                        {/* DIVIDER */}
                        <div
                            className={`h-px ${
                                isDark
                                    ? "bg-gray-800"
                                    : "bg-gray-100"
                            }`}
                        />


                        {/* SECTION 7 */}
                        <section>

                            <h2
                                className={`
                                    privacy-title-font
                                    text-xl
                                    md:text-2xl
                                    font-black
                                    mb-3
                                    ${
                                        isDark
                                            ? "text-white"
                                            : "text-custom-dark"
                                    }
                                `}
                            >
                                7. தொடர்பு
                            </h2>

                            <p
                                className={`
                                    privacy-body-font
                                    text-sm
                                    md:text-base
                                    leading-8
                                    ${
                                        isDark
                                            ? "text-gray-300"
                                            : "text-gray-600"
                                    }
                                `}
                            >
                                இந்த Privacy Policy அல்லது DPI One-ல்
                                சேமிக்கப்படும் தகவல்கள் தொடர்பாக ஏதேனும்
                                கேள்விகள் இருந்தால், DPI One வழங்கும்
                                தொடர்பு வழிமுறைகள் மூலம் எங்களை அணுகலாம்.
                            </p>

                        </section>

                    </div>

                </section>


                {/* FOOTER */}
                <div className="py-8 text-center">

                    <p
                        className={`
                            privacy-body-font
                            text-xs
                            ${
                                isDark
                                    ? "text-gray-500"
                                    : "text-gray-400"
                            }
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