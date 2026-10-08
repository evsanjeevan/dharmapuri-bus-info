import React from "react";
import { useNavigate } from "react-router-dom";

import font206 from "./assets/10_உழவன் தமிழ்.ttf";

const Disclaimer = ({ isDark = false }) => {
  const navigate = useNavigate();

  return (
    <>
      <style>
        {`
          @font-face {
            font-family: "DPI206";
            src: url("${font206}") format("truetype");
            font-weight: 100 900;
            font-style: normal;
            font-display: swap;
          }

          .disclaimer-page {
            font-family: "DPI206", sans-serif;
          }
        `}
      </style>

      <div
        className={`disclaimer-page min-h-screen w-full transition-colors duration-300 ${
          isDark
            ? "bg-gray-950 text-gray-100"
            : "bg-[#FBFBFD] text-[#17162A]"
        }`}
      >
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={`mb-6 inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 active:scale-95 ${
              isDark
                ? "border-gray-700 bg-gray-900 text-gray-200 hover:bg-gray-800"
                : "border-[#EAE9F1] bg-white text-[#5B5A6E] hover:bg-[#F4F2FF] hover:text-[#6D5CE7]"
            }`}
          >
            <i className="bi bi-arrow-left" />
            <span>Back</span>
          </button>

          {/* Main Card */}
          <div
            className={`overflow-hidden rounded-3xl border shadow-sm ${
              isDark
                ? "border-gray-800 bg-gray-900"
                : "border-[#EAE9F1] bg-white"
            }`}
          >

            {/* Header */}
            <div
              className={`border-b px-6 py-7 sm:px-8 sm:py-8 lg:px-10 ${
                isDark
                  ? "border-gray-800"
                  : "border-[#EAE9F1]"
              }`}
            >
              <div className="flex items-start gap-4">

                {/* Disclaimer Icon */}
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                    isDark
                      ? "bg-[#302A5F]"
                      : "bg-[#F1EFFC]"
                  }`}
                >
                  <i
                    className={`bi bi-exclamation text-xl ${
                      isDark
                        ? "text-[#AFA6FF]"
                        : "text-[#6D5CE7]"
                    }`}
                  />
                </div>

                {/* Title */}
                <div className="min-w-0">
                  <h1
                    className={`text-3xl leading-tight sm:text-4xl ${
                      isDark
                        ? "text-white"
                        : "text-[#17162A]"
                    }`}
                  >
                    DPI One - Disclaimer
                  </h1>

                  <p
                    className={`mt-2 text-sm ${
                      isDark
                        ? "text-gray-400"
                        : "text-[#9997A8]"
                    }`}
                  >
                    கடைசியாக புதுப்பிக்கப்பட்டது: அக்டோபர் 2026
                  </p>
                </div>

              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
              <div className="space-y-8">

                {/* Section 1 */}
                <section>
                  <h2
                    className={`mb-3 text-xl sm:text-2xl ${
                      isDark
                        ? "text-white"
                        : "text-[#17162A]"
                    }`}
                  >
                    1. பொதுத் தகவல்
                  </h2>

                  <p
                    className={`text-base leading-8 ${
                      isDark
                        ? "text-gray-300"
                        : "text-[#5B5A6E]"
                    }`}
                  >
                    DPI One என்பது தர்மபுரி மற்றும் சுற்றுப்புற
                    பகுதிகளில் இயங்கும் பேருந்துகளின் வழித்தடங்கள்,
                    நேரங்கள், நிறுத்தங்கள் மற்றும் தொடர்புடைய
                    பொதுப் போக்குவரத்து தகவல்களை பயணிகளுக்கு
                    எளிதாகக் காண்பிக்க உருவாக்கப்பட்ட ஒரு தகவல்
                    வழிகாட்டி தளமாகும்.
                  </p>
                </section>

                <div
                  className={`h-px w-full ${
                    isDark
                      ? "bg-gray-800"
                      : "bg-[#EAE9F1]"
                  }`}
                />

                {/* Section 2 */}
                <section>
                  <h2
                    className={`mb-3 text-xl sm:text-2xl ${
                      isDark
                        ? "text-white"
                        : "text-[#17162A]"
                    }`}
                  >
                    2. பேருந்து தகவல்களின் துல்லியம்
                  </h2>

                  <p
                    className={`text-base leading-8 ${
                      isDark
                        ? "text-gray-300"
                        : "text-[#5B5A6E]"
                    }`}
                  >
                    DPI One-ல் காட்டப்படும் பேருந்து நேரங்கள்,
                    வழித்தடங்கள், நிறுத்தங்கள், கட்டணங்கள் மற்றும்
                    பிற தகவல்கள் காலப்போக்கில் மாறக்கூடும்.
                    போக்குவரத்து நிர்வாக மாற்றங்கள், பேருந்து
                    இயக்க மாற்றங்கள், தாமதங்கள், ரத்து செய்யப்படுதல்
                    அல்லது பிற காரணங்களால் இணையதளத்தில் காணப்படும்
                    தகவல்களுக்கும் உண்மையான சேவைக்கும் வேறுபாடு
                    இருக்கலாம்.
                  </p>

                  <p
                    className={`mt-3 text-base leading-8 ${
                      isDark
                        ? "text-gray-300"
                        : "text-[#5B5A6E]"
                    }`}
                  >
                    எனவே பயணத்தைத் தொடங்குவதற்கு முன் தேவையான
                    தகவல்களை சம்பந்தப்பட்ட பேருந்து சேவை அல்லது
                    அதிகாரப்பூர்வ ஆதாரத்துடன் உறுதிப்படுத்துவது
                    பயனுள்ளதாகும்.
                  </p>
                </section>

                <div
                  className={`h-px w-full ${
                    isDark
                      ? "bg-gray-800"
                      : "bg-[#EAE9F1]"
                  }`}
                />

                {/* Section 3 */}
                <section>
                  <h2
                    className={`mb-3 text-xl sm:text-2xl ${
                      isDark
                        ? "text-white"
                        : "text-[#17162A]"
                    }`}
                  >
                    3. பயனர் சமர்ப்பிக்கும் தகவல்கள்
                  </h2>

                  <p
                    className={`text-base leading-8 ${
                      isDark
                        ? "text-gray-300"
                        : "text-[#5B5A6E]"
                    }`}
                  >
                    DPI One-க்கு பயனர்கள் சமர்ப்பிக்கும் பேருந்து
                    தகவல்கள் முதலில் சரிபார்ப்பு செயல்முறைக்கு
                    உட்படுத்தப்படலாம். சமர்ப்பிக்கப்பட்ட தகவல்கள்
                    சரிபார்க்கப்பட்ட பின்னரே பொதுப் பயன்பாட்டில்
                    காட்டப்படலாம்.
                  </p>

                  <p
                    className={`mt-3 text-base leading-8 ${
                      isDark
                        ? "text-gray-300"
                        : "text-[#5B5A6E]"
                    }`}
                  >
                    தவறான, போலியான, முழுமையற்ற அல்லது உறுதி செய்யப்படாத
                    தகவல்களைப் பகிர்வதைத் தவிர்க்கவும்.
                  </p>
                </section>

                <div
                  className={`h-px w-full ${
                    isDark
                      ? "bg-gray-800"
                      : "bg-[#EAE9F1]"
                  }`}
                />

                {/* Section 4 */}
                <section>
                  <h2
                    className={`mb-3 text-xl sm:text-2xl ${
                      isDark
                        ? "text-white"
                        : "text-[#17162A]"
                    }`}
                  >
                    4. பயண முடிவுகளுக்கான பொறுப்பு
                  </h2>

                  <p
                    className={`text-base leading-8 ${
                      isDark
                        ? "text-gray-300"
                        : "text-[#5B5A6E]"
                    }`}
                  >
                    DPI One வழங்கும் தகவல்களை அடிப்படையாகக் கொண்டு
                    பயணத்தைத் திட்டமிடும் போது இறுதி முடிவு
                    பயனருடையதாகும். பேருந்து சேவை தாமதம்,
                    மாற்றம், ரத்து, தவறவிடுதல் அல்லது வேறு
                    போக்குவரத்து சிக்கல்களுக்கு DPI One பொறுப்பாகாது.
                  </p>
                </section>

                <div
                  className={`h-px w-full ${
                    isDark
                      ? "bg-gray-800"
                      : "bg-[#EAE9F1]"
                  }`}
                />

                {/* Section 5 */}
                <section>
                  <h2
                    className={`mb-3 text-xl sm:text-2xl ${
                      isDark
                        ? "text-white"
                        : "text-[#17162A]"
                    }`}
                  >
                    5. வெளிப்புற சேவைகள்
                  </h2>

                  <p
                    className={`text-base leading-8 ${
                      isDark
                        ? "text-gray-300"
                        : "text-[#5B5A6E]"
                    }`}
                  >
                    DPI One-ல் குறிப்பிடப்படும் அல்லது இணைக்கப்படும்
                    வெளிப்புற சேவைகள், நிறுவனங்கள் அல்லது மூன்றாம்
                    தரப்பு ஆதாரங்களின் செயல்பாடு, துல்லியம் அல்லது
                    கிடைக்கும் தன்மைக்கு DPI One பொறுப்பேற்காது.
                  </p>
                </section>

                <div
                  className={`h-px w-full ${
                    isDark
                      ? "bg-gray-800"
                      : "bg-[#EAE9F1]"
                  }`}
                />

                {/* Section 6 */}
                <section>
                  <h2
                    className={`mb-3 text-xl sm:text-2xl ${
                      isDark
                        ? "text-white"
                        : "text-[#17162A]"
                    }`}
                  >
                    6. தகவல் மாற்றங்கள்
                  </h2>

                  <p
                    className={`text-base leading-8 ${
                      isDark
                        ? "text-gray-300"
                        : "text-[#5B5A6E]"
                    }`}
                  >
                    பேருந்து வழித்தடங்கள், நேரங்கள், நிறுத்தங்கள்
                    மற்றும் பிற போக்குவரத்து தகவல்கள் எந்த நேரத்திலும்
                    மாற்றப்படலாம். DPI One-ல் உள்ள தகவல்களும்
                    தேவைக்கேற்ப புதுப்பிக்கப்படலாம் அல்லது
                    திருத்தப்படலாம்.
                  </p>
                </section>

                <div
                  className={`h-px w-full ${
                    isDark
                      ? "bg-gray-800"
                      : "bg-[#EAE9F1]"
                  }`}
                />

                {/* Important Notice */}
                <section
                  className={`rounded-2xl border p-5 ${
                    isDark
                      ? "border-[#4A456F] bg-[#201D35]"
                      : "border-[#DDD8FA] bg-[#F7F5FF]"
                  }`}
                >
                  <div className="flex items-start gap-3">

                    <i
                      className={`bi bi-exclamation text-lg ${
                        isDark
                          ? "text-[#AFA6FF]"
                          : "text-[#6D5CE7]"
                      }`}
                    />

                    <div>
                      <h3
                        className={`text-base ${
                          isDark
                            ? "text-white"
                            : "text-[#17162A]"
                        }`}
                      >
                        முக்கிய அறிவிப்பு
                      </h3>

                      <p
                        className={`mt-2 text-sm leading-7 ${
                          isDark
                            ? "text-gray-300"
                            : "text-[#5B5A6E]"
                        }`}
                      >
                        DPI One ஒரு தகவல் வழிகாட்டி தளம் மட்டுமே.
                        அதிகாரப்பூர்வ போக்குவரத்து நிறுவனத்தின்
                        நேரடி மாற்றங்கள் அல்லது உடனடி அறிவிப்புகளுக்கு
                        இது மாற்றாக கருதப்படக்கூடாது.
                      </p>
                    </div>
                  </div>
                </section>

              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="py-8 text-center">
            <p
              className={`text-sm ${
                isDark
                  ? "text-gray-500"
                  : "text-[#9997A8]"
              }`}
            >
              © 2026 DPI One. All rights reserved.
            </p>
          </div>

        </div>
      </div>
    </>
  );
};

export default Disclaimer;