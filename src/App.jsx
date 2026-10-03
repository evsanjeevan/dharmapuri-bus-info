import { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";

import Navbar from "./Navbar.jsx";
import BottomNav from "./BottomNav.jsx";

import HomePage from "./HomePage.jsx";
import ExplorePage from "./ExplorePage.jsx";
import UploadPage from "./UploadPage.jsx";
import AccountPage from "./Accountpage.jsx";

import Disclaimer from "./Disclaimer.jsx";
import PrivacyPolicy from "./PrivacyPolicy.jsx";
import AboutPage from "./AboutPage.jsx";


function AppShell() {
  const [isDark, setIsDark] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();


  // --------------------------------------------------
  // Bottom Navigation Active Tab
  // --------------------------------------------------
  const getActiveTab = () => {
    if (location.pathname.startsWith("/explore")) {
      return "explore";
    }

    if (location.pathname.startsWith("/upload")) {
      return "upload";
    }

    if (
      location.pathname.startsWith("/account") ||
      location.pathname.startsWith("/disclaimer") ||
      location.pathname.startsWith("/privacy-policy") ||
      location.pathname.startsWith("/about")
    ) {
      return "account";
    }

    return "home";
  };


  const activeTab = getActiveTab();


  // --------------------------------------------------
  // Bottom Navigation Change
  // --------------------------------------------------
  const handleTabChange = (tab) => {
    const routes = {
      home: "/",
      explore: "/explore",
      upload: "/upload",
      account: "/account",
    };

    const target = routes[tab];

    if (target) {
      navigate(target);
    }
  };


  return (
    <div
      className={`min-h-screen w-full transition-colors duration-200 ${
        isDark ? "bg-gray-950" : "bg-gray-100"
      }`}
    >
      <div
        className={`min-h-screen w-full flex flex-col shadow-2xl pb-24 relative overflow-hidden transition-all duration-300 ${
          isDark ? "bg-gray-900" : "bg-gray-50"
        }`}
      >

        {/* Navbar */}
        <Navbar isDark={isDark} />


        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Routes>

            {/* Home */}
            <Route
              path="/"
              element={
                <HomePage
                  isDark={isDark}
                />
              }
            />


            {/* Explore */}
            <Route
              path="/explore"
              element={
                <ExplorePage
                  isDark={isDark}
                />
              }
            />


            {/* Upload */}
            <Route
              path="/upload"
              element={
                <UploadPage
                  isDark={isDark}
                />
              }
            />


            {/* Account */}
            <Route
              path="/account"
              element={
                <AccountPage
                  isDark={isDark}
                  setIsDark={setIsDark}
                />
              }
            />


            {/* Disclaimer */}
            <Route
              path="/disclaimer"
              element={
                <Disclaimer
                  isDark={isDark}
                />
              }
            />


            {/* Privacy Policy */}
            <Route
              path="/privacy-policy"
              element={
                <PrivacyPolicy
                  isDark={isDark}
                />
              }
            />


            {/* About */}
            <Route
              path="/about"
              element={
                <AboutPage
                  isDark={isDark}
                />
              }
            />


            {/* Unknown Route → Home */}
            <Route
              path="*"
              element={
                <HomePage
                  isDark={isDark}
                />
              }
            />

          </Routes>
        </main>


        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          isDark={isDark}
        />

      </div>
    </div>
  );
}


// --------------------------------------------------
// App
// --------------------------------------------------
function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}


export default App;