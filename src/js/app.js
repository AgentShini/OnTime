async function fetchReminders() {
    try {
        const response = await fetch('/api/get-reminders');
        if (!response.ok) {
            throw new Error('Failed to fetch reminders');
        }
        const reminders = await response.json();

        const list = document.getElementById('reminderList');
        list.innerHTML = ''; // Clear existing reminders

        reminders.forEach(reminder => {
            const li = document.createElement('li');
            li.textContent = `${reminder.subject} - ${new Date(reminder.reminderTime).toLocaleString()}`;
            list.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching reminders:', error);
        const list = document.getElementById('reminderList');
        list.innerHTML = '<li>Failed to load reminders. Please try again later.</li>';
    }
}

// Fetch reminders when the page loads
fetchReminders();

// Optionally, you can fetch reminders periodically
// setInterval(fetchReminders, 60000); // Refresh every minute