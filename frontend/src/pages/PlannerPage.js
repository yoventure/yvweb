import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PlannerPage.css';
import PlannerCalendar from '../components/Planner/PlannerCalendar';
import PlannerDetails from '../components/Planner/PlannerDetails'; // Assuming your PlannerDetails component is in a separate file

function PlannerPage() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [filters, setFilters] = useState({ date: '', month: '', country: '', city: '', archived: false });
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get('/api/session-plan/chiad@gmail.com');
        const fetchedPlans = response.data.travelPlans.map((plan, index) => ({
          id: index + 1,
          year: new Date(plan.dateRange.split(' to ')[0]).getFullYear(),
          month: new Date(plan.dateRange.split(' to ')[0]).toLocaleString('default', { month: 'long' }),
          dates: plan.dates.map(date => ({
            date: new Date(date.date).getDate(),
            place: `${date.place.city}, ${date.place.country}`
          })),
          image: plan.pic_icon,
          description: plan.travelDescription,
          topics: [plan.travelTopic],
          details: `Full details of ${plan.travelTopic}`,
          pois: plan.dates.flatMap(date => (
            date.times.flatMap(time => (
              time.POIs.map(poi => ({
                id: poi.name,
                date: new Date(date.date).getDate(),
                image: time.POIs[0]?.activities[0]?.activityPhotos[0] || plan.pic_icon,
                name: poi.name || 'N/A',
                description: time.POIs[0]?.activities[0]?.activityDescription || 'No description available',
                activities: poi.activities.map(activity => ({
                  activityName: activity.activityName,
                  activityDescription: activity.activityDescription,
                  activityPhotos: activity.activityPhotos,
                  activityRecommendations: activity.activityRecommendations
                })) || []
              }))
            ))
          ))
        }));
        const allTopics = fetchedPlans.reduce((acc, plan) => {
          plan.topics.forEach(topic => {
            if (!acc.includes(topic)) acc.push(topic);
          });
          return acc;
        }, []);
        setPlans(fetchedPlans);
        setTopics(allTopics);
      } catch (error) {
        console.error('Error fetching plans:', error);
      }
    };

    fetchPlans();
  }, []);

  const handleViewDetails = (plan) => {
    setSelectedPlan(plan);
  };

  const handleBack = () => {
    setSelectedPlan(null);
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const filteredPlans = plans.filter((plan) => {
    const matchesDate = filters.year ? plan.year === parseInt(filters.year, 10) : true;
    const matchesMonth = filters.month ? plan.month === filters.month : true;
    const matchesCountry = filters.country ? plan.country === filters.country : true;
    const matchesCity = filters.city ? plan.city.includes(filters.city) : true;
    const matchesArchived = filters.archived ? plan.archived === filters.archived : true;

    return matchesDate && matchesMonth && matchesCountry && matchesCity && matchesArchived;
  });

  return (
    <div className="planner-container">
      {selectedPlan ? (
        <PlannerDetails plan={selectedPlan} onBack={handleBack} />
      ) : (
        <>
          {/* Filter section */}
          <div className="planner-filters">
            {/* Date and Month filters */}
            <div className="filter-section">
            <h3 className="filter-heading">Time</h3>
              <label className="filter-label">
                Year:
                <input className="filter-input" type="text" name="year" pattern="\d{4}" placeholder="YYYY"  onChange={handleFilterChange} />
              </label>
              <label className="filter-label">
                Month:
                <select className="filter-select" name="month" onChange={handleFilterChange}>
                  <option value="">Select Month</option>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </label>
            </div>
            {/* Country and City filters */}
            <div className="filter-section">
            <h3 className="filter-heading">Places</h3>
              <label className="filter-label">
                Country:
                <select className="filter-select" name="country" onChange={handleFilterChange}>
                  <option value="">Select Country</option>
                  <option value="Japan">Japan</option>
                  <option value="China">China</option>
                  {/* Add more countries */}
                </select>
              </label>
              <label className="filter-label">
                City:
                <input className="filter-input" type="text" name="city" onChange={handleFilterChange} />
              </label>
            </div>
            {/* Archived filter */}
            <div className="filter-section">
            <h3 className="filter-heading">Topics</h3>
              <label className="filter-label">
                Archived:
                <input type="checkbox" name="archived" onChange={handleFilterChange} />
              </label>
              <label className="filter-label">
                Select Topic:
                <select className="filter-select" name="topic" onChange={handleFilterChange}>
                  <option value="">Select Topic</option>
                  {topics.map(topic => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          {/* Display filtered plans */}
          <div className="planner-results">
            {filteredPlans.map((plan) => (
              <div key={plan.id} className="plan-item">
                <img src={plan.image} alt="Plan" />
                <div className="plan-details">
                  <p>Topics: {plan.topics.join(', ')}</p>
                  <p>{plan.description}</p>
                  <button onClick={() => handleViewDetails(plan)}>View More Details</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default PlannerPage;

