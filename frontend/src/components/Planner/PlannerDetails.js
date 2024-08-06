import React, { useState } from 'react';
import PlannerCalendar from './PlannerCalendar';
import PlannerItinerary from './PlannerItinerary';
import './PlannerDetails.css';

function PlannerDetails({ plan, onBack }) {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const filteredPOIs = selectedDate
    ? plan.pois.filter((poi) => poi.date === selectedDate)
    : plan.pois;

  return (
    <div className="plan-details-container">
      <button onClick={onBack} className="back-button">Back</button>
      <h2>{plan.travelTopic}</h2>
      <p>{plan.travelDescription}</p>
      <div className="planner-content">
        <div className="planner-calendar">
          <PlannerCalendar
            year={plan.year}
            month={plan.month}
            dates={plan.dates}
            selectedDate={selectedDate}
            onDateClick={handleDateClick}
          />
        </div>
        <div className="planner-itinerary">
          <PlannerItinerary pois={filteredPOIs} />
        </div>
      </div>
    </div>
  );
}

export default PlannerDetails;
