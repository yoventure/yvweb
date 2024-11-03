import './travel-time.css';

let daysCount = 6;

export function openModal() {
    const modalContent = document.getElementById('travel-time-modal-content');
    const modalOverlay = document.getElementById('modal-overlay');
    const openModalBtn = document.getElementById('open-modal-btn');
    
    if (modalContent && modalOverlay) {
        modalContent.classList.add('active');
        modalOverlay.classList.add('active');
    } else {
        console.error('Modal elements not found!');
    }
    
    if (openModalBtn) {
        openModalBtn.textContent = `${daysCount} days`;
    } else {
        console.error('Open modal button not found!');
    }
}

export function closeModal() {
    const modalContent = document.getElementById('travel-time-modal-content');
    const modalOverlay = document.getElementById('modal-overlay');
    
    if (modalContent && modalOverlay) {
        modalContent.classList.remove('active');
        modalOverlay.classList.remove('active');
    } else {
        console.error('Modal elements not found!');
    }
}

export function initializeTravelTimeModal() {
    const modal = document.getElementById('travel-time-modal');
    if (!modal) {
        console.error('Modal container not found!');
        return;
    }

    const modalHTML = `
        <div id="travel-time-modal-content" class="modal hidden">
            <div role="tablist" aria-orientation="horizontal" class="flex gap-1 overflow-hidden rounded-full bg-gray-3 p-2">
                <button id="tab-trigger-dates" role="tab" aria-selected="true" aria-controls="tab-content-dates" class="tab-btn active">
                    Dates
                </button>
                <button id="tab-trigger-flexible" role="tab" aria-selected="false" aria-controls="tab-content-flexible" class="tab-btn">
                    Flexible
                </button>
            </div>
            <div id="tab-content-dates" class="tab-content active">
                <div class="calendar-container">
                    <div class="calendar-header">
                        <button class="nav-button" id="prev-month">‹</button>
                        <span id="month-year"></span>
                        <button class="nav-button" id="next-month">›</button>
                    </div>
                    <div class="calendar-grid">
                        <!-- Calendar days will go here -->
                    </div>
                </div>
                <label for="start-date">Start Date:</label>
                <input type="date" id="start-date">
                <label for="end-date">End Date:</label>
                <input type="date" id="end-date">
            </div>
            <div id="tab-content-flexible" class="tab-content">
                <label for="days-input">Enter number of days:</label>
                <input type="number" id="days-input" min="1" value="${daysCount}">
                <button id="set-days-btn">Set Days</button>
            </div>
            <button id="update-selection-btn" class="update-button">Update</button>
        </div>
        <div id="modal-overlay" class="modal-overlay hidden"></div>
    `;
    modal.innerHTML = modalHTML;

    // Handle tab switching
    const tabs = modal.querySelectorAll('[role="tab"]');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.setAttribute('aria-selected', 'false');
                t.classList.remove('active');
            });
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.setAttribute('aria-selected', 'true');
            tab.classList.add('active');
            const contentId = tab.getAttribute('aria-controls');
            document.getElementById(contentId).classList.add('active');
        });
    });

    const modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.addEventListener('click', closeModal);

    // Set up flexible tab
    const setDaysBtn = document.getElementById('set-days-btn');
    setDaysBtn.addEventListener('click', () => {
        const daysInput = document.getElementById('days-input').value;
        if (daysInput) {
            updateDays(parseInt(daysInput, 10));
        }
    });

    const updateSelectionBtn = document.getElementById('update-selection-btn');
    updateSelectionBtn.addEventListener('click', updateSelection);

    // Calendar functionality
    const monthYearElement = document.getElementById('month-year');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
  
    let currentDate = new Date();
  
    function updateCalendar() {
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const monthName = monthNames[currentDate.getMonth()];
        const year = currentDate.getFullYear();
        monthYearElement.textContent = `${monthName} ${year}`;
    }
  
    prevMonthButton.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCalendar();
    });
  
    nextMonthButton.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalendar();
    });
  
    updateCalendar();
    
    // Update days when start or end date changes
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    function calculateDays() {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);
        if (startDate && endDate && endDate > startDate) {
            const timeDiff = endDate - startDate;
            const dayCount = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1; // Include end date
            updateDays(dayCount);
        }
    }

    startDateInput.addEventListener('change', calculateDays);
    endDateInput.addEventListener('change', calculateDays);
}

function updateSelection() {
    const activeTab = document.querySelector('[role="tab"][aria-selected="true"]');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    let message = '';

    if (activeTab.id === 'tab-trigger-dates') {
        message = `You have selected the date range: ${startDateInput.value} to ${endDateInput.value}. Total days: ${daysCount}.`;
    } else {
        message = `You have selected ${daysCount} days.`;
    }

    alert(message);
    closeModal();
}

function updateDays(newDays) {
    daysCount = Math.max(1, newDays);
    document.getElementById('open-modal-btn').textContent = `${daysCount} days`;
}
