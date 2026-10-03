import React from 'react';
import { useNavigate } from 'react-router-dom';

import tamilFont from './assets/10_உழவன் தமிழ்.ttf';

// ─────────────────────────────────────────────
// FONT SETUP
// Heading   → local Tamil font
// Paragraph → 10_உழவன் தமிழ்.ttf
// ─────────────────────────────────────────────

const FONT_STYLES = `
@font-face {
    font-family: "DpiTamilHeading";
    src: url("${tamilFont}") format("truetype");
    font-weight: 400;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: "DpiTamilBody";
    src: url("${tamilFont}") format("truetype");
    font-weight: 400;
    font-style: normal;
    font-display: swap;
}

.dpi-about-heading {
    font-family: "DpiTamilHeading", "Nirmala UI", sans-serif;
}

.dpi-about-body {
    font-family: "DpiTamilBody", "Nirmala UI", "Segoe UI", Arial, sans-serif;
}
`;

const AboutPage = ({ isDark }) => {
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
                ${isDark ? 'bg-gray-950' : 'bg-gray-50'}
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
                                ? 'border-gray-800 text-gray-300 hover:bg-gray-900'
                                : 'border-gray-200 text-gray-600 hover:bg-white'
                        }
                    `}
                >
                    <i className="bi bi-arrow-left text-sm" />
                    Back
                </button>


                {/* PAGE HEADER */}
                <header className="mb-6 md:mb-8">

                    <p className="text-[10px] uppercase tracking-[0.18em] font-black text-brand mb-2">
                        About DPI One
                    </p>

                    <h1
                        className={`
                            dpi-about-heading
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
                        வணக்கம் 👋 நான் DPI One!
                    </h1>

                    <p
                        className={`
                            dpi-about-body
                            mt-2
                            text-sm
                            md:text-base
                            leading-relaxed
                            max-w-2xl
                            ${
                                isDark
                                    ? 'text-gray-400'
                                    : 'text-gray-500'
                            }
                        `}
                    >
                        தர்மபுரியில் பஸ் தேடுறது கொஞ்சம் easy ஆக இருக்கணும்னு
                        என்னை உருவாக்கினாங்க.
                    </p>

                </header>


                {/* INTRO CARD */}
                <section
                    className={`
                        rounded-[2rem]
                        border
                        p-6
                        md:p-8
                        shadow-sm
                        ${
                            isDark
                                ? 'bg-gray-900 border-gray-800'
                                : 'bg-white border-gray-100'
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
                            mb-5
                            ${
                                isDark
                                    ? 'bg-gray-800 text-brand'
                                    : 'bg-brand/10 text-brand'
                            }
                        `}
                    >
                        <i className="bi bi-bus-front text-2xl" />
                    </div>

                    <p
                        className={`
                            dpi-about-body
                            text-sm
                            md:text-base
                            leading-8
                            ${
                                isDark
                                    ? 'text-gray-300'
                                    : 'text-gray-600'
                            }
                        `}
                    >
                        தர்மபுரியில் பஸ் எங்கே போகுது, எத்தனை மணிக்கு
                        கிளம்புது, நடுவில் எங்கே எல்லாம் நிற்குது என்று
                        தெரிஞ்சிக்க ஒவ்வொரு முறையும் யாரையாவது கேட்க வேண்டிய
                        அவசியம் இருக்கக்கூடாதுனு என்னை உருவாக்கினாங்க.
                    </p>

                    <p
                        className={`
                            dpi-about-body
                            mt-4
                            text-sm
                            md:text-base
                            leading-8
                            ${
                                isDark
                                    ? 'text-gray-300'
                                    : 'text-gray-600'
                            }
                        `}
                    >
                        நான் <strong>தர்மபுரி பேருந்து தகவல்களை ஒரே இடத்தில்
                        எளிமையாகக் காட்டும் ஒரு சிறிய முயற்சி.</strong>
                    </p>

                    <p
                        className={`
                            dpi-about-body
                            mt-4
                            text-sm
                            md:text-base
                            leading-8
                            ${
                                isDark
                                    ? 'text-gray-300'
                                    : 'text-gray-600'
                            }
                        `}
                    >
                        நீங்க உங்களுக்கு தேவையான இடத்தைத் தேடலாம்,
                        கிடைக்கிற பேருந்துகளைப் பார்க்கலாம், அதன்
                        வழித்தடத்தையும் நேரத்தையும் தெரிஞ்சிக்கலாம்.
                    </p>

                </section>


                {/* WHAT I HELP WITH */}
                <section className="mt-6 md:mt-8">

                    <div className="mb-4 px-1">

                        <p className="text-[10px] uppercase tracking-widest font-black text-brand">
                            What I do
                        </p>

                        <h2
                            className={`
                                dpi-about-heading
                                text-xl
                                md:text-2xl
                                font-black
                                mt-1
                                ${
                                    isDark
                                        ? 'text-white'
                                        : 'text-custom-dark'
                                }
                            `}
                        >
                            🚌 நான் உங்களுக்கு என்ன உதவி செய்வேன்?
                        </h2>

                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                        {/* ROUTES */}
                        <div
                            className={`
                                rounded-2xl
                                border
                                p-5
                                ${
                                    isDark
                                        ? 'bg-gray-900 border-gray-800'
                                        : 'bg-white border-gray-100'
                                }
                            `}
                        >

                            <div className="w-11 h-11 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-4">
                                <i className="bi bi-signpost-2 text-xl" />
                            </div>

                            <h3
                                className={`
                                    dpi-about-heading
                                    text-sm
                                    font-black
                                    ${
                                        isDark
                                            ? 'text-white'
                                            : 'text-custom-dark'
                                    }
                                `}
                            >
                                வழித்தடம் தேடலாம்
                            </h3>

                            <p
                                className={`
                                    dpi-about-body
                                    text-xs
                                    text-gray-400
                                    mt-2
                                    leading-relaxed
                                `}
                            >
                                நீங்க செல்ல வேண்டிய இடத்தைத் தேடி,
                                கிடைக்கிற பேருந்து வழித்தடங்களைப்
                                பார்க்கலாம்.
                            </p>

                        </div>


                        {/* TIMING */}
                        <div
                            className={`
                                rounded-2xl
                                border
                                p-5
                                ${
                                    isDark
                                        ? 'bg-gray-900 border-gray-800'
                                        : 'bg-white border-gray-100'
                                }
                            `}
                        >

                            <div className="w-11 h-11 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-4">
                                <i className="bi bi-clock text-xl" />
                            </div>

                            <h3
                                className={`
                                    dpi-about-heading
                                    text-sm
                                    font-black
                                    ${
                                        isDark
                                            ? 'text-white'
                                            : 'text-custom-dark'
                                    }
                                `}
                            >
                                நேரம் தெரிஞ்சிக்கலாம்
                            </h3>

                            <p
                                className={`
                                    dpi-about-body
                                    text-xs
                                    text-gray-400
                                    mt-2
                                    leading-relaxed
                                `}
                            >
                                பேருந்து எப்போது கிளம்பும்,
                                வழியில் எப்போது வரும் போன்ற
                                தகவல்களைப் பார்க்கலாம்.
                            </p>

                        </div>


                        {/* STOPS */}
                        <div
                            className={`
                                rounded-2xl
                                border
                                p-5
                                ${
                                    isDark
                                        ? 'bg-gray-900 border-gray-800'
                                        : 'bg-white border-gray-100'
                                }
                            `}
                        >

                            <div className="w-11 h-11 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-4">
                                <i className="bi bi-geo-alt text-xl" />
                            </div>

                            <h3
                                className={`
                                    dpi-about-heading
                                    text-sm
                                    font-black
                                    ${
                                        isDark
                                            ? 'text-white'
                                            : 'text-custom-dark'
                                    }
                                `}
                            >
                                நிறுத்தங்கள் பார்க்கலாம்
                            </h3>

                            <p
                                className={`
                                    dpi-about-body
                                    text-xs
                                    text-gray-400
                                    mt-2
                                    leading-relaxed
                                `}
                            >
                                வழியில் எந்தெந்த இடங்களில் பேருந்து
                                நிற்கிறது என்பதையும் தெரிஞ்சிக்கலாம்.
                            </p>

                        </div>

                    </div>

                </section>


                {/* SAVE ROUTES */}
                <section
                    className={`
                        mt-6
                        md:mt-8
                        rounded-[2rem]
                        border
                        p-6
                        md:p-8
                        ${
                            isDark
                                ? 'bg-gray-900 border-gray-800'
                                : 'bg-white border-gray-100'
                        }
                    `}
                >

                    <div className="flex items-start gap-4">

                        <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                            <i className="bi bi-bookmark text-xl" />
                        </div>

                        <div>

                            <h2
                                className={`
                                    dpi-about-heading
                                    text-lg
                                    md:text-xl
                                    font-black
                                    ${
                                        isDark
                                            ? 'text-white'
                                            : 'text-custom-dark'
                                    }
                                `}
                            >
                                அடிக்கடி தேடுற வழித்தடமா?
                            </h2>

                            <p
                                className={`
                                    dpi-about-body
                                    text-sm
                                    text-gray-400
                                    mt-2
                                    leading-7
                                `}
                            >
                                அப்படின்னா அதை <strong>Save</strong>
                                {' '}பண்ணிக்கலாம். அடுத்த தடவை அதே
                                வழித்தடத்தை மீண்டும் தேட வேண்டிய வேலை
                                இன்னும் சுலபமாகிடும்.
                            </p>

                        </div>

                    </div>

                </section>


                {/* COMMUNITY */}
                <section
                    className={`
                        mt-6
                        md:mt-8
                        rounded-[2rem]
                        border
                        p-6
                        md:p-8
                        ${
                            isDark
                                ? 'bg-gray-900 border-gray-800'
                                : 'bg-white border-gray-100'
                        }
                    `}
                >

                    <div className="flex items-start gap-4">

                        <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                            <i className="bi bi-people text-xl" />
                        </div>

                        <div>

                            <h2
                                className={`
                                    dpi-about-heading
                                    text-lg
                                    md:text-xl
                                    font-black
                                    ${
                                        isDark
                                            ? 'text-white'
                                            : 'text-custom-dark'
                                    }
                                `}
                            >
                                🤝 நீங்களும் என்னை வளர்க்கலாம்
                            </h2>

                            <p
                                className={`
                                    dpi-about-body
                                    text-sm
                                    text-gray-400
                                    mt-3
                                    leading-7
                                `}
                            >
                                என்னிடம் இருக்கும் தகவல்கள் எல்லாருக்கும்
                                பயனுள்ளதாக இருக்கணும் இல்லையா?
                            </p>

                            <p
                                className={`
                                    dpi-about-body
                                    text-sm
                                    text-gray-400
                                    mt-3
                                    leading-7
                                `}
                            >
                                அதனால்தான், உங்களுக்குத் தெரிந்த பேருந்து
                                வழித்தடத் தகவல்களையும் என்னுடன் பகிரலாம்.
                            </p>


                            {/* WARNING */}
                            <div
                                className={`
                                    mt-5
                                    rounded-2xl
                                    border
                                    p-4
                                    ${
                                        isDark
                                            ? 'bg-amber-950/20 border-amber-900/40'
                                            : 'bg-amber-50 border-amber-100'
                                    }
                                `}
                            >

                                <div className="flex items-start gap-3">

                                    <i
                                        className={`
                                            bi
                                            bi-exclamation-circle
                                            text-lg
                                            mt-0.5
                                            shrink-0
                                            ${
                                                isDark
                                                    ? 'text-amber-400'
                                                    : 'text-amber-600'
                                            }
                                        `}
                                    />

                                    <div>

                                        <p
                                            className={`
                                                dpi-about-heading
                                                text-xs
                                                font-black
                                                ${
                                                    isDark
                                                        ? 'text-amber-300'
                                                        : 'text-amber-700'
                                                }
                                            `}
                                        >
                                            ஒரு சின்ன வேண்டுகோள் 🙏
                                        </p>

                                        <p
                                            className={`
                                                dpi-about-body
                                                text-xs
                                                mt-1.5
                                                leading-6
                                                ${
                                                    isDark
                                                        ? 'text-amber-200/70'
                                                        : 'text-amber-800/70'
                                                }
                                            `}
                                        >
                                            ஏற்கனவே இருக்கும் தகவலை
                                            மீண்டும் மீண்டும் upload
                                            பண்ணாதீங்க. தவறான, போலியான
                                            அல்லது உறுதி செய்யப்படாத
                                            தகவல்களையும் பகிராதீங்க.
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <p
                                className={`
                                    dpi-about-body
                                    text-sm
                                    text-gray-400
                                    mt-4
                                    leading-7
                                `}
                            >
                                நீங்க அனுப்பும் தகவல்கள் சரிபார்க்கப்பட்ட
                                பிறகு, அது மற்ற பயணிகளுக்கும் உதவக்கூடும்.
                            </p>

                            <p
                                className={`
                                    dpi-about-body
                                    text-sm
                                    font-black
                                    mt-4
                                    ${
                                        isDark
                                            ? 'text-gray-200'
                                            : 'text-gray-700'
                                    }
                                `}
                            >
                                சரியான தகவல் மட்டும் பகிர்வோம்.
                                தர்மபுரி பயணத்தை இன்னும் எளிதாக்குவோம். 🚌💜
                            </p>

                        </div>

                    </div>

                </section>


                {/* PURPOSE */}
                <section
                    className={`
                        mt-6
                        md:mt-8
                        rounded-[2rem]
                        border
                        p-6
                        md:p-8
                        text-center
                        ${
                            isDark
                                ? 'bg-gray-900 border-gray-800'
                                : 'bg-white border-gray-100'
                        }
                    `}
                >

                    <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto">
                        <i className="bi bi-heart text-2xl" />
                    </div>

                    <p className="text-[10px] uppercase tracking-widest font-black text-brand mt-5">
                        My purpose
                    </p>

                    <h2
                        className={`
                            dpi-about-heading
                            text-xl
                            md:text-2xl
                            font-black
                            mt-2
                            ${
                                isDark
                                    ? 'text-white'
                                    : 'text-custom-dark'
                            }
                        `}
                    >
                        நான் எதற்காக இருக்கிறேன்?
                    </h2>

                    <p
                        className={`
                            dpi-about-body
                            text-sm
                            md:text-base
                            text-gray-400
                            mt-4
                            leading-8
                            max-w-2xl
                            mx-auto
                        `}
                    >
                        ரொம்ப simple.
                        <br />
                        <strong className="text-brand">
                            தர்மபுரியில் பஸ் தகவலை தேடுறதை கொஞ்சம்
                            எளிதாக்க.
                        </strong>
                    </p>

                    <p
                        className={`
                            dpi-about-body
                            text-sm
                            text-gray-400
                            mt-4
                            leading-7
                            max-w-2xl
                            mx-auto
                        `}
                    >
                        பெரிய பெரிய விஷயங்கள் வேண்டாம்.
                        நீங்க ஒரு பஸ் தேடும்போது, உங்களுக்கு தேவையான
                        தகவல் சரியான இடத்தில் கிடைத்தால் போதும்.
                    </p>

                </section>


                {/* FINAL MESSAGE */}
                <section
                    className={`
                        mt-6
                        md:mt-8
                        mb-4
                        rounded-[2rem]
                        p-6
                        md:p-8
                        text-center
                        ${
                            isDark
                                ? 'bg-brand/10 border border-brand/20'
                                : 'bg-brand/5 border border-brand/10'
                        }
                    `}
                >

                    <p className="text-[10px] uppercase tracking-widest font-black text-brand">
                        One small effort
                    </p>

                    <h2
                        className={`
                            dpi-about-heading
                            text-xl
                            md:text-2xl
                            font-black
                            mt-2
                            ${
                                isDark
                                    ? 'text-white'
                                    : 'text-custom-dark'
                            }
                        `}
                    >
                        💜 ஒரு சிறிய முயற்சி
                    </h2>

                    <p
                        className={`
                            dpi-about-body
                            text-sm
                            md:text-base
                            mt-4
                            leading-8
                            max-w-2xl
                            mx-auto
                            ${
                                isDark
                                    ? 'text-gray-300'
                                    : 'text-gray-600'
                            }
                        `}
                    >
                        நான் இன்னும் வளர்ந்து கொண்டிருக்கிறேன்.
                        மேலும் நல்ல வழித்தடங்கள், நேரங்கள் மற்றும்
                        தகவல்கள் கிடைக்கும்போது, அவற்றை உங்களுக்கு
                        இன்னும் எளிமையாகக் கொண்டு வர நான் முயற்சி செய்கிறேன்.
                    </p>

                    <p
                        className={`
                            dpi-about-body
                            text-base
                            md:text-lg
                            font-black
                            mt-5
                            ${
                                isDark
                                    ? 'text-white'
                                    : 'text-custom-dark'
                            }
                        `}
                    >
                        நீங்க தேடுற பஸ்ஸை கண்டுபிடிக்க
                        <span className="text-brand">
                            {' '}நான் இங்கே இருக்கிறேன். 🚌💜
                        </span>
                    </p>

                    <p className="text-xs text-gray-400 font-black mt-5">
                        — DPI One
                    </p>

                </section>

            </div>
        </main>
    );
};

export default AboutPage;