import React from "react";
import { useNavigate } from "react-router-dom";

import font206 from "./assets/10_உழவன் தமிழ்.ttf";

const PrivacyPolicy = ({ isDark = false }) => {
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

          .privacy-title-font {
            font-family: "DPI206", sans-serif;
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
                    className={`privacy-title-font text-3xl leading-tight sm:text-4xl ${
                      isDark ? "text-white" : "text-[#17162A]"
                    }`}
                  >
                    DPI One - Privacy Policy
                  </h1>

                  <p
                    className={` mt-2 text-sm ${
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
                  <h2 className={`privacy-title-font mb-3 text-xl sm:text-2xl ${isDark ? "text-white" : "text-[#17162A]"}`}>
                    1. பொதுத் தகவல் &amp; நோக்கம் (Overview)
                  </h2>
                  <p className={`text-base leading-8 ${isDark ? "text-gray-300" : "text-[#5B5A6E]"}`}>
                    DPI One செயலியானது பொதுப் பேருந்து வழித்தடங்கள், நேரங்கள் மற்றும் நிறுத்தங்கள் தொடர்பான தகவல்களைப் பயணிகளுக்கு எளிதாக வழங்குவதற்காக உருவாக்கப்பட்ட ஒரு பொது வழிகாட்டி தளமாகும். பயணிகளின் தனியுரிமையைப் பாதுகாப்பதில் நாங்கள் முழு அர்ப்பணிப்புடன் செயல்படுகிறோம்.
                  </p>
                </section>

                <div className={`h-px w-full ${isDark ? "bg-gray-800" : "bg-[#EAE9F1]"}`} />

                {/* Section 2 */}
                <section>
                  <h2 className={`privacy-title-font mb-3 text-xl sm:text-2xl ${isDark ? "text-white" : "text-[#17162A]"}`}>
                    2. தனிப்பட்ட தரவு சேகரிப்பு இன்மை (No Personal Data Collection)
                  </h2>
                  <p className={`text-base leading-8 ${isDark ? "text-gray-300" : "text-[#5B5A6E]"}`}>
                    DPI One பயனர்களிடமிருந்து எந்தவொரு தனிப்பட்ட அடையாளத் தகவல்களையும் (Personal Identifiable Information - PII) கோருவதோ, சேகரிப்பதோ அல்லது கண்காணிப்பதோ இல்லை.
                  </p>
                  <p className={`mt-3 text-base leading-8 ${isDark ? "text-gray-300" : "text-[#5B5A6E]"}`}>
                    பயனர்களின் பின்வரும் எந்தத் தரவுகளும் எங்கள் சேவையகங்களில் சேமிக்கப்படுவதில்லை:
                  </p>
                  <ul className={`mt-3 list-disc space-y-2 pl-6 text-base leading-8 ${isDark ? "text-gray-300" : "text-[#5B5A6E]"}`}>
                    <li>பெயர், மின்னஞ்சல் முகவரி அல்லது தொடர்பு எண்கள்</li>
                    <li>பயனர் கணக்கு விவரங்கள் (User Account / Profile Data)</li>
                    <li>பிற தனிப்பட்ட அடையாளத் தகவல்கள்</li>
                  </ul>
                </section>

                <div className={`h-px w-full ${isDark ? "bg-gray-800" : "bg-[#EAE9F1]"}`} />

                {/* Section 3 */}
                <section>
                  <h2 className={`privacy-title-font mb-3 text-xl sm:text-2xl ${isDark ? "text-white" : "text-[#17162A]"}`}>
                    3. சேமிக்கப்படும் தரவுகள் (Public Transit Data Only)
                  </h2>
                  <p className={`text-base leading-8 ${isDark ? "text-gray-300" : "text-[#5B5A6E]"}`}>
                    DPI One தளத்தில் இடம்பெற்றுள்ள அனைத்துத் தரவுகளும் பொதுப் போக்குவரத்து தொடர்பானவை மட்டுமே:
                  </p>
                  <ul className={`mt-3 list-disc space-y-2 pl-6 text-base leading-8 ${isDark ? "text-gray-300" : "text-[#5B5A6E]"}`}>
                    <li>பேருந்து வழித்தடங்கள் மற்றும் எண்கள் (Bus Routes &amp; Numbers)</li>
                    <li>தொடக்க இடம் மற்றும் சேருமிடம் (Origin &amp; Destination)</li>
                    <li>அட்டவணைப்படுத்தப்பட்ட பேருந்து நேரங்கள் (Schedules &amp; Timings)</li>
                    <li>பேருந்து நிறுத்தங்களின் விவரங்கள் (Bus Stops)</li>
                  </ul>
                  <p className={`mt-3 text-base leading-8 ${isDark ? "text-gray-300" : "text-[#5B5A6E]"}`}>
                    இந்தத் தகவல்கள் பொதுப் பயணிகள் தங்களின் பயணத்தைத் திட்டமிடுவதற்கு மட்டுமே பயன்படுத்தப்படுகின்றன.
                  </p>
                </section>

                <div className={`h-px w-full ${isDark ? "bg-gray-800" : "bg-[#EAE9F1]"}`} />

                {/* Section 4 */}
                <section>
                  <h2 className={`privacy-title-font mb-3 text-xl sm:text-2xl ${isDark ? "text-white" : "text-[#17162A]"}`}>
                    4. பயனர் சமர்ப்பிக்கும் தகவல்கள் (User Contributions)
                  </h2>
                  <p className={`text-base leading-8 ${isDark ? "text-gray-300" : "text-[#5B5A6E]"}`}>
                    பயனர்கள் ஏதேனும் புதிய பேருந்து தகவல்களையோ அல்லது வழித்தடத் திருத்தங்களையோ சமர்ப்பிக்கும் பட்சத்தில், பேருந்து சேவை சார்ந்த பொதுத் தகவல்கள் மட்டுமே கணக்கில் எடுத்துக்கொள்ளப்படும். தனிப்பட்ட தகவல்கள் ஏதேனும் தவறுதலாக இணைக்கப்பட்டிருந்தால் அவை உடனடியாக நிராகரிக்கப்படும்.
                  </p>
                </section>

                <div className={`h-px w-full ${isDark ? "bg-gray-800" : "bg-[#EAE9F1]"}`} />

                {/* Section 5 */}
                <section>
                  <h2 className={`privacy-title-font mb-3 text-xl sm:text-2xl ${isDark ? "text-white" : "text-[#17162A]"}`}>
                    5. தரவுப் பகிர்வு மற்றும் மூன்றாம் தரப்பு சேவைகள் (Data Sharing)
                  </h2>
                  <p className={`text-base leading-8 ${isDark ? "text-gray-300" : "text-[#5B5A6E]"}`}>
                    நாங்கள் பயனர்களின் எந்தவொரு தரவையும் வணிக ரீதியாக விற்பனை செய்வதோ, வாடகைக்கு விடுவதோ அல்லது விளம்பர நிறுவனங்களுக்குப் பகிர்வதோ இல்லை.
                  </p>
                </section>

                <div className={`h-px w-full ${isDark ? "bg-gray-800" : "bg-[#EAE9F1]"}`} />

                {/* Section 6 */}
                <section>
                  <h2 className={`privacy-title-font mb-3 text-xl sm:text-2xl ${isDark ? "text-white" : "text-[#17162A]"}`}>
                    6. மாற்றங்கள் (Policy Updates)
                  </h2>
                  <p className={`text-base leading-8 ${isDark ? "text-gray-300" : "text-[#5B5A6E]"}`}>
                    செயலியின் அம்சங்கள் அல்லது ஒழுங்குமுறை விதிகளுக்கு ஏற்ப இந்தத் தனியுரிமைக் கொள்கை அவ்வப்போது புதுப்பிக்கப்படலாம். மாற்றங்கள் அனைத்தும் இந்தப் பக்கத்தில் உடனுக்குடன் திருத்தப்பட்டு தேதி குறிப்பிடப்படும்.
                  </p>
                </section>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="py-8 text-center">
            <p
              className={`text-sm ${
                isDark ? "text-gray-500" : "text-[#9997A8]"
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

export default PrivacyPolicy;