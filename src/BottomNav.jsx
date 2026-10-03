import React from 'react';

const BottomNav = ({ activeTab, setActiveTab, isDark }) => {
    const tabs = [
        { id: 'home', label: 'Home', icon: 'bi-house-door', activeIcon: 'bi-house-door-fill' },
        { id: 'explore', label: 'Explore', icon: 'bi-compass', activeIcon: 'bi-compass-fill' },
        { id: 'upload', label: 'Upload', icon: 'bi-plus-circle', activeIcon: 'bi-plus-circle-fill' },
        { id: 'account', label: 'Account', icon: 'bi-person', activeIcon: 'bi-person-fill' }
    ];

    return (
        <nav 
            aria-label="Bottom Navigation"
            className={`fixed bottom-0 left-0 right-0 w-full shadow-[0_-4px_25px_rgba(0,0,0,0.1)] flex justify-around md:justify-center md:gap-16 px-2 py-2 z-50 pb-3 transition-all duration-300 backdrop-blur-md ${
                isDark 
                    ? 'bg-gray-900/90 border-t border-gray-800' 
                    : 'bg-white/90 border-t border-gray-100'
            }`}
        >
            {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                    <button 
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`flex flex-col items-center justify-center relative group px-5 py-1.5 rounded-2xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                            isActive ? (isDark ? 'bg-gray-800/80' : 'bg-brand/10') : 'hover:bg-gray-500/5'
                        }`}
                    >
                        <i className={`text-[19px] transition-all duration-300 ${
                            isActive 
                                ? 'text-brand scale-110 ' + tab.activeIcon 
                                : (isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-brand') + ' ' + tab.icon
                        }`}></i>
                        <span className={`text-[10px] mt-1 font-extrabold tracking-tight transition-all ${
                            isActive ? 'text-brand' : (isDark ? 'text-gray-400' : 'text-gray-500')
                        }`}>
                            {tab.label}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
};

export default BottomNav;