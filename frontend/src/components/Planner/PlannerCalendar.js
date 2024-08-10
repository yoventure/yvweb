import React from 'react';
import './PlannerCalendar.css';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function PlannerCalendar({ year, month, plans, selectedDate, onDateClick }) {
  const getDaysInMonth = (year, monthIndex) => {
    return new Date(year, monthIndex + 1, 0).getDate();
  };

  const getStartDayOfMonth = (year, monthIndex) => {
    return new Date(year, monthIndex, 1).getDay();
  };

  const monthIndex = months.indexOf(month);
  const daysInMonth = getDaysInMonth(year, monthIndex);
  const startDayOfMonth = getStartDayOfMonth(year, monthIndex);

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const calendarDates = [];
  let dayCounter = 1;

  for (let i = 0; i < 6; i++) {
    const week = [];
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < startDayOfMonth) {
        week.push(<div key={`empty-${j}`} className="calendar-date empty"></div>);
      } else if (dayCounter <= daysInMonth) {
        // const date = new Date(year, monthIndex, dayCounter);
        const hasPlan = plans && plans.some(plan => plan.dates.includes(dayCounter)); // Ensure plans is defined

        week.push(
          <div
            key={dayCounter}
            className={`calendar-date ${selectedDate === dayCounter ? 'selected' : ''} ${hasPlan ? 'has-plan' : ''}`}
            onClick={() => onDateClick(dayCounter)}
          >
            {dayCounter}
          </div>
        );
        dayCounter++;
      } else {
        week.push(<div key={`empty-${i * 7 + j}`} className="calendar-date empty"></div>);
      }
    }
    calendarDates.push(<div key={i} className="calendar-week">{week}</div>);
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2>{month} {year}</h2>
      </div>
      <div className="calendar">
        <div className="calendar-days">
          {daysOfWeek.map(day => (
            <div key={day} className="calendar-day">
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-dates">
          {calendarDates}
        </div>
      </div>
    </div>
  );
}

export default PlannerCalendar;
