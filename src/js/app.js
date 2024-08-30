let currentUser = null;

async function checkLoginStatus() {
    try {
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        if (session.user) {
            currentUser = session.user;
            document.getElementById('loginStatus').textContent = `Logged in as ${currentUser.email}`;
            document.getElementById('loginButton').style.display = 'none';
            document.getElementById('reminderSection').style.display = 'block';
            document.getElementById('subscriptionSection').style.display = 'block';
            fetchReminders();
            fetchSubscriptionStatus();
        } else {
            document.getElementById('loginButton').style.display = 'block';
        }
    } catch (error) {
        console.error('Error checking login status:', error);
    }
}

async function fetchReminders() {
    try {
        const response = await fetch('/api/get-reminders');
        if (!response.ok) {
            throw new Error('Failed to fetch reminders');
        }
        const reminders = await response.json();

        const list = document.getElementById('reminderList');
        list.innerHTML = '';

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

async function fetchSubscriptionStatus() {
    try {
        const response = await fetch('/api/subscription-status');
        if (!response.ok) {
            throw new Error('Failed to fetch subscription status');
        }
        const { plan, usageCount } = await response.json();

        document.getElementById('currentPlan').textContent = plan;
        if (plan === 'free' && usageCount >= 5) {
            document.getElementById('upgradePlan').style.display = 'block';
        } else {
            document.getElementById('upgradePlan').style.display = 'none';
        }
    } catch (error) {
        console.error('Error fetching subscription status:', error);
    }
}

document.getElementById('loginButton').addEventListener('click', () => {
    window.location.href = '/api/auth/signin';
});

document.getElementById('upgradePlan').addEventListener('click', async () => {
    try {
        const response = await fetch('/api/handle-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan: 'pro' }),
        });
        if (!response.ok) {
            throw new Error('Failed to upgrade plan');
        }
        alert('Successfully upgraded to Pro plan!');
        fetchSubscriptionStatus();
    } catch (error) {
        console.error('Error upgrading plan:', error);
        alert('Failed to upgrade plan. Please try again later.');
    }
});

checkLoginStatus();
