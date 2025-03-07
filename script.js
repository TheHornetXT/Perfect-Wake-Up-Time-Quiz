document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const quizForm = document.getElementById('quiz-form');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const resultContainer = document.getElementById('result-container');
    const idealTimeElement = document.getElementById('ideal-time');
    const bedtimeElement = document.getElementById('bedtime');
    const explanationElement = document.getElementById('explanation');
    const sleepTipsList = document.getElementById('sleep-tips-list');
    const restartBtn = document.getElementById('restart-btn');
    const progressBar = document.getElementById('quiz-progress');
    const progressStatus = document.getElementById('progress-status');
    const sleepHoursInput = document.getElementById('sleep-hours');
    const sleepHoursValue = document.getElementById('sleep-hours-value');
    const routineRadios = document.querySelectorAll('input[name="morning-routine"]');
    const routineFollowUp = document.getElementById('routine-follow-up');

    // Quiz navigation variables
    let currentQuestion = 1;
    const totalQuestions = 17;
    
    // Initialize the quiz
    initializeQuiz();
    
    // Event listeners
    prevBtn.addEventListener('click', showPreviousQuestion);
    nextBtn.addEventListener('click', showNextQuestion);
    submitBtn.addEventListener('click', calculateResults);
    restartBtn.addEventListener('click', restartQuiz);
    sleepHoursInput.addEventListener('input', updateSleepHoursValue);
    
    // Show/hide routine follow-up based on selection
    routineRadios.forEach(radio => {
        radio.addEventListener('change', toggleRoutineFollowUp);
    });

    // Initialize the quiz state
    function initializeQuiz() {
        // Show only the first question
        showQuestion(1);
        updateProgressBar();
        
        // Update sleep hours value display
        updateSleepHoursValue();
        
        // Initialize routine follow-up visibility
        toggleRoutineFollowUp();
    }
    
    // Show a specific question
    function showQuestion(questionNumber) {
        // Hide all questions
        const questions = document.querySelectorAll('.question');
        questions.forEach(question => {
            question.classList.remove('active');
        });
        
        // Show the current question
        const currentQuestionElement = document.getElementById(`q${questionNumber}`);
        if (currentQuestionElement) {
            currentQuestionElement.classList.add('active');
        }
        
        // Update navigation buttons
        updateNavigationButtons();
    }
    
    // Show previous question
    function showPreviousQuestion() {
        if (currentQuestion > 1) {
            currentQuestion--;
            showQuestion(currentQuestion);
            updateProgressBar();
        }
    }
    
    // Show next question
    function showNextQuestion() {
        if (validateCurrentQuestion()) {
            if (currentQuestion < totalQuestions) {
                currentQuestion++;
                showQuestion(currentQuestion);
                updateProgressBar();
            }
        } else {
            alert("Please answer the current question before proceeding.");
        }
    }
    
    // Update navigation buttons based on current question
    function updateNavigationButtons() {
        // Show/hide Previous button
        prevBtn.style.display = currentQuestion > 1 ? 'block' : 'none';
        
        // Show/hide Next and Submit buttons
        nextBtn.style.display = currentQuestion < totalQuestions ? 'block' : 'none';
        submitBtn.style.display = currentQuestion === totalQuestions ? 'block' : 'none';
    }
    
    // Update progress bar
    function updateProgressBar() {
        progressBar.value = currentQuestion;
        progressStatus.textContent = `Question ${currentQuestion} of ${totalQuestions}`;
    }
    
    // Validate current question (check if answered)
    function validateCurrentQuestion() {
        const currentQuestionElement = document.getElementById(`q${currentQuestion}`);
        
        // Skip validation for slider questions or time inputs
        if (currentQuestion === 1 || currentQuestion === 8 || currentQuestion === 16) {
            return true;
        }
        
        // For radio button questions
        const radioButtons = currentQuestionElement.querySelectorAll('input[type="radio"]');
        if (radioButtons.length > 0) {
            let isAnswered = false;
            radioButtons.forEach(radio => {
                if (radio.checked) {
                    isAnswered = true;
                }
            });
            return isAnswered;
        }
        
        return true; // Default to true for other question types
    }
    
    // Update sleep hours value display
    function updateSleepHoursValue() {
        sleepHoursValue.textContent = sleepHoursInput.value;
    }
    
    // Toggle routine follow-up visibility
    function toggleRoutineFollowUp() {
        const hasRoutine = document.getElementById('routine-1').checked;
        routineFollowUp.style.display = hasRoutine ? 'block' : 'none';
    }
    
    // Calculate and display results
    function calculateResults() {
        if (!validateCurrentQuestion()) {
            alert("Please answer all questions before submitting.");
            return;
        }
        
        // Get form data
        const formData = new FormData(quizForm);
        const quizAnswers = {};
        
        for (const [key, value] of formData.entries()) {
            quizAnswers[key] = value;
        }
        
        // Calculate ideal wake-up time
        const idealWakeUpTime = calculateIdealWakeUpTime(quizAnswers);
        
        // Calculate recommended bedtime
        const recommendedBedtime = calculateRecommendedBedtime(idealWakeUpTime, parseFloat(quizAnswers['sleep-hours']));
        
        // Generate sleep tips
        const sleepTips = generateSleepTips(quizAnswers);
        
        // Generate explanation
        const explanation = generateExplanation(quizAnswers, idealWakeUpTime);
        
        // Display results
        displayResults(idealWakeUpTime, recommendedBedtime, explanation, sleepTips);
        
        // Hide quiz form, show results
        quizForm.style.display = 'none';
        resultContainer.style.display = 'block';
    }
    
    // Calculate ideal wake-up time based on answers
    function calculateIdealWakeUpTime(answers) {
        // Get commitment time (work/school)
        const commitmentTime = answers['commitment-time'];
        
        // Parse commitment time
        const [commitmentHours, commitmentMinutes] = commitmentTime.split(':').map(Number);
        
        // Calculate routine time needed
        let routineTimeNeeded = 0;
        if (answers['morning-routine'] === 'yes') {
            routineTimeNeeded = parseInt(answers['routine-time']) || 0;
        }
        
        // Convert routine time from minutes to hours and minutes
        const routineHours = Math.floor(routineTimeNeeded / 60);
        const routineMinutes = routineTimeNeeded % 60;
        
        // Calculate raw wake-up time (commitment time minus routine time)
        let rawWakeUpHours = commitmentHours - routineHours;
        let rawWakeUpMinutes = commitmentMinutes - routineMinutes;
        
        // Adjust for negative minutes
        if (rawWakeUpMinutes < 0) {
            rawWakeUpMinutes += 60;
            rawWakeUpHours -= 1;
        }
        
        // Adjust for negative hours (previous day)
        if (rawWakeUpHours < 0) {
            rawWakeUpHours += 24;
        }
        
        // Apply adjustments based on other factors
        
        // 1. Drowsiness factor
        const drowsyFactor = parseInt(answers['drowsy'] || 0);
        
        // 2. Caffeine dependency factor
        const caffeineFactor = parseInt(answers['caffeine'] || 0);
        
        // 3. Sleep trouble factor
        const sleepTroubleFactor = parseInt(answers['trouble-sleeping'] || 0);
        
        // 4. Morning grogginess factor
        const groggyFactor = parseInt(answers['groggy'] || 0);
        
        // 5. Sleep cycle disruption factor
        let sleepCycleFactor = 0;
        if (answers['sleep-cycle'] === 'always') sleepCycleFactor = 30;
        else if (answers['sleep-cycle'] === 'often') sleepCycleFactor = 20;
        else if (answers['sleep-cycle'] === 'sometimes') sleepCycleFactor = 10;
        
        // 6. Natural wake time preference
        let alertnessAdjustment = 0;
        if (answers['alert-time'] === 'early-morning') alertnessAdjustment = -15;
        else if (answers['alert-time'] === 'mid-morning') alertnessAdjustment = 0;
        else if (answers['alert-time'] === 'afternoon') alertnessAdjustment = 15;
        else if (answers['alert-time'] === 'evening') alertnessAdjustment = 30;
        else if (answers['alert-time'] === 'night') alertnessAdjustment = 45;
        else if (answers['alert-time'] === 'late-night') alertnessAdjustment = 60;
        
        // Calculate total adjustment in minutes
        // If there are many factors suggesting sleep problems, we'll suggest waking up slightly earlier
        // to create a more consistent schedule and allow more time to feel alert
        const totalAdjustmentMinutes = -15 * (drowsyFactor + caffeineFactor + sleepTroubleFactor + groggyFactor) / 8 + sleepCycleFactor + alertnessAdjustment;
        
        // Apply the adjustment
        let adjustedWakeUpMinutes = rawWakeUpMinutes + (totalAdjustmentMinutes % 60);
        let adjustedWakeUpHours = rawWakeUpHours + Math.floor(totalAdjustmentMinutes / 60);
        
        // Normalize minutes
        if (adjustedWakeUpMinutes >= 60) {
            adjustedWakeUpMinutes -= 60;
            adjustedWakeUpHours += 1;
        } else if (adjustedWakeUpMinutes < 0) {
            adjustedWakeUpMinutes += 60;
            adjustedWakeUpHours -= 1;
        }
        
        // Normalize hours
        adjustedWakeUpHours = ((adjustedWakeUpHours % 24) + 24) % 24;
        
        // Round to nearest 5 minutes for more natural time
        adjustedWakeUpMinutes = Math.round(adjustedWakeUpMinutes / 5) * 5;
        if (adjustedWakeUpMinutes === 60) {
            adjustedWakeUpMinutes = 0;
            adjustedWakeUpHours = (adjustedWakeUpHours + 1) % 24;
        }
        
        // Format the time
        const hours = adjustedWakeUpHours.toString().padStart(2, '0');
        const minutes = adjustedWakeUpMinutes.toString().padStart(2, '0');
        
        return `${hours}:${minutes}`;
    }
    
    // Calculate recommended bedtime based on wake-up time and sleep needs
    function calculateRecommendedBedtime(wakeUpTime, sleepHours) {
        // Parse wake-up time
        const [wakeHours, wakeMinutes] = wakeUpTime.split(':').map(Number);
        
        // Convert sleep hours to hours and minutes
        const sleepTimeHours = Math.floor(sleepHours);
        const sleepTimeMinutes = Math.round((sleepHours - sleepTimeHours) * 60);
        
        // Calculate bedtime (wake-up time minus sleep time)
        let bedtimeHours = wakeHours - sleepTimeHours;
        let bedtimeMinutes = wakeMinutes - sleepTimeMinutes;
        
        // Adjust for negative minutes
        if (bedtimeMinutes < 0) {
            bedtimeMinutes += 60;
            bedtimeHours -= 1;
        }
        
        // Adjust for negative hours (previous day)
        if (bedtimeHours < 0) {
            bedtimeHours += 24;
        }
        
        // Format the time
        const hours = bedtimeHours.toString().padStart(2, '0');
        const minutes = bedtimeMinutes.toString().padStart(2, '0');
        
        return `${hours}:${minutes}`;
    }
    
    // Generate explanation based on answers
    function generateExplanation(answers, idealWakeUpTime) {
        let explanation = `<p>Based on your responses, a wake-up time of <strong>${formatTimeForDisplay(idealWakeUpTime)}</strong> would be ideal for you.</p>`;
        
        // Add explanation about sleep need
        explanation += `<p>You indicated that you need ${answers['sleep-hours']} hours of sleep to feel rested. `;
        
        // Add explanation about schedule
        explanation += `Since you need to be ready for your commitments by ${formatTimeForDisplay(answers['commitment-time'])}, `;
        
        if (answers['morning-routine'] === 'yes') {
            explanation += `and you need about ${answers['routine-time']} minutes for your morning routine, `;
        }
        
        explanation += `this wake-up time allows you to prepare adequately while optimizing your sleep cycle.</p>`;
        
        // Add explanation about chronotype
        if (answers['alert-time']) {
            explanation += `<p>Your responses suggest that you're naturally more alert during the ${formatAlertTime(answers['alert-time'])}. `;
            explanation += `This has been factored into your recommended wake-up time.</p>`;
        }
        
        return explanation;
    }
    
    // Generate personalized sleep tips based on answers
    function generateSleepTips(answers) {
        const tips = [];
        
        // Drowsiness tips
        if (parseInt(answers['drowsy']) > 2) {
            tips.push("You reported feeling drowsy during the day, which may indicate insufficient sleep quality. Try maintaining a consistent sleep schedule, even on weekends.");
        }
        
        // Caffeine dependency tips
        if (parseInt(answers['caffeine']) > 2) {
            tips.push("Consider reducing caffeine intake, especially after 2 PM, as it can significantly impact sleep quality even hours after consumption.");
        }
        
        // Sleep trouble tips
        if (parseInt(answers['trouble-sleeping']) > 2) {
            tips.push("For your difficulty falling or staying asleep, try creating a relaxing pre-bed routine and avoid screens 1 hour before bedtime.");
        }
        
        // Morning grogginess tips
        if (parseInt(answers['groggy']) > 2) {
            tips.push("Morning grogginess might be reduced by exposing yourself to bright light immediately after waking and establishing a consistent wake-up time.");
        }
        
        // Sleep cycle disruption tips
        if (answers['sleep-cycle'] === 'always' || answers['sleep-cycle'] === 'often') {
            tips.push("You may be waking up in the middle of a sleep cycle. Try using a sleep cycle calculator or smart alarm to wake up during lighter sleep phases.");
        }
        
        // Regular schedule tips
        if (answers['regular-schedule'] === 'no') {
            tips.push("Establishing a consistent sleep and wake schedule is one of the most effective ways to improve sleep quality and morning alertness.");
        }
        
        // Alarm dependency tips
        if (answers['alarm-use'] === 'always-alarm' || answers['alarm-use'] === 'usually-alarm') {
            tips.push("Relying heavily on alarm clocks may indicate your body isn't getting enough sleep or isn't aligned with your natural circadian rhythm.");
        }
        
        // Add general tips if needed
        if (tips.length < 3) {
            tips.push("Keeping your bedroom cool (around 65-68°F/18-20°C) can promote better sleep quality.");
            tips.push("Regular physical activity can help you fall asleep faster and enjoy deeper sleep, but try to finish exercise at least 3 hours before bedtime.");
        }
        
        return tips;
    }
    
    // Display results on the page
    function displayResults(idealWakeUpTime, recommendedBedtime, explanation, sleepTips) {
        // Display ideal wake-up time
        idealTimeElement.textContent = formatTimeForDisplay(idealWakeUpTime);
        
        // Display recommended bedtime
        bedtimeElement.textContent = formatTimeForDisplay(recommendedBedtime);
        
        // Display explanation
        explanationElement.innerHTML = explanation;
        
        // Display sleep tips
        sleepTipsList.innerHTML = '';
        sleepTips.forEach(tip => {
            const li = document.createElement('li');
            li.textContent = tip;
            sleepTipsList.appendChild(li);
        });
    }
    
    // Format time for display (convert from 24h to 12h format)
    function formatTimeForDisplay(time24h) {
        const [hours, minutes] = time24h.split(':').map(Number);
        let period = 'AM';
        let hours12 = hours;
        
        if (hours >= 12) {
            period = 'PM';
            if (hours > 12) {
                hours12 = hours - 12;
            }
        }
        
        // Special case for midnight
        if (hours === 0) {
            hours12 = 12;
        }
        
        return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    }
    
    // Format alert time for explanation
    function formatAlertTime(alertTime) {
        switch (alertTime) {
            case 'early-morning': return 'early morning (5am-8am)';
            case 'mid-morning': return 'mid-morning (8am-11am)';
            case 'afternoon': return 'afternoon (11am-3pm)';
            case 'evening': return 'evening (3pm-8pm)';
            case 'night': return 'night (8pm-12am)';
            case 'late-night': return 'late night/early morning (12am-5am)';
            default: return alertTime;
        }
    }
    
    // Restart the quiz
    function restartQuiz() {
        // Reset to first question
        currentQuestion = 1;
        
        // Reset the form
        quizForm.reset();
        
        // Initialize the quiz again
        initializeQuiz();
        
        // Show quiz form, hide results
        quizForm.style.display = 'block';
        resultContainer.style.display = 'none';
    }
});
