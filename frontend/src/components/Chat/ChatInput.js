import React, { useState } from 'react';
import './ChatInput.css';
import config from '../../config'; // 引入 config.js

const Url = config.apiUrl;

function ChatInput({ sendMessage,  addToMemberList}) {
  const [input, setInput] = useState('');
  const [matchModalVisible, setMatchModalVisible] = useState(false);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [interestedProfiles, setInterestedProfiles] = useState([]);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  const profiles = [
    {
      name: 'Sarah Lopez',
      avatar: 'A cheerful young woman with long, wavy brown hair, wearing a yellow dress and a bright smile.',
      introduction: "Hi, I’m Sarah! I’m a travel expert specializing in adventure tourism. I’ve explored over 50 countries and love helping people plan unique, off-the-beaten-path experiences. Whether it’s hiking in the Andes or scuba diving in Bali, I’m here to make it unforgettable!",
      imageUrl: 'https://st2.depositphotos.com/4196725/43351/i/1600/depositphotos_433514598-stock-photo-blonde-woman-smiling-proudly-confidently.jpg',
      Specialty: 'Adventure and Eco-Tourism'
    },
    {
      name: 'John Mitchell',
      avatar: 'A laid-back man with short black hair and glasses, wearing a casual blue hoodie and headphones around his neck.',
      introduction: "Hey, I’m John! With over 15 years of experience as a wildlife and nature travel guide, I’m passionate about bringing people closer to nature. From African safaris to Amazon rainforest explorations, I provide insights and guidance for nature enthusiasts.",
      imageUrl: 'https://as1.ftcdn.net/v2/jpg/02/99/04/20/1000_F_299042079_vGBD7wIlSeNl7vOevWHiL93G4koMM967.jpg',
      Specialty: 'Wildlife and Nature Tours'
    },
    {
      name: 'Priya Desai',
      avatar: 'A friendly young man with curly blond hair, wearing a white shirt and standing in front of a beach at sunset.',
      introduction: "Hi, I’m Priya! I’m a travel blogger and urban culture expert. I focus on luxury stays, unique local food, and hidden city gems across Europe and Asia. Let me help you discover the best spots and cultural experiences around the world.",
      imageUrl: 'https://img.freepik.com/premium-photo/cheerful-young-woman-stylishly-posing-against-vibrant-orange-backdrop-generative-ai_804788-103474.jpg?w=1480',
      Specialty:'Urban Culture and Luxury Travel'
    },
    {
      name: 'Emma Thompson',
      avatar: 'A confident woman with short, stylish black hair, wearing a leather jacket and standing in front of a cityscape.',
      introduction: "Hi, I’m Emma! I’m a culinary travel expert who combines my love for food and travel. From wine tours in France to street food adventures in Thailand, I guide food lovers through unforgettable gastronomic journeys.",
      imageUrl: 'https://as2.ftcdn.net/v2/jpg/04/37/73/37/1000_F_437733759_BpWiU7WJXo462LNC8QxFvuZ6VFPCcHod.jpg',
      Specialty: 'Culinary and Wine Tours'
    },

    {
      name: 'Marco Rossi',
      avatar: 'A young man with curly dark hair, wearing a backpack and standing beside a stunning waterfall.',
      introduction: "Ciao! I’m Marco, a passionate backpacker and travel guide from Italy. I specialize in budget travel and backpacking routes, offering tips on where to stay, how to save, and must-see spots. Join me on a journey that doesn’t break the bank!",
      imageUrl: 'https://img.freepik.com/premium-photo/young-man-with-curly-hair-standing-street_893012-50396.jpg?w=1380',
      Specialty: 'Budget Travel and Backpacking'
    }
  ];

  const handleMatch = () => {
    setMatchModalVisible(true);
  };

  const handleNextProfile = () => {
    setCurrentProfileIndex((prev) => (prev + 1) % profiles.length);
  };

  const handlePreviousProfile = () => {
    setCurrentProfileIndex((prev) => (prev - 1 + profiles.length) % profiles.length);
  };

  const handleInterested = (index) => {
    const selectedProfile = profiles[index];
    if (interestedProfiles.some((profile) => profile.name === selectedProfile.name)) {
      // Remove if already interested
      setInterestedProfiles(interestedProfiles.filter((profile) => profile.name !== selectedProfile.name));
    } else {
      // Add if marked interested
      setInterestedProfiles([...interestedProfiles, selectedProfile]);
    }
  };

  const handleDone = async () => {
    try {
      // Send interestedProfiles to the API
      const response = await fetch(`${Url}/save-interested-members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interestedProfiles }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to save interested profiles');
      }
  
      // Reset state and close modal
      setMatchModalVisible(false);
      setCurrentProfileIndex(0);
      setInterestedProfiles([]);
    } catch (error) {
      console.error('Error saving interested profiles:', error);
    }
  };

  return (
    <div className="chat-input-wrapper">
      {/* 左边的 Match 按钮 */}
      <button className="match-button" onClick={handleMatch}>
        Match
      </button>

      {/* 输入框和发送按钮 */}
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => (e.key === 'Enter' ? handleSend() : null)}
        />
        <button onClick={handleSend}>Send</button>
      </div>

      {/* 匹配弹窗 */}
      {matchModalVisible && (
      <div className="modal">
        <div className="modal-content">
          {/* Close button in the top-right corner */}
          <button className="modal-close" onClick={() => setMatchModalVisible(false)}>
            &times;
          </button>

          <h3>You have been matched with:</h3>
          <div className="modal-card-select">
            <button
              className="modal-card-arrow modal-card-prev-button"
              onClick={handlePreviousProfile}
            >
              &#8249; {/* Left arrow symbol */}
            </button>
            <div className="profile-mini-card">
              <img
                src={profiles[currentProfileIndex].imageUrl}
                alt={profiles[currentProfileIndex].name}
                className="profile-avatar"
              />
              <h3 className="profile-name">{profiles[currentProfileIndex].name}</h3>
            <p className="profile-introduction">{profiles[currentProfileIndex].introduction}</p>
            <div className="profile-specialty">
              <p>
                <strong>Specialty:</strong> {profiles[currentProfileIndex].Specialty}
              </p>
              <button
                  className={`interested-button ${
                    interestedProfiles.some(
                      (profile) => profile.name === profiles[currentProfileIndex].name
                    )
                      ? 'interested'
                      : ''
                  }`}
                  onClick={() => handleInterested(currentProfileIndex)}
                >
                  {interestedProfiles.some(
                    (profile) => profile.name === profiles[currentProfileIndex].name
                  )
                    ? '✔ Interested'
                    : 'Interested'}
                </button>
            </div>
            </div>
            <button
              className="modal-card-arrow modal-card-next-button"
              onClick={handleNextProfile}
            >
              &#8250;
            </button>
          </div>
          <button className="modal-done" onClick={handleDone}>
            Done
          </button>
        </div>
      </div>
    )}

    </div>
  );
}

export default ChatInput;
