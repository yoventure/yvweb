import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { GoogleMap, LoadScript, Marker, InfoWindow, DirectionsRenderer, Polyline } from '@react-google-maps/api';
import { useUser } from '../../UserContext'; // 引入 useUser
import config from '../../config'; // 引入 config.js
import { useItineraryInteractiveState } from '../../ItineraryInteractiveContext'; // 引入 useUser
import './ChatItinerary.css';
import { initializeTravelTimeModal, openModal } from './travel-time'

const Url = config.apiUrl;

const googleMapsApiKey = 'AIzaSyAAMUOtHqut_xj28ddMZ-ItuxfCNTgVj6g'; // Replace with your actual API key
const containerStyle = {
  width: '100%',
  height: '400px',
};

const center = {
  lat: 37.7749, // Default center of the map
  lng: -122.4194,
};

// function getFormattedDuration(duration) {
//     console.log('什么duration啊',duration)
//     const [startTime, endTime] = duration.split('-');
//     const start = new Date(`1970-01-01T${startTime}:00`);
//     const end = new Date(`1970-01-01T${endTime}:00`);
//     const diffMs = end - start;
//     const diffHours = diffMs / (1000 * 60 * 60);
  
//     if (diffHours < 1) {
//       return `around ${Math.round(diffHours * 60)} min`;
//     } else if (diffHours === 1) {
//       return 'around 1 hr';
//     } else {
//       return `around ${Math.round(diffHours)} hrs`;
//     }
//   }      

function ChatItinerary ({ session_id, impressions}) {
    const [sessions, setSessions] = useState([]);
    const [mode, setMode] = useState('traveler'); // traveler or supplier
    const [destinations, setDestinations] = useState([]);
    const [currentDestination, setCurrentDestination] = useState('');
    const [selectedDestination, setSelectedDestination] = useState('');
    const [currentSession, setCurrentSession] = useState(null);
    const [expandedCard, setExpandedCard] = useState(null); // Moved this state to the top level
    const [expandedReview, setExpandedReview] = useState(null);
    const [travelMode, setTravelMode] = useState('DRIVING'); // 默认驾车模式
    const [directions, setDirections] = useState([]);
    const [pois, setPois] = useState([]);
    const [showTravelModeSelector, setShowTravelModeSelector] = useState(false); // 控制旅行模式选择器显示
    const [poiList, setPoiList] = useState([]);
    const [mapCenter, setMapCenter] = useState(center);
    const [selectedPoi, setSelectedPoi] = useState(null);
    const { user } = useUser(); // 获取用户信息
    const userId = user?.userId; // 获取 userId
    const [impressionCards, setImpressionCards] = useState([]);
    const [daySelections, setDaySelections] = useState({}); // State to track Day selections for each card
    const directionsRendererRef = useRef(null); // 用于存储 DirectionsRenderer 实例
    const [isAdded, setIsAdded] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [highlightedCard, setHighlightedCard] = useState(null); // Add this state to track the highlighted card
    const [filteredImpressionCards, setFilteredImpressionCards] = useState([]);
    const [itineraryPoiDetails, setItineraryPoiDetails] = useState([]); 
    const [itineraryData, setItineraryData] = useState(null);
    const [isPublished, setIsPublished] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    

    const { activeTab, setActiveTab, activeSubTab, setActiveSubTab, showUpICs, setShowUpICs, selectedDay, setSelectedDay, showUpItineraryICs, setShowUpItineraryICs} = useItineraryInteractiveState(); // 获取 setUser 函数


    const handleModeChange = (selectedMode) => {
        setMode(selectedMode);
    };

    const handleAddDestination = () => {
        if (currentDestination) {
            setDestinations([...destinations, currentDestination]);
            setCurrentDestination(''); // Clear the input after adding
        }
    };

    const handleRemoveDestination = (destinationToRemove) => {
        setDestinations(destinations.filter(destination => destination !== destinationToRemove));
    };

    // Handle Day selection
    const handleDayChange = async (cardId, event) => {
        const selectedDay = event.target.value;

         // Update local state
        setDaySelections({
            ...daySelections,
            [cardId]: event.target.value,
        });
        };

    const handleToggleClick = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleOptionClick = (action) => {
        setIsAdded(action === 'Add');
        setIsDropdownOpen(false);
    };
    
    // Handle global Day selection change
    const handleDayFilterChange = (event) => {
        setSelectedDay(event.target.value);
    };

    // Handle specific Day selection change within Impression Cards
    const handleDaySelectionChange = (event) => {
        setSelectedDay(event.target.value); // 更新选择的天数
    };    

    useEffect(() => {
        // 当切换到 Map View 标签页时，获取 POI 数据
        if (activeTab === 'poisDiscussion' && activeSubTab === 'poiList') {
            const newUrl = `/yv-get-session-ic-by-city?user_id=${encodeURIComponent(userId)}&session_id=${encodeURIComponent(session_id)}`;
            console.log(newUrl)
            fetch(newUrl, {
                method: 'GET',
                headers: {
                'accept': 'application/json',
                },
            })
                .then(response => response.json())
                .then(data => {
                // Assuming the response contains POI data
                console.log('POI Data:', data.data);
                setPoiList(data); // Update state with POI data
                })
                .catch(error => {
                console.error('Error fetching POI data:', error);
                });
            console.log('poiiiii',poiList);
            fetch(`${Url}/google-map`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(poiList),
            })
            .then(response => response.json())
            .then(data => {
                const pois = [];
                data.data.forEach(cityData => {
                    cityData.pois.forEach(poiObject => {
                        pois.push(poiObject);
                    });
                });

                setPois(pois);
                console.log('coordinates', pois)
                if (pois.length > 0) {
                    const firstPoi = pois[0];
                    const firstPoiName = Object.keys(firstPoi)[0];
                    const firstPoiData = firstPoi[firstPoiName];
                    setMapCenter({ lat: firstPoiData.lat, lng: firstPoiData.lng });
                }
            })
            .catch(error => console.error('Error fetching POIs:', error));
        }
    }, [activeTab, activeSubTab]);

    useEffect(() => {
        console.log('开始了', poiList)
        if (Array.isArray(poiList.data) && poiList.data.length > 0) {
            // poiList.data 是数组且非空
            console.log('POI List is an array and has items');

            // Extract POI IDs
            const poiIds = poiList.data.flatMap(item => {
                if (item.PoI && typeof item.PoI === 'object') {
                    return Object.values(item.PoI);
                }
                return [];
            });

            console.log('POI IDs:', poiIds);
            
            // Fetch detailed POI information
            fetch(`${Url}/impression-cards`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: poiIds }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error fetching impression cards');
                }
                return response.json();
            })
            .then(data => {
                setImpressionCards(data); // Update state with detailed POI data
                console.log('new impressioncard', impressionCards)
            })
            .catch(error => console.error('Error fetching POI details:', error));
        }
    }, [poiList]);

    useEffect(() => {
        // 初始化模态框，当组件挂载时执行
        initializeTravelTimeModal();
      }, []);


    useEffect(() => {
        console.log('Current travelMode:', travelMode); // Debug output
        if (activeSubTab === 'mapView' && pois.length > 0) {
            const fetchDirections = async () => {
                try {
                    const directionsResponse = await fetch(`${Url}/googleroutes`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ pois, travelMode }),
                    });
                    const directionsData = await directionsResponse.json();
                    console.log('返回的是啥',directionsData)

                    setDirections(directionsData.route || []);
                    
                    console.log('新鲜出炉',directions )

                } catch (error) {
                    console.error('Error fetching directions:', error);
                }
            };

            fetchDirections();
        }
    }, [activeSubTab, travelMode, pois]);

    useEffect(() => {
        if (filteredImpressionCards.length > 0) {
            const renderImpressionCardsOnMap = async () => {
                try {
                    const response = await fetch(`${Url}/interactivewithmap`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            impressionCards: filteredImpressionCards,
                        }),
                    });

                    if (!response.ok) {
                        throw new Error('Failed to post impression cards');
                    }
                    

                    const data = await response.json();
                    console.log('Posted successfully:', data);
                } catch (error) {
                    console.error('Error posting impression cards:', error);
                }
            };
            renderImpressionCardsOnMap();
        }
    }, [filteredImpressionCards]);

    
    const handleThumbClick = (cardId, type) => {
        console.log(`Thumbs ${type} clicked for card ${cardId}`);
        // Handle thumbs up/down logic here
    };

    const handleExpandClick = (cardId) => {
        setExpandedCard(expandedCard === cardId ? null : cardId);
    };

    useEffect(() => {
        updateFilteredImpressionCards();
    }, [selectedDay, impressionCards, daySelections]);

    const updateFilteredImpressionCards = () => {
        const filteredCards = selectedDay === '' 
            ? impressionCards 
            : impressionCards.filter(card => daySelections[card._id] === selectedDay);
        
        setFilteredImpressionCards(filteredCards);
    };

    const renderImpressionCards = () => {
        if (!impressionCards || impressionCards.length === 0) {
            // setImpressionCards(impressions)
            return <p>No impression cards available</p>;
        }

        setShowUpICs(filteredImpressionCards)

        console.log('选择天数', filteredImpressionCards)
        console.log('改变天数', daySelections)

        return (
            <div className="impression-card-container">
                {filteredImpressionCards.length > 0 ? (
                  filteredImpressionCards.map((card) => (
                    <div key={card._id} className="impression-card-wrapper">
                            <div className="impression-card">
                                <div className="impression-card-content">
                                    <div className="impression-card-left">
                                        <h4>{card.PoI}</h4>
                                        <div className="impression-card-slider">
                                            {card.pic_urls.map((url, idx) => (
                                                <img key={idx} src={url} alt={card.PoI} />
                                            ))}
                                        </div>
                                        <h4>Overview</h4>
                                        <div>Duration: {card.duration}</div>
                                        <div>Operation Time: {card.op_time}</div>
                                        <div>Cost: {card.cost}</div>
                                        <a href={card.source_urls[0]} target="_blank" rel="noopener noreferrer">More Info</a>
                                        <div className="impression-card-scheduling">
                                        <select value={daySelections[card._id] || ''} onChange={(event) => handleDayChange(card._id, event)}>
                                            <option value="" disabled>Select a Day</option>
                                                {[...Array(7)].map((_, idx) => (
                                                    <option key={idx} value={`Day ${idx + 1}`}>{`Day ${idx + 1}`}</option>
                                                ))}
                                        </select>
                                        <div className="status-section">
                                            <div className="status">
                                                <svg width="16" height="16" >
                                                <path d="M13.485 4.515a.5.5 0 00-.707 0L7.5 9.793l-2.829-2.829a.5.5 0 00-.707.707l3 3a.5.5 0 00.707 0l6-6a.5.5 0 000-.707z"></path>
                                                </svg>
                                                <span>{isAdded ? 'Added' : 'Not Added'}</span>
                                            </div>
                                            <div className="dropdown">
                                            <button className="toggle-button" onClick={handleToggleClick}>
                                                {isAdded ? 'Remove' : 'Add'}
                                                <svg width="16" height="16" >
                                                    <path d="M8 1v14M1 8h14" stroke="#000" strokeWidth="2" strokeLinecap="round" />
                                                </svg>
                                            </button>
                                            {isDropdownOpen && (
                                                <div className="dropdown-menu">
                                                    <button onClick={() => handleOptionClick('Add')}>Add</button>
                                                    <button onClick={() => handleOptionClick('Remove')}>Remove</button>
                                                </div>
                                            )}
                                        </div>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                            </div>
                            <div className="impression-card-actions">
                                <button onClick={() => handleThumbClick(card._id, 'thumbup')}>👍</button>
                                <button onClick={() => handleThumbClick(card._id, 'thumbdown')}>👎</button>
                                <button onClick={() => handleExpandClick(card._id)}>
                                    {expandedCard === card._id ? '-' : '+'}
                                </button>
                            </div>
                        <div className="activity-card-content-container">
                        {expandedCard === card._id && (
                            <div className="activity-card-container">
                                {card.act.map((activity, index) => (
                                    <div key={index} className="activity-card-wrapper">
                                        <div className="activity-card">
                                        <div className="activity-card-content">
                                        <h4>{activity.act_name}</h4>
                                        <div className="activity-card-slider">
                                            {activity.act_pics.map((pic, picIdx) => (
                                                <img key={picIdx} src={pic} alt={activity.act_name} />
                                            ))}
                                        </div>
                                        <h5>positive reviews</h5>
                                        <p>
                                        {activity.act_review.postive_reviews.length > 0 ? (
                                        <ul>
                                                    {activity.act_review.postive_reviews.map((review, index) => (
                                                        <li key={index}>{review}</li>
                                                    ))}
                                                </ul>
                                            ) : 'No positive reviews'}
                                        </p>
                                        <h5>negative reviews</h5>
                                        <p>
                                        {activity.act_review.negative_reviews.length > 0 ? (
                                        <ul>
                                                    {activity.act_review.negative_reviews.map((review, index) => (
                                                        <li key={index}>{review}</li>
                                                    ))}
                                                </ul>
                                            ) : 'No negative reviews'}
                                            </p>
                                        </div>
                                        </div>
                                        <div className="activity-card-actions">
                                         <button onClick={() => handleThumbClick(card._id, 'thumbup')}>👍</button>
                                            <button onClick={() => handleThumbClick(card._id, 'thumbdown')}>👎</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                ))
                ):(
                    <p>No impression cards for selected day</p>)
                }
            </div>
        );
    };

    // Fetch itinerary data on component mount
    useEffect(() => {
        console.log('userid', userId)
        console.log('sessionid', session_id)
        const fetchItineraryData = async () => {
            try {
                const newUrl = `/yv-get-itinerary?user_id=${encodeURIComponent(userId)}&session_id=${session_id}`;
                const response = await fetch(newUrl, 
                    {method: 'GET',
                     headers: {
                     'accept': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setItineraryData(data);  // Set itinerary data to state
                    // After fetching the itinerary, fetch the detailed POI data
                    const poiIds = data.itinerary_ICs.map(([poiId]) => poiId);  // Extract the POI IDs
                    fetchItineraryPoiDetails(poiIds);  // Fetch detailed POI information
                    console.log('Itinerary的data长什么样呢', itineraryData)
                } else {
                    console.error('Failed to fetch itinerary data');
                }
            } catch (error) {
                console.error('Error fetching itinerary data:', error);
            }
        };

        // Fetch detailed POI information (Impression Cards)
        const fetchItineraryPoiDetails = async (poiIds) => {
            try {
                const response = await fetch(`${Url}/impression-cards`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ ids: poiIds }),  // Send POI IDs as a list in POST request
                });

                if (response.ok) {
                    const poiData = await response.json();
                    setItineraryPoiDetails(poiData);  // Save detailed POI data
                    setShowUpItineraryICs(poiData);
                    console.log('Itinerary的poi长什么样呢', itineraryPoiDetails)
                } else {
                    console.error('Failed to fetch POI details');
                }
            } catch (error) {
                console.error('Error fetching POI details:', error);
            }
        };

        fetchItineraryData();
    }, [session_id, userId]);  // Fetch data whenever session_id or user_id changes

    const onDragEnd = (result) => {
        const { source, destination } = result;
    
        // 如果没有拖到有效位置，直接返回
        if (!destination) return;
    
        const sourceDay = source.droppableId;  // 拖动起始的 day
        const destinationDay = destination.droppableId;  // 拖动目标的 day
    
        // 如果拖动源和目标相同，且位置未发生变化，直接返回
        if (sourceDay === destinationDay && source.index === destination.index) {
            return;
        }
    
        // 获取源天数的 POI 列表
        const sourceDayData = itineraryData.itinerary_ICs[sourceDay];  // 源天数完整数据
        const sourcePoiIds = sourceDayData.slice(0); // 忽略第一个元素（天数名称），提取 POI 列表
        console.log('忽略第一个元素（天数名称），提取 POI 列表', sourcePoiIds)
    
        // 获取目标天数的 POI 列表
        const destinationDayData = itineraryData.itinerary_ICs[destinationDay];  // 目标天数完整数据
        const destinationPoiIds = destinationDayData.slice(0); // 忽略第一个元素（天数名称），提取 POI 列表
    
        // 从源天数中移除被拖动的 POI
        const [removedPoi] = sourcePoiIds.splice(source.index, 1); // 获取被拖动的 POI
    
        // 将 POI 添加到目标天数，并更新天数信息
        const updatedPoi = [removedPoi, destinationDayData[1]];  // POI ID 和目标天数
        // 检查是否成功移除
        let updatedSourcePoiIds = sourcePoiIds.length > 1 ? sourcePoiIds.slice(0, -1) : [''];
        console.log('移除后的 sourcePoiIds:', updatedSourcePoiIds);
        console.log('被移除的 POI:', removedPoi);
    
        // 构造更新后的 `itinerary_ICs`
        const updatedItineraryICs = {
            ...itineraryData.itinerary_ICs,
            [sourceDay]: [ ...updatedSourcePoiIds,sourceDayData[1]], // 保留源天数的名称，并更新 POI 列表
            [destinationDay]: [ ...destinationPoiIds], // 保留目标天数的名称，并添加新 POI
            [destinationDay+1]: updatedPoi
        };

        console.log('更新后的 itinerary:', updatedItineraryICs);
    
        // 更新行程状态
        setItineraryData({
            ...itineraryData,
            itinerary_ICs: updatedItineraryICs
        });
    
        console.log('更新后的 itinerary:', itineraryData);
    };
    
    

    // Render the itinerary data with detailed POI information
    const renderItinerary = () => {
        console.log('itinerarydata',itineraryData)
        console.log('itineraryPoiDetails',itineraryPoiDetails)
        if (!itineraryData || !itineraryPoiDetails.length) {
            return <div>Loading itinerary and POI details...</div>;  // Loading state
        }

        return (
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="itinerary-plan-container">
                    {Object.keys(itineraryData.itinerary_ICs).map((day, dayIndex) => (
                        <Droppable key={dayIndex} droppableId={day}>
                            {(provided) => (
                                <div className="itinerary-day-container">
                                    <h3>{itineraryData.itinerary_ICs[day][1]}</h3>
                                    <div
                                        id="day-poi-itinerary-container"
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        {itineraryData.itinerary_ICs[day].map((poiId, index) => {
                                            const poiDetail = itineraryPoiDetails.find(poi => poi._id === poiId);
                                            return (
                                                <Draggable key={poiId} draggableId={poiId} index={index}>
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="poi-day-itinerary-item"
                                                        >
                                                            {poiDetail ? (
                                                                <>
                                                                    <img src={poiDetail.pic_urls[1]} alt={poiDetail.PoI} className="poi-itinerary-image" />
                                                                    <div className='poi-day-itinerary-details'>
                                                                        <p className='poi-day-item-name'>{poiDetail.PoI}</p>
                                                                        <p className='poi-day-item-ot'>Operating Time: {poiDetail.op_time}</p>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <p>Loading POI details...</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </Draggable>
                                            );
                                        })}
                                        {provided.placeholder}
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>
        );
    };


    const handleSave = async (toPublish) => {
        try {
          const response = await fetch('/yv-itinerary-save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: userId,  // 你可以动态传递user_id
              session_id: session_id,
              itinerary_topic: '',  // 假设impressions是行程的主题
              to_publish: toPublish,
            }),
          });
          
          const data = await response.json();
          if (response.ok) {
            console.log('Itinerary saved:', data);
            setIsPublished(true); // 显示成功提示
            setErrorMessage('');
          } else {
            console.error('Failed to save itinerary:', data);
            setErrorMessage(data.message || 'Failed to save itinerary');
            setIsPublished(false); // 隐藏成功提示
          }
        } catch (error) {
          console.error('Error saving itinerary:', error);
          setErrorMessage(error.message || 'Network error occurred');
          setIsPublished(false); // 隐藏成功提示
        }
      };

    const handleTravelModeChange = (event) => {
        const newTravelMode = event.target.value;
        console.log('Selected travelMode:', newTravelMode);
        setTravelMode(newTravelMode);
    };

    return (
        <div className="chat-itinerary">
            <div className="itinerary-tabs">
                <button 
                    id="poisDiscussion-button" 
                    className={activeTab === 'poisDiscussion' ? 'active-tab' : ''} 
                    onClick={() => setActiveTab('poisDiscussion')}
                    >
                    POIs Discussion
                </button>
                <button 
                    id="itineraryDiscussion-button" 
                    className={activeTab === 'itineraryDiscussion' ? 'active-tab' : ''} 
                    onClick={() => setActiveTab('itineraryDiscussion')}
                    >
                    Itinerary Discussion
                </button>
            </div>

            <div className="itinerary-content">
                {activeTab === 'poisDiscussion' && (
                    <div>
                        <div className="day-selector">
                            <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
                                <option value="">All Days</option>
                                {[...Array(7)].map((_, idx) => (
                                    <option key={idx} value={`Day ${idx + 1}`}>{`Day ${idx + 1}`}</option>
                                ))}
                            </select>
                        </div>
                        {renderImpressionCards()}
                    </div>
                )}
                {activeTab === 'itineraryDiscussion' && (
                    <div>
                        <div className="mode-toggle">
                            <button
                                className={`mode-btn ${mode === 'supplier' ? 'active' : ''}`}
                                onClick={() => handleModeChange('supplier')}
                            >
                                Supplier Mode
                            </button>
                            <button
                                className={`mode-btn ${mode === 'traveler' ? 'active' : ''}`}
                                onClick={() => handleModeChange('traveler')}
                            >
                                Traveler Mode
                            </button>
                        </div>
                        <div className='budget-container'>
                            <span className='travel-time'>
                                {/* 按钮用来打开模态框 */}
                                <button id="open-modal-btn" onClick={openModal}>
                                    When
                                </button>
                            </span>
                            <span className='travel-budget'>
                                {/* 按钮用来打开模态框 */}
                                <button id="budget" >
                                    Budget
                                </button>
                            </span>
                            <span className='travel-search'>
                                {/* 按钮用来打开模态框 */}
                                <button id="search" >
                                    Search
                                </button>
                            </span>
                            <span className='itinerary-save'>
                                <button id="save" onClick={() => handleSave(false)}>
                                    Save
                                </button>
                            </span>
                            <span className='itinerary-publish' onClick={() => handleSave(true)}>
                                <button id="publish" >
                                    Publish
                                </button>
                            </span>

                            {/* 弹窗提示 */}
                                {isPublished && (
                                    <div className="popup">
                                    <p>Itinerary has been saved successfully!</p>
                                    <button onClick={() => setIsPublished(false)}>Close</button>
                                    </div>
                                )}

                                {errorMessage && (
                                    <div className="error-popup">
                                    <p>Error: {errorMessage}</p>
                                    <button onClick={() => setErrorMessage('')}>Close</button>
                                    </div>
                                )}

                            <div id="travel-time-modal"></div>
                            <div id="modal-overlay" class="modal-overlay hidden"></div>
                        </div>
                        {renderItinerary()}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatItinerary;
