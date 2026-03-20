import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyA8yqcJpZ5_1C2YSWUcx-DrlzOdmfDzqhk",
    authDomain: "studio-f88c8.firebaseapp.com",
    projectId: "studio-f88c8",
    storageBucket: "studio-f88c8.firebasestorage.app",
    messagingSenderId: "645854734080",
    appId: "1:645854734080:web:e26ed1b3726aa9980375e5",
    measurementId: "G-4PNV68424P"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

class StudioBooking {
    constructor() {
        this.selectedPerson = null;
        this.selectedDates = new Set();
        this.rangeStart = null;           // first click of a range selection
        this.currentDate = new Date();
        this.bookings = [];
        this.isAuthenticated = false;
        this.PASSWORD = '7860';
        this.db = db;
        this.unsubscribe = null;

        this.init();
    }

    // ── Auth ──────────────────────────────────────────────────

    init() {
        this.checkAuth();
        document.getElementById('passwordInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });
    }

    checkAuth() {
        if (sessionStorage.getItem('studioAuth') === 'true') {
            this.isAuthenticated = true;
            this.showMainApp();
        }
    }

    login() {
        const input = document.getElementById('passwordInput');
        if (input.value === this.PASSWORD) {
            this.isAuthenticated = true;
            sessionStorage.setItem('studioAuth', 'true');
            this.showMainApp();
        } else {
            document.getElementById('loginError').textContent = 'Incorrect access code';
            input.value = '';
        }
    }

    logout() {
        if (this.unsubscribe) this.unsubscribe();
        sessionStorage.removeItem('studioAuth');
        this.isAuthenticated = false;
        document.getElementById('loginContainer').style.display = 'block';
        document.getElementById('mainContainer').classList.remove('show');
        document.getElementById('passwordInput').value = '';
        document.getElementById('loginError').textContent = '';
    }

    showMainApp() {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('mainContainer').classList.add('show');
        this.setupEventListeners();
        this.startFirebaseListener();
        this.renderCalendar();
    }

    // ── Firebase ──────────────────────────────────────────────

    startFirebaseListener() {
        const q = query(collection(this.db, 'bookings'));
        this.unsubscribe = onSnapshot(q, (snapshot) => {
            this.bookings = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            this.renderCalendar();
            this.renderBookings();
        }, (error) => {
            console.error('Firebase error:', error);
            this.showMessage('Error connecting to database. Please check your configuration.', 'error');
        });
    }

    // ── Event listeners ───────────────────────────────────────

    setupEventListeners() {
        document.querySelectorAll('.person-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectPerson(e.target));
        });

        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        document.getElementById('submitBtn').addEventListener('click', () => {
            this.openConfirmModal();
        });

        document.getElementById('clearSelectionBtn').addEventListener('click', () => {
            this.clearSelection();
        });

        document.getElementById('modalBackBtn').addEventListener('click', () => {
            this.closeConfirmModal();
        });

        document.getElementById('modalConfirmBtn').addEventListener('click', () => {
            this.submitBooking();
        });

        // Close modal on overlay click
        document.getElementById('confirmModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('confirmModal')) {
                this.closeConfirmModal();
            }
        });
    }

    selectPerson(btn) {
        document.querySelectorAll('.person-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedPerson = btn.dataset.person;
        this.updateSubmitButton();
    }

    // ── Range selection ───────────────────────────────────────

    /**
     * Two-click range selection:
     *  - First click  → sets rangeStart, marks date as range-start
     *  - Second click → fills all available dates between start and end
     *  - Clicking rangeStart again → clears selection
     */
    handleDateClick(dateStr) {
        if (this.rangeStart === null) {
            // First click
            this.selectedDates.clear();
            this.rangeStart = dateStr;
            this.selectedDates.add(dateStr);
        } else if (this.rangeStart === dateStr) {
            // Tapped same date → cancel
            this.clearSelection();
            return;
        } else {
            // Second click → fill range
            const start = this.rangeStart < dateStr ? this.rangeStart : dateStr;
            const end   = this.rangeStart < dateStr ? dateStr : this.rangeStart;

            this.selectedDates.clear();
            let cur = new Date(start + 'T00:00:00');
            const endDate = new Date(end + 'T00:00:00');

            while (cur <= endDate) {
                const d = this.formatDate(cur);
                if (!this.isDateBooked(d)) {
                    this.selectedDates.add(d);
                }
                cur.setDate(cur.getDate() + 1);
            }
            this.rangeStart = null;
        }

        this.renderCalendar();
        this.updateSubmitButton();
        this.updateRangeHint();
    }

    clearSelection() {
        this.selectedDates.clear();
        this.rangeStart = null;
        this.renderCalendar();
        this.updateSubmitButton();
        this.updateRangeHint();
    }

    updateRangeHint() {
        const hint = document.getElementById('rangeHintText');
        if (!hint) return;
        if (this.rangeStart !== null) {
            hint.textContent = `Start date selected (${this.formatDateReadable(this.rangeStart)}) — now click an end date`;
        } else if (this.selectedDates.size > 0) {
            const n = this.selectedDates.size;
            hint.textContent = `${n} night${n !== 1 ? 's' : ''} selected`;
        } else {
            hint.textContent = 'Click a start date, then click an end date';
        }
    }

    // ── Calendar rendering ────────────────────────────────────

    renderCalendar() {
        const year  = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        const monthNames = ['January','February','March','April','May','June',
                            'July','August','September','October','November','December'];
        document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;

        const firstDay    = new Date(year, month, 1);
        const lastDay     = new Date(year, month + 1, 0);
        const prevLastDay = new Date(year, month, 0);
        const startDay    = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

        const grid = document.getElementById('calendarGrid');
        grid.innerHTML = '';

        ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach(day => {
            const h = document.createElement('div');
            h.className = 'calendar-day-header';
            h.textContent = day;
            grid.appendChild(h);
        });

        for (let i = startDay - 1; i >= 0; i--) {
            grid.appendChild(this.createDayElement(prevLastDay.getDate() - i, true, year, month - 1));
        }

        for (let day = 1; day <= lastDay.getDate(); day++) {
            grid.appendChild(this.createDayElement(day, false, year, month));
        }

        const remaining = 42 - grid.children.length + 7;
        for (let day = 1; day <= remaining; day++) {
            grid.appendChild(this.createDayElement(day, true, year, month + 1));
        }

        this.updateRangeHint();
    }

    createDayElement(day, otherMonth, year, month) {
        const div     = document.createElement('div');
        div.className = 'calendar-day';

        const dateStr = this.formatDate(new Date(year, month, day));
        const today   = this.formatDate(new Date());

        if (otherMonth) div.classList.add('other-month');

        if (dateStr < today && !otherMonth) div.classList.add('disabled');

        const bookedBy = this.isDateBooked(dateStr);
        if (bookedBy) {
            div.classList.add('booked');
            div.setAttribute('data-booker', bookedBy);
            div.classList.add(this.getPersonClass(bookedBy));
        }

        if (this.rangeStart === dateStr) {
            div.classList.add('range-start');
        } else if (this.selectedDates.has(dateStr)) {
            div.classList.add('selected');
        }

        const dayNum = document.createElement('span');
        dayNum.className = 'day-number';
        dayNum.textContent = day;
        div.appendChild(dayNum);

        if (!otherMonth && dateStr >= today && !bookedBy) {
            div.addEventListener('click', () => this.handleDateClick(dateStr));
        }

        return div;
    }

    updateSubmitButton() {
        document.getElementById('submitBtn').disabled =
            !(this.selectedPerson && this.selectedDates.size > 0 && this.rangeStart === null);
    }

    isDateBooked(dateStr) {
        for (const booking of this.bookings) {
            if (booking.dates.includes(dateStr)) return booking.person;
        }
        return null;
    }

    findConflicts() {
        return Array.from(this.selectedDates)
            .map(d => ({ date: d, person: this.isDateBooked(d) }))
            .filter(c => c.person);
    }

    findNextAvailableDates(count) {
        const available = [];
        let check = new Date();
        while (available.length < count) {
            const d = this.formatDate(check);
            if (!this.isDateBooked(d)) available.push(d);
            check.setDate(check.getDate() + 1);
        }
        return available;
    }

    // ── Confirmation modal ────────────────────────────────────

    openConfirmModal() {
        const dates  = Array.from(this.selectedDates).sort();
        const n      = dates.length;
        const person = this.selectedPerson;

        document.getElementById('modalPerson').textContent = person;
        document.getElementById('modalNights').textContent =
            `${n} night${n !== 1 ? 's' : ''}`;
        document.getElementById('modalDates').innerHTML =
            dates.map(d => this.formatDateReadable(d)).join('<br>');

        document.getElementById('confirmModal').classList.add('show');
    }

    closeConfirmModal() {
        document.getElementById('confirmModal').classList.remove('show');
    }

    // ── Booking save ──────────────────────────────────────────

    async submitBooking() {
        this.closeConfirmModal();

        const conflicts = this.findConflicts();
        if (conflicts.length > 0) {
            const conflictDates  = conflicts.map(c => `${this.formatDateReadable(c.date)} (${c.person})`).join(', ');
            const nextAvailable  = this.findNextAvailableDates(this.selectedDates.size);
            const suggestions    = nextAvailable.map(d => this.formatDateReadable(d)).join(', ');
            this.showMessage(
                `Booking conflict detected! The following date(s) are already reserved: ${conflictDates}.\n\nSuggested available dates: ${suggestions}`,
                'error'
            );
            return;
        }

        try {
            const booking = {
                person: this.selectedPerson,
                dates: Array.from(this.selectedDates).sort(),
                createdAt: new Date().toISOString()
            };

            await addDoc(collection(this.db, 'bookings'), booking);

            const datesReadable = booking.dates.map(d => this.formatDateReadable(d)).join(', ');
            this.showMessage(`Reservation confirmed for ${booking.person} on ${datesReadable}`, 'success');

            this.selectedDates.clear();
            this.rangeStart = null;
            document.querySelectorAll('.person-btn').forEach(b => b.classList.remove('active'));
            this.selectedPerson = null;
            this.updateSubmitButton();
            this.renderCalendar();
        } catch (error) {
            console.error('Error adding booking:', error);
            this.showMessage('Error saving reservation. Please try again.', 'error');
        }
    }

    async deleteBooking(id) {
        if (confirm('Are you sure you want to delete this reservation?')) {
            try {
                await deleteDoc(doc(this.db, 'bookings', id));
                this.showMessage('Reservation deleted successfully', 'success');
            } catch (error) {
                console.error('Error deleting booking:', error);
                this.showMessage('Error deleting reservation. Please try again.', 'error');
            }
        }
    }

    // ── Bookings list ─────────────────────────────────────────

    renderBookings() {
        const container = document.getElementById('currentBookingsList');
        const today = this.formatDate(new Date());

        const current = this.bookings
            .filter(b => b.dates[b.dates.length - 1] >= today)
            .sort((a, b) => a.dates[0].localeCompare(b.dates[0]));

        if (current.length === 0) {
            container.innerHTML = '<p style="color:#95a5a6;font-style:italic;">No current reservations</p>';
            return;
        }

        container.innerHTML = current.map(booking => {
            const personClass = this.getPersonClass(booking.person);
            const colorClass  = this.getPersonColorClass(booking.person);
            return `
                <div class="booking-item current ${personClass}">
                    <div class="booking-info">
                        <div class="booking-person ${colorClass}">The Studio — ${booking.person}</div>
                        <div class="booking-dates">
                            ${booking.dates.map(d => this.formatDateReadable(d)).join(', ')}
                        </div>
                    </div>
                    <div class="booking-actions">
                        <button class="delete-btn" onclick="window.appInstance.deleteBooking('${booking.id}')">Cancel</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ── Helpers ───────────────────────────────────────────────

    showMessage(text, type) {
        const msg = document.getElementById('message');
        msg.textContent = text;
        msg.className = `message ${type} show`;
        setTimeout(() => msg.classList.remove('show'), 5000);
    }

    formatDate(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    formatDateReadable(dateStr) {
        const [y, m, d] = dateStr.split('-');
        return `${d}-${m}-${y}`;
    }

    getPersonClass(person) {
        if (person === 'Louis')            return 'person-louis';
        if (person === 'Victor')           return 'person-victor';
        if (person === 'Chantal & Reinout') return 'person-chantal-reinout';
        return '';
    }

    getPersonColorClass(person) {
        if (person === 'Louis')            return 'color-louis';
        if (person === 'Victor')           return 'color-victor';
        if (person === 'Chantal & Reinout') return 'color-chantal-reinout';
        return '';
    }
}

const app = new StudioBooking();
window.appInstance = app;
window.app = app;
