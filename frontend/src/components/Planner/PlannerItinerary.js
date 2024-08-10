import React, { useState } from 'react';
import './PlannerItinerary.css';

function PlannerItinerary({ pois }) {
  return (
    <div className="itinerary-container">
      {pois.map((poi, index) => (
        <POIContainer key={poi.id} poi={poi} index={index} total={pois.length}/>
      ))}
      {pois.length > 1 && <ConnectorLines pois={pois} />}
    </div>
  );
}

// function Arrow({ direction }) {
//   return (
//     <div className={`arrow ${direction}`}>
//       <div className="arrow-horizontal"></div>
//       <div className="arrow-vertical"></div>
//       <div className="arrow-tip"></div>
//     </div>
//   );
// }

function POIContainer({ poi , index, total}) {
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);

  const handleNextActivity = () => {
    setCurrentActivityIndex((prevIndex) => (prevIndex + 1) % poi.activities.length);
  };

  const handlePrevActivity = () => {
    setCurrentActivityIndex((prevIndex) => (prevIndex - 1 + poi.activities.length) % poi.activities.length);
  };

  const currentActivity = poi.activities[currentActivityIndex];

  // const positionStyles = {
  //   position: 'absolute',
  //   top: `${index * 300}px`, // Adjust as needed for spacing
  //   left: `${index % 2 === 0 ? 0 : 500}px`, // Adjust for alternating left and right positions
  // };


  return (
    <div className={`poi-container ${index % 2 === 1 ? 'left' : 'right'}`}>
      <h4>{poi.name}</h4>
      {currentActivity && (
        <div className="activity-details">
          {currentActivity.activityPhotos && currentActivity.activityPhotos.length > 0 && (
            <img src={currentActivity.activityPhotos[0]} alt={currentActivity.activityDescription} />
          )}
          <p>{currentActivity.activityDescription}</p>
          <p>Recommendations: {currentActivity.activityRecommendations}</p>
          <button onClick={handlePrevActivity} className="nav-button">Previous Activity</button>
          <button onClick={handleNextActivity} className="nav-button">Next Activity</button>
        </div>
      )}
    </div>
  );
}

function ConnectorLines({ pois }) {
  return (
    <>
      {pois.map((poi, index) => {
        if (index < pois.length - 1) {
          const isLeftPair = index % 2 === 0;
          const nextIsLeftPair = (index + 1) % 2 === 0;
          const currentTop = index * 300 + 150; // Adjust as needed for vertical line positioning
          const nextTop = (index + 1) * 300 + 150; // Adjust as needed for vertical line positioning
          const currentLeft = isLeftPair ? 500 : 0; // Adjust as needed for horizontal line positioning
          const nextLeft = nextIsLeftPair ? 500 : 0; // Adjust as needed for horizontal line positioning

          return (
            <div key={index} className="connector-line-container">
              {/* Horizontal Line */}
              <div
                className={`connector-line-horizontal ${isLeftPair ? 'left' : 'right'}`}
                style={{ top: `${currentTop}px`, left: `${currentLeft}px` }}
              ></div>
              {/* Vertical Line */}
              <div
                className={`connector-line-vertical ${isLeftPair ? 'left' : 'right'}`}
                style={{ top: `${currentTop}px`, left: `${nextLeft}px` }}
              ></div>
              {/* Arrow */}
              <div
                className={`connector-arrow ${nextIsLeftPair ? 'left' : 'right'}`}
                style={{ top: `${nextTop}px`, left: `${nextLeft}px` }}
              ></div>
            </div>
          );
        } else {
          return null;
        }
      })}
    </>
  );
}

export default PlannerItinerary;

