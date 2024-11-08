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
          <h2>AI Travel Assistant</h2>
          <p>Assists users to generate itineraries by discussing, picturing, and videos.</p>
          </div>
          <span class="feature-image" id="HW-Chat-Assistant-image"></span>
        </div>

        <div class="feature" id="HW-Match">
          <span class="feature-image" id="HW-Match-Assistant-image"></span>
          <div class="feature-text">
          <h2>Enhanced Matching</h2>
          <p>Connects locals, tourists and travel buddies easily.</p>
          </div>
        </div>

        <div class="feature" id="HW-Pitfall">
          <div class="feature-text">
          <h2>Avoid Pitfalls</h2>
          <p>Improves user engagement and help users avoid pitfalls.</p>
          </div>
          <span class="feature-image" id="HW-Pitfall-Assistant-image"></span>
        </div>

        <div class="feature" id="HW-Explorer">
          <span class="feature-image" id="HW-Explorer-Assistant-image"></span>
          <div class="feature-text">
          <h2>Enthusiasts Becoming Explorer</h2>
          <p>Travel lovers could become professional planners.</p>
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
