import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../UserContext'; // 引入 useUser
import './ProfilePage.css';
import config from '../config'; // 引入 config.js

const Url = config.apiUrl;


const calculateTimeSince = (startDate) => {
    const start = new Date(startDate); // 将字符串转换为 Date 对象
    const now = new Date(); // 获取当前日期

    let years = now.getFullYear() - start.getFullYear(); // 计算年份差
    let months = now.getMonth() - start.getMonth(); // 计算月份差

    // 如果月份差是负数，则减少一年并增加月份
    if (months < 0) {
        years--;
        months += 12;
    }

    return `${years}Year${months}Month`;
};


function ProfilePage() {
    const { user } = useUser(); // Getting user data
    const userId = user?.userId; // 获取 userId
    const [isEditing, setIsEditing] = useState(false); // 控制是否进入编辑模式
    const [profileData, setProfileData] = useState({
        ageOnYoVenture: 0,
        age: '',
        gender: '',
        occupation: '',
        mbti: '',
        travelerOrSupplier: '',
        openToTravelBuddies: false,
        openToTravelSuppliers: false,
        travelActivities: '',
        rate: '',
        footprint: '',
        tags: ''
    });
    const [editData, setEditData] = useState(profileData);
    const [previewImage, setPreviewImage] = useState('/path-to-default-image.png'); // 用于存储图片预览
    const [selectedImage, setSelectedImage] = useState(null); // 存储用户选择的图片

    useEffect(() => {
        // 确保 userId 存在后再发起请求
        console.log(userId)
        if (userId) {
            const fetchData = async () => {
                try {
                    const response = await fetch(`/yv-get-user-profile?user_id=${encodeURIComponent(userId)}`, {
                        method: 'GET',
                        headers: {
                            'accept': 'application/json',
                        },
                    });
                    console.log(response)
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await response.json();
                    setProfileData(data.user_profile);
                    console.log('个人信息展示',profileData)
                    setEditData(profileData); // 同时更新编辑数据
                } catch (error) {
                    console.error("Error fetching profile data:", error);
                }
            };

            fetchData();
        }
    }, [userId]); // 当 userId 改变时触发

    // 处理编辑按钮点击
    const handleEditClick = () => {
        setIsEditing(true);
    };

    // 处理表单字段变化
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // 处理头像上传
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setSelectedImage(file); // 存储用户选择的图片

        // 创建图片的预览
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result); // 显示图片预览
        };
        if (file) {
            reader.readAsDataURL(file); // 读取图片数据
        }
    };

    // 处理确认保存
    const handleConfirmClick = async () => {
        try {
            console.log('更改信息',editData)
            console.log('更改信息', JSON.stringify({
                user_id: userId, // 使用当前用户的 email
                name: editData.name || user.name, // 默认值为用户当前的名字
                phone: editData.phone || '',
                password: '', // 忽略或保留空白
                gender: editData.gender || '',
                date_of_birth: editData.age || '',
                occupation: editData.occupation || '',
                mbti: editData.mbti || '',
                supplier: editData.supplier || 'False',
                open_to_travel_buddies: editData.openToTravelBuddies,
                photo: [] // 这部分可以根据实际情况处理
            }))
            const response = await fetch('/yv-update-user-profile', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId, // 使用当前用户的 email
                    name: editData.name || user.name, // 默认值为用户当前的名字
                    phone: editData.phone || '',
                    password: '', // 忽略或保留空白
                    gender: editData.gender || '',
                    date_of_birth: "2024-10-19" || '',
                    occupation: editData.occupation || '',
                    mbti: editData.mbti || '',
                    supplier: editData.supplier || 'False',
                    open_to_travel_buddies: editData.openToTravelBuddies,
                    photo: [] // 这部分可以根据实际情况处理
                })
            });

            if (response.ok) {
                const updatedProfile = await response.json();
                console.log('更改完之后展示',editData)
                setProfileData(editData); // 更新页面展示的数据
                setIsEditing(false); // 退出编辑模式
            } else {
                console.error("Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };


    return (
        <div className="profile-page">
            <div className="profile-left">
                <div className='profile-basic-container'>
                    <div className='profile-image-name-container'>
                        <div className="profile-image">
                            {/* 用户点击图片可选择新头像 */}
                            <label htmlFor="upload-photo">
                                <img src={previewImage} alt="Profile" style={{ cursor: 'pointer' }} />
                            </label>
                            <input
                                type="file"
                                id="upload-photo"
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>
                        {isEditing ? (
                            <input 
                                type="text" 
                                name="name" 
                                value={editData.name} 
                                onChange={handleChange} 
                                placeholder="Enter your name"
                            />
                        ) : (
                            <h2>{profileData.name || "Linda"}</h2>
                        )}
                    </div>
                <div className='profile-more-info-container'>
                    {/* 如果在编辑模式下，显示可编辑表单 */}
                    {isEditing ? (
                        <>
                            <p><strong>Age on YoVenture:</strong> <input type="text" name="ageOnYoVenture" value={editData.ageOnYoVenture} onChange={handleChange} /></p>
                            <p><strong>Age:</strong> <input type="text" name="age" value={editData.age} onChange={handleChange} /></p>
                            <p><strong>Gender:</strong> <input type="text" name="gender" value={editData.gender} onChange={handleChange} /></p>
                            <p><strong>Job:</strong> <input type="text" name="job" value={editData.occupation} onChange={handleChange} /></p>
                            <p><strong>MBTI:</strong> <input type="text" name="mbti" value={editData.mbti} onChange={handleChange} /></p>
                            <p><strong>Traveler or Supplier:</strong> 
                                <select name="travelerOrSupplier" value={editData.travelerOrSupplier} onChange={handleChange}>
                                    <option value="Traveler">Traveler</option>
                                    <option value="Supplier">Supplier</option>
                                </select>
                            </p>
                            <p><strong>Open to travel buddies:</strong> 
                                <input type="checkbox" name="openToTravelBuddies" checked={editData.openToTravelBuddies} onChange={handleChange} />
                            </p>
                            <p><strong>Open to travel suppliers:</strong> 
                                <input type="checkbox" name="openToTravelSuppliers" checked={editData.openToTravelSuppliers} onChange={handleChange} />
                            </p>
                            {/* 确认按钮 */}
                            <button onClick={handleConfirmClick}>Confirm</button>
                        </>
                    ) : (
                        <>
                            <p><strong>Age on YoVenture:</strong> {calculateTimeSince(profileData.a_yo_venturer_since
)}</p>
                            <p><strong>Age:</strong> {profileData.age || 'N/A'}</p>
                            <p><strong>Sex:</strong> {profileData.sex || 'N/A'}</p>
                            <p><strong>Job:</strong> {profileData.job || 'N/A'}</p>
                            <p><strong>MBTI:</strong> {profileData.mbti || 'N/A'}</p>
                            <p><strong>Traveler or Supplier:</strong> {profileData.travelerOrSupplier || 'N/A'}</p>
                            <p><strong>Open to travel buddies:</strong> {profileData.openToTravelBuddies ? 'Yes' : 'No'}</p>
                            <p><strong>Open to travel suppliers:</strong> {profileData.openToTravelSuppliers ? 'Yes' : 'No'}</p>
                            {/* 编辑按钮 */}
                            <button onClick={handleEditClick}>Edit</button>
                        </>
                    )}
                </div>
            </div>
            </div>
            <div className="profile-right">
                <div className='profile-right-up'>
                    <div className="profile-section-travel-activity">
                        <h3>Travel Activities</h3>
                        <p>{profileData.travelActivities || 'N/A'}</p>
                    </div>
                    <div className="profile-section-rate">
                        <h3>Rate</h3>
                        <p>{profileData.rate || 'N/A'}</p>
                    </div>
                </div>
                <div className='profile-right-down'>
                    <div className="profile-section-footprint">
                        <h3>Footprint</h3>
                        <p>{profileData.footprint || 'N/A'}</p>
                    </div>
                    <div className="profile-section-tags">
                        <h3>Tags</h3>
                        <p>{profileData.tags || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
