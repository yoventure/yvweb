import React from 'react';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <div id = 'bg'>
        <p id='p1'>YoVenture</p>
        <p id='p2' class="repeat">Travel Facilitator: Match, Plan, Avoid, Monetize</p>
      </div>
      <div id="functions">
        <h1 id="HW">How It Works</h1>  
        <div class="feature" id="HW-Chat">
          <div class="feature-text">
          <h2 className='h2-step1'>Step1 - Set Notifications</h2>
          <p className='p-step1'>Set your preferences for travel alerts based on your interests, schedule, and style. Let YoVenture curate the perfect insights just for you.</p>
          </div>
          <span class="feature-image" id="HW-Chat-Assistant-image"></span>
        </div>

        <div class="feature" id="HW-Match">
          <span class="feature-image" id="HW-Match-Assistant-image"></span>
          <div class="feature-text">
          <h2 className='h2-step2'>Step2 - Smart Alerts</h2>
          <p className='p-step2'>Get timely notifications that wake you up to exciting opportunities—exclusive deals, hidden gems, and seasonal highlights tailored to your travel dreams.</p>
          </div>
        </div>

        <div class="feature" id="HW-Pitfall">
          <div class="feature-text">
          <h2 className='h2-step3'>Step3 - Curated Insights</h2>
          <p className='p-step3'>Browse a concise, curated newsletter showcasing the latest discoveries and ideas to spark your wanderlust.</p>
          </div>
          <span class="feature-image" id="HW-Pitfall-Assistant-image"></span>
        </div>

        <div class="feature" id="HW-Explorer">
          <span class="feature-image" id="HW-Explorer-Assistant-image"></span>
          <div class="feature-text">
          <h2 className='h2-step4'>Step4 - AI Itineraries</h2>
          <p className='p-step4'>Dive into an AI-crafted, stylish itinerary built from your selected insights. Customize and refine your plans directly in the app to make them uniquely yours.</p>
          </div>
        </div>
      </div>
      <div class='footer-container'>
        <div class='footer-content'>
          <div class='footer-grid'>
            <div class='footer-grid-col1'>
              <h2>YoVenture</h2>
            </div>
            <div class='footer-grid-col2'>
              <h2 class='footer-grdi-col2-title'>Explorer Program</h2>
                <ul class='footer-grid-col2-link'>
                  <li>
                    Become an Explorer
                  </li>
                  <li>
                    Professional Certificate
                  </li>
                  <li>
                    Incentive Plan
                  </li>
                </ul>
            </div>
            <div class='footer-grid-col3'>
            <h2 class='footer-grid-col3-title'>Company</h2>
            <ul class='footer-grid-col3-link'>
                  <li>
                    About
                  </li>
                  <li>
                    Team
                  </li>
                  <li>
                    Contact
                  </li>
                  <li>
                    Help
                  </li>
                </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;
