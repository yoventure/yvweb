import React, { createContext, useContext, useState } from 'react';

const ItineraryInteractiveStateContext = createContext();

export const useItineraryInteractiveState = () => useContext(ItineraryInteractiveStateContext);

export const ItineraryInteractiveStateProvider = ({ children }) => {
    const [activeTab, setActiveTab] = useState('poisDiscussion');
    const [activeSubTab, setActiveSubTab] = useState('poiList');
    const [showUpICs, setShowUpICs] = useState([]);
    const [showUpItineraryICs, setShowUpItineraryICs] = useState([])
    const [selectedDay, setSelectedDay] = useState(''); // Track selected day for filtering

    return (
        <ItineraryInteractiveStateContext.Provider value={{
            activeTab, setActiveTab,
            activeSubTab, setActiveSubTab,
            showUpICs, setShowUpICs, 
            selectedDay, setSelectedDay,
            showUpItineraryICs, setShowUpItineraryICs
        }}>
            {children}
        </ItineraryInteractiveStateContext.Provider>
    );
};
