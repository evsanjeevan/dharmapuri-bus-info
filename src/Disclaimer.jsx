import React from "react";
import { useNavigate } from "react-router-dom";

import font206 from "./assets/10_உழவன் தமிழ்.TTF";
import tamilFont from "./assets/10_உழவன் தமிழ்.TTF";

const Disclaimer = ({ isDark = false }) => {
  const navigate = useNavigate();

  return (
    <>
      <style>
        {`
          @font-face {
            font-family: "DPI206";
            src: url("${font206}") format("truetype");
            font-weight: 400;
            font-style: normal;
            font-display: swap;
          }

          @font-face {
            font-family: "DPITamilUNI007";
            src: url("${tamilFont}") format("truetype");
            font-weight: 400;
            font-style: normal;
            font-display: swap;
          }

          .disclaimer-title-font {
            font-family: "DPI206", sans-serif;
          }

          .disclaimer-body-font {
            font-family: "DPITamilUNI007", sans-serif;
          }
        `}
      </style>

      <div
        className={`min-h-screen w-full transition-colors duration-300 ${
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
            <i className="bi bi-arrow-left"></i>
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
                isDark ? "border-gray-800" : "border-[#EAE9F1]"
              }`}
            >
              <div className="flex items-start gap-4">

                {/* Disclaimer Icon */}
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                    isDark ? "bg-[#302A5F]" : "bg-[#F1EFFC]"
                  }`}
                >
                  <i
                    className={`bi bi-exclamation text-xl ${
                      isDark ? "text-[#AFA6FF]" : "text-[#6D5CE7]"
                    }`}
                  ></i>
                </div>

                {/* Title */}
                <div className="min-w-0">
                  <h1
                    className={`disclaimer-title-font text-3xl leading-tight sm:text-4xl ${
                      isDark ? "text-white" : "text-[#17162A]"
                    }`}
                  >
                    DPI One & Disclaimer
                  </h1>

                  <p
                    className={`disclaimer-body-font mt-2 text-sm ${
                      isDark ? "text-gray-400" : "text-[#9997A8]"
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
                    className={`disclaimer-title-font mb-3 text-xl sm:text-2xl ${
                      isDark ? "text-white" : "text-[#17162A]"
                    }`}
                  >
                    1. பொதுவான தகவல்
                  </h2>

                  <p
                    className={`disclaimer-body-font text-base leading-8 ${
                      isDark ? "text-gray-300" : "text-[#5B5A6E]"
                    }`}
                  >
                    DPI One-ல் வழங்கப்படும் பேருந்து வழித்தடங்கள்,
                    நேரங்கள், நிறுத்தங்கள் மற்றும் பிற போக்குவரத்து
                    தொடர்பான தகவல்கள் பயணிகளுக்கு உதவும் நோக்கத்திற்காக
                    மட்டுமே வழங்கப்படுகின்றன.
                  </p>

                  <p
                    className={`disclaimer-body-font mt-3 text-base leading-8 ${
                      isDark ? "text-gray-300" : "text-[#5B5A6E]"
                    }`}
                  >
                    இந்தத் தகவல்கள் எப்போதும் முழுமையாகவும்,
                    துல்லியமாகவும் அல்லது தற்போதைய நிலையில் இருக்கும்
                    என்றும் DPI One உறுதி அளிக்காது.
                  </p>
                </section>

                {/* Divider */}
                <div
                  className={`h-px w-full ${
                    isDark ? "bg-gray-800" : "bg-[#EAE9F1]"
                  }`}
                />

                {/* Section 2 */}
                <section>
                  <h2
                    className={`disclaimer-title-font mb-3 text-xl sm:text-2xl ${
                      isDark ? "text-white" : "text-[#17162A]"
                    }`}
                  >
                    2. தகவல் மாற்றங்கள்
                  </h2>

                  <p
                    className={`disclaimer-body-font text-base leading-8 ${
                      isDark ? "text-gray-300" : "text-[#5B5A6E]"
                    }`}
                  >
                    பேருந்து நேரங்கள், வழித்தடங்கள், நிறுத்தங்கள் மற்றும்
                    சேவைகளில் காலப்போக்கில் மாற்றங்கள் ஏற்படலாம்.
                  </p>

                  <p
                    className={`disclaimer-body-font mt-3 text-base leading-8 ${
                      isDark ? "text-gray-300" : "text-[#5B5A6E]"
                    }`}
                  >
                    போக்குவரத்து மாற்றங்கள், நிர்வாக முடிவுகள், சாலைப்
                    பணிகள், அவசரநிலைகள் அல்லது பிற காரணங்களால்,
                    DPI One-ல் காணப்படும் தகவல்களுக்கும் உண்மையான
                    பேருந்து சேவைக்கும் வேறுபாடு இருக்கலாம்.
                  </p>
                </section>

                {/* Divider */}
                <div
                  className={`h-px w-full ${
                    isDark ? "bg-gray-800" : "bg-[#EAE9F1]"
                  }`}
                />

                {/* Section 3 */}
                <section>
                  <h2
                    className={`disclaimer-title-font mb-3 text-xl sm:text-2xl ${
                      isDark ? "text-white" : "text-[#17162A]"
                    }`}
                  >
                    3. பயணத்திற்கு முன் சரிபார்த்தல்
                  </h2>

                  <p
                    className={`disclaimer-body-font text-base leading-8 ${
                      isDark ? "text-gray-300" : "text-[#5B5A6E]"
                    }`}
                  >
                    முக்கியமான அல்லது அவசரமான பயணங்களுக்கு,
                    பயணிகள் சம்பந்தப்பட்ட பேருந்து சேவை அல்லது
                    அதிகாரப்பூர்வ தகவல் மூலம் பேருந்து நேரம் மற்றும்
                    வழித்தடத்தைச் சரிபார்த்துக் கொள்வது பரிந்துரைக்கப்படுகிறது.
                  </p>

                  <p
                    className={`disclaimer-body-font mt-3 text-base leading-8 ${
                      isDark ? "text-gray-300" : "text-[#5B5A6E]"
                    }`}
                  >
                    DPI One-ல் காட்டப்படும் தகவலை மட்டும் அடிப்படையாகக்
                    கொண்டு பயண முடிவுகளை எடுக்க வேண்டாம்.
                  </p>
                </section>

                {/* Divider */}
                <div
                  className={`h-px w-full ${
                    isDark ? "bg-gray-800" : "bg-[#EAE9F1]"
                  }`}
                />

                {/* Section 4 */}
                <section>
                  <h2
                    className={`disclaimer-title-font mb-3 text-xl sm:text-2xl ${
                      isDark ? "text-white" : "text-[#17162A]"
                    }`}
                  >
                    4. பயனர் வழங்கும் தகவல்கள்
                  </h2>

                  <p
                    className={`disclaimer-body-font text-base leading-8 ${
                      isDark ? "text-gray-300" : "text-[#5B5A6E]"
                    }`}
                  >
                    DPI One-க்கு பயனர்கள் வழங்கும் பேருந்து தொடர்பான
                    தகவல்கள் சரிபார்ப்பு அல்லது மதிப்பாய்வு செயல்முறைக்கு
                    உட்படுத்தப்படலாம்.
                  </p>

                  <p
                    className={`disclaimer-body-font mt-3 text-base leading-8 ${
                      isDark ? "text-gray-300" : "text-[#5B5A6E]"
                    }`}
                  >
                    பயனர்கள் தங்களுக்குத் தெரிந்தவரை துல்லியமான மற்றும்
                    உண்மையான தகவல்களை மட்டுமே வழங்க வேண்டும்.
                  </p>

                  <p
                    className={`disclaimer-body-font mt-3 text-base leading-8 ${
                      isDark ? "text-gray-300" : "text-[#5B5A6E]"
                    }`}
                  >
                    தவறான, போலியான அல்லது உறுதி செய்யப்படாத தகவல்களை
                    வழங்குவதைத் தவிர்க்க வேண்டும்.
                  </p>
                </section>

                {/* Divider */}
                <div
                  className={`h-px w-full ${
                    isDark ? "bg-gray-800" : "bg-[#EAE9F1]"
                  }`}
                />

                {/* Section 5 */}
                <section>
                  <h2
                    className={`disclaimer-title-font mb-3 text-xl sm:text-2xl ${
                      isDark ? "text-white" : "text-[#17162A]"
                    }`}
                  >
                    5. தகவல் பயன்பாடு
                  </h2>

                  <p
                    className={`disclaimer-body-font text-base leading-8 ${
                      isDark ? "text-gray-300" : "text-[#5B5A6E]"
                    }`}
                  >
                    DPI One-ல் உள்ள தகவல்கள் பயணிகளுக்கு ஒரு தகவல்
                    ஆதாரமாக மட்டுமே வழங்கப்படுகின்றன.
                  </p>

                  <p
                    className={`disclaimer-body-font mt-3 text-base leading-8 ${
                      isDark ? "text-gray-300" : "text-[#5B5A6E]"
                    }`}
                  >
                    தகவலைப் பயன்படுத்துவதால் ஏற்படும் பயண தாமதம்,
                    தவறான வழித்தடத் தேர்வு அல்லது பிற நேரடி அல்லது
                    மறைமுக பாதிப்புகளுக்கு DPI One பொறுப்பேற்காது.
                  </p>
                </section>

                {/* Divider */}
                <div
                  className={`h-px w-full ${
                    isDark ? "bg-gray-800" : "bg-[#EAE9F1]"
                  }`}
                />

                {/* Section 6 */}
                <section>
                  <h2
                    className={`disclaimer-title-font mb-3 text-xl sm:text-2xl ${
                      isDark ? "text-white" : "text-[#17162A]"
                    }`}
                  >
                    6. மூன்றாம் தரப்பு தகவல்கள்
                  </h2>

                  <p
                    className={`disclaimer-body-font text-base leading-8 ${
                      isDark ? "text-gray-300" : "text-[#5B5A6E]"
                    }`}
                  >
                    DPI One-ல் பயனர்கள் அல்லது பிற ஆதாரங்களால்
                    வழங்கப்படும் தகவல்கள் இருந்தால், அவற்றின் துல்லியம்
                    மற்றும் முழுமைக்கு DPI One முழுமையான உத்தரவாதம்
                    அளிக்காது.
                  </p>

                  <p
                    className={`disclaimer-body-font mt-3 text-base leading-8 ${
                      isDark ? "text-gray-300" : "text-[#5B5A6E]"
                    }`}
                  >
                    அத்தகைய தகவல்கள் தொடர்பாக ஏதேனும் சந்தேகம் இருந்தால்,
                    சம்பந்தப்பட்ட அதிகாரப்பூர்வ ஆதாரத்துடன்
                    சரிபார்ப்பது நல்லது.
                  </p>
                </section>

                {/* Divider */}
                <div
                  className={`h-px w-full ${
                    isDark ? "bg-gray-800" : "bg-[#EAE9F1]"
                  }`}
                />

                {/* Section 7 */}
                <section>
                  <h2
                    className={`disclaimer-title-font mb-3 text-xl sm:text-2xl ${
                      isDark ? "text-white" : "text-[#17162A]"
                    }`}
                  >
                    7. சேவை கிடைக்கும் தன்மை
                  </h2>

                  <p
                    className={`disclaimer-body-font text-base leading-8 ${
                      isDark ? "text-gray-300" : "text-[#5B5A6E]"
                    }`}
                  >
                    DPI One இணையதளம் அல்லது அதன் சில அம்சங்கள் எப்போதும்
                    தடையின்றி கிடைக்கும் என்று உறுதி செய்ய முடியாது.
                  </p>

                  <p
                    className={`disclaimer-body-font mt-3 text-base leading-8 ${
                      isDark ? "text-gray-300" : "text-[#5B5A6E]"
                    }`}
                  >
                    தொழில்நுட்ப கோளாறுகள், பராமரிப்பு, இணைய இணைப்பு
                    அல்லது பிற காரணங்களால் சேவையில் தற்காலிக
                    இடையூறுகள் ஏற்படலாம்.
                  </p>
                </section>

                {/* Divider */}
                <div
                  className={`h-px w-full ${
                    isDark ? "bg-gray-800" : "bg-[#EAE9F1]"
                  }`}
                />

                {/* Section 8 */}
                <section>
                  <h2
                    className={`disclaimer-title-font mb-3 text-xl sm:text-2xl ${
                      isDark ? "text-white" : "text-[#17162A]"
                    }`}
                  >
                    8. Disclaimer-இல் மாற்றங்கள்
                  </h2>

                  <p
                    className={`disclaimer-body-font text-base leading-8 ${
                      isDark ? "text-gray-300" : "text-[#5B5A6E]"
                    }`}
                  >
                    தேவைக்கேற்ப இந்த Disclaimer-ன் உள்ளடக்கம்
                    மாற்றப்படலாம் அல்லது புதுப்பிக்கப்படலாம்.
                  </p>

                  <p
                    className={`disclaimer-body-font mt-3 text-base leading-8 ${
                      isDark ? "text-gray-300" : "text-[#5B5A6E]"
                    }`}
                  >
                    புதிய மாற்றங்கள் வெளியிடப்பட்ட பிறகு DPI One-ஐ
                    தொடர்ந்து பயன்படுத்துவது, புதுப்பிக்கப்பட்ட
                    Disclaimer-ஐ ஏற்றுக்கொண்டதாகக் கருதப்படலாம்.
                  </p>
                </section>

              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="py-8 text-center">
            <p
              className={`disclaimer-body-font text-sm ${
                isDark ? "text-gray-500" : "text-[#9997A8]"
              }`}
            >
              © {new Date().getFullYear()} DPI One
            </p>
          </div>

        </div>
      </div>
    </>
  );
};

export default Disclaimer;