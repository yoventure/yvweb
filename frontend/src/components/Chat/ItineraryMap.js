import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import './ItineraryMap.css';
import { useUser } from '../../UserContext'; // 引入 useUser
import { initializeTravelTimeModal, openModal } from './travel-time'
import config from '../../config'; // 引入 config.js
import { useItineraryInteractiveState } from '../../ItineraryInteractiveContext'; // 引入 useUser

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

function ItineraryMap ({ session_id }) {
    const [mapCenter, setMapCenter] = useState(center);
    const [selectedPoi, setSelectedPoi] = useState(null);
    const [impressionCards, setImpressionCards] = useState([]); // State to manage impression cards
    const [highlightedCard, setHighlightedCard] = useState(null); // Add this state to track the highlighted card
    const [directions, setDirections] = useState([]);
    const [showTravelModeSelector, setShowTravelModeSelector] = useState(false); // 控制旅行模式选择器显示
    const [travelMode, setTravelMode] = useState('DRIVING'); // 默认驾车模式
    const [pois, setPois] = useState([]); 
    const [poiList, setPoiList] = useState([]);
    const mapRef = useRef(null); // 引用 map 实例
    const { user } = useUser(); // 获取用户信息
    const userId = user?.userId; // 获取 userId
    const [itineraryPOIs, setItineraryPOIs] = useState([]); 
    const { activeTab, activeSubTab, showUpICs, selectedDay, setActiveSubTab, showUpItineraryICs} = useItineraryInteractiveState(); // 获取 setUser 函数
    


    const handleTravelModeChange = (event) => {
        const newTravelMode = event.target.value;
        console.log('Selected travelMode:', newTravelMode);
        setTravelMode(newTravelMode);
    };

    // 处理 Marker 点击事件的函数
    const handleMarkerClick = (poiName, poiData) => {
        setSelectedPoi({ name: poiName, lat: poiData.lat, lng: poiData.lng });
        const selectedCard = impressionCards.find(card => card.PoI === poiName);
        setHighlightedCard(selectedCard); // 设置要高亮的卡片
    };

    useEffect(() => {
        if (showUpICs.length > 0) {
            console.log('为啥啊', showUpICs)
            updatePOiICs(showUpICs);
        }
    }, [selectedDay, showUpICs]);

    useEffect(() => {
        if (showUpItineraryICs.length > 0){
            console.log('itinerraryICshowup我看看', showUpItineraryICs)
            updateItineraryICs(showUpItineraryICs);
        }
    }, [showUpItineraryICs])
    

    const updatePOiICs = (showUpICs) => {
        if (showUpICs.length > 0 ) {
            console.log('来看看',showUpICs)
            // 将 showUpICs 转换为目标格式
            const poiData = showUpICs.reduce((acc, poi) => {
                acc[poi.PoI] = poi._id;
                return acc;
            }, {});

            const poiList = { data: [poiData] };

            console.log('转换后的 POI List:', poiList);
            setPoiList(poiList); // 更新状态
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
                        if (!pois.includes(poiObject)) { // 避免重复添加
                            pois.push(poiObject);
                        }
                    });
                });
                setPois(pois);
                console.log('coordinates', pois)
                })
                .catch(error => console.error('Error fetching POIs:', error));
        }
    }

    const updateItineraryICs = (showUpItineraryICs) => {
        if (showUpItineraryICs.length > 0 ) {
            console.log('来看看',showUpItineraryICs)
            // 将 showUpICs 转换为目标格式
            const poiData = showUpItineraryICs.reduce((acc, poi) => {
                acc[poi.PoI] = poi._id;
                return acc;
            }, {});

            const poiList = { data: [poiData] };

            console.log('转换后的 POI List:', poiList);
            setPoiList(poiList); // 更新状态
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
                        if (!pois.includes(poiObject)) { // 避免重复添加
                            pois.push(poiObject);
                        }
                    });
                });
                setItineraryPOIs(pois);
                console.log('coordinates', itineraryPOIs)
                })
                .catch(error => console.error('Error fetching POIs:', error));
        }
    }

    // 当 pois 数据更新时，自动调整地图边界
    useEffect(() => {
        console.log('center', pois)
        if (pois.length > 0 && mapRef.current) {
            const bounds = new window.google.maps.LatLngBounds();
            pois.forEach((poi) => {
                Object.entries(poi).forEach(([poiName, poiData]) => {
                console.log('point', poiData)
                const lat = parseFloat(poiData.lat);
                const lng = parseFloat(poiData.lng);
                
                // 检查 lat 和 lng 是否有效
                if (!isNaN(lat) && !isNaN(lng)) {
                    const position = { lat, lng };
                    bounds.extend(position);
                } else {
                    console.error('Invalid lat/lng for POI:', poiData);
                }
            });
            mapRef.current.fitBounds(bounds); // 自动缩放到所有标记的边界
            });
        }
    }, [pois]);

    // 当 pois 数据更新时，自动调整地图边界
    useEffect(() => {
        console.log('center', itineraryPOIs)
        if (itineraryPOIs.length > 0 && mapRef.current) {
            const bounds = new window.google.maps.LatLngBounds();
            itineraryPOIs.forEach((poi) => {
                Object.entries(poi).forEach(([poiName, poiData]) => {
                console.log('point', poiData)
                const lat = parseFloat(poiData.lat);
                const lng = parseFloat(poiData.lng);
                
                // 检查 lat 和 lng 是否有效
                if (!isNaN(lat) && !isNaN(lng)) {
                    const position = { lat, lng };
                    bounds.extend(position);
                } else {
                    console.error('Invalid lat/lng for POI:', poiData);
                }
            });
            mapRef.current.fitBounds(bounds); // 自动缩放到所有标记的边界
            });
        }
    }, [pois]);
    

    const renderPOIsGoogleMap = () => {
        console.log('转换成了poimap了',pois)
        return (
            <LoadScript googleMapsApiKey={googleMapsApiKey}>
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    onLoad={(map) => (mapRef.current = map)}  // 获取地图引用
                    center={mapCenter}
                    zoom={10}
                >
                    {pois.length > 0 && Object.entries(pois[0]).map(([poiName, poiData], index) => {
                        console.log("Rendering POI:", poiName, poiData); // 检查数据结构

                        return (
                            <Marker 
                                key={index} 
                                position={{ lat: poiData.lat, lng: poiData.lng }} 
                                onClick={() => handleMarkerClick(poiName, poiData)}
                            />
                        );
                })}
                    {selectedPoi && highlightedCard && (
                        <InfoWindow
                            position={{ lat: selectedPoi.lat, lng: selectedPoi.lng }}
                            onCloseClick={() => {
                                setSelectedPoi(null);
                            }}
                        >
                        </InfoWindow>
                    )}
                    {directions.length > 0 && (
                        <Polyline
                        path={directions}
                        geodesic={true}
                            options={{
                            strokeColor: '#FF0000',
                            strokeOpacity: 1.0,
                            strokeWeight: 2,}}
                    />
                    )}
                </GoogleMap>
            </LoadScript>
        );
    };
    const renderItineraryGoogleMap = () => {
        console.log('转换成了Itinerarymap了',itineraryPOIs)
        return (
            <LoadScript googleMapsApiKey={googleMapsApiKey}>
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    onLoad={(map) => (mapRef.current = map)}  // 获取地图引用
                    center={mapCenter}
                    zoom={10}
                >
                    {itineraryPOIs.length > 0 && Object.entries(itineraryPOIs[0]).map(([poiName, poiData], index) => {
                        console.log("Rendering POI:", poiName, poiData); // 检查数据结构
    
                        return (
                            <Marker 
                                key={index} 
                                position={{ lat: poiData.lat, lng: poiData.lng }} 
                                onClick={() => handleMarkerClick(poiName, poiData)}
                            />
                        );
                })}
                    {selectedPoi && highlightedCard && (
                        <InfoWindow
                            position={{ lat: selectedPoi.lat, lng: selectedPoi.lng }}
                            onCloseClick={() => {
                                setSelectedPoi(null);
                            }}
                        >
                        </InfoWindow>
                    )}
                    {directions.length > 0 && (
                        <Polyline
                        path={directions}
                        geodesic={true}
                            options={{
                            strokeColor: '#FF0000',
                            strokeOpacity: 1.0,
                            strokeWeight: 2,}}
                    />
                    )}
                </GoogleMap>
            </LoadScript>
        );
    };


return (
    <div className="chat-itinerary">
        <div className="itinerary-tabs">
            <div className="travel-mode-selector">
                <select id='select-mode' onChange={handleTravelModeChange} value={travelMode}>
                    <option value="DRIVING">Driving</option>
                    <option value="WALKING">Walking</option>
                    <option value="BICYCLING">Bicycling</option>
                    <option value="TRANSIT">Transit</option>
                </select>
            </div>
            <div id="travel-time-modal"></div>
            <div id="modal-overlay" class="modal-overlay hidden"></div>
        </div>

        <div className="itinerary-content-map">
            {activeTab === 'poisDiscussion' && (
                <div>
                    {/* {showTravelModeSelector  && (
                        <div className="travel-mode-selector">
                            <select onChange={handleTravelModeChange} value={travelMode}>
                                <option value="DRIVING">Driving</option>
                                <option value="WALKING">Walking</option>
                                <option value="BICYCLING">Bicycling</option>
                                <option value="TRANSIT">Transit</option>
                            </select>
                        </div>
                    )} */}
                    {
                        <div className="mapview-container">
                        <div className="google-map">
                          {renderPOIsGoogleMap()}
                        </div>
                      </div>
                    }
                </div>
            )}
            {activeTab === 'itineraryDiscussion' && (
                <div>
                    {
                        <div className="mapview-container">
                        <div className="google-map">
                          {renderItineraryGoogleMap()}
                        </div>
                      </div>
                    }
                </div>
            )}
        </div>
    </div>
);
            }

export default ItineraryMap;
