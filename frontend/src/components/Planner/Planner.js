import React, { useState, useEffect } from 'react';
import PlannerCalendar from './Planner/PlannerCalendar';
import PlannerItinerary from './Planner/PlannerItinerary';
import './Planner.css';

function Planner() {
  const [itineraries, setItineraries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [itinerary, setItinerary] = useState('');

  useEffect(() => {
    // Fetch itineraries from API
    fetch('/api/planners')
      .then(response => response.json())
      .then(data => setItineraries(data));
  }, []);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const itineraryForDate = itineraries.find(it => new Date(it.date).toLocaleDateString() === new Date(date).toLocaleDateString());
    setItinerary(itineraryForDate ? itineraryForDate.itinerary : '');
  };

  return (
    <div className="planner-container">
      <PlannerCalendar itineraries={itineraries} handleDateClick={handleDateClick} />
      <PlannerItinerary selectedDate={selectedDate} itinerary={itinerary} />
    </div>
  );
}

export default Planner;
