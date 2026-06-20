import React, { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  Calendar, 
  DollarSign, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Send, 
  X, 
  Trash2, 
  RefreshCw, 
  Plus, 
  BookOpen, 
  Users, 
  Check,
  Search,
  Sun,
  Download
} from 'lucide-react';

// Seed initial data for a 40-seat library
const generateInitialSeats = () => {
  const seats = [];
  
  // Custom seed data to make the dashboard feel alive on first load
  const seedData = {
    1: {
      morning: { name: 'Rahul Dev', phone: '9876543210', startDate: '2026-05-20', dueDate: '2026-06-18', fee: 600, status: 'overdue' },
      evening: { name: 'Priya Sharma', phone: '9988776655', startDate: '2026-05-22', dueDate: '2026-06-22', fee: 600, status: 'paid' }
    },
    2: {
      morning: { name: 'Amit Singh', phone: '8877665544', startDate: '2026-05-23', dueDate: '2026-06-22', fee: 600, status: 'due' }
    },
    3: {
      fullday: { name: 'Vikram Rathore', phone: '7766554433', startDate: '2026-05-15', dueDate: '2026-06-15', fee: 1000, status: 'overdue' }
    },
    5: {
      evening: { name: 'Sneha Patel', phone: '6655443322', startDate: '2026-06-01', dueDate: '2026-07-01', fee: 600, status: 'paid' }
    },
    8: {
      morning: { name: 'Kabir Khan', phone: '9543210987', startDate: '2026-06-05', dueDate: '2026-07-05', fee: 600, status: 'paid' },
      evening: { name: 'Pooja Rao', phone: '9432109876', startDate: '2026-05-21', dueDate: '2026-06-21', fee: 600, status: 'due' }
    },
    12: {
      fullday: { name: 'Ananya Sen', phone: '9123456789', startDate: '2026-06-10', dueDate: '2026-07-10', fee: 1000, status: 'paid' }
    }
  };

  for (let i = 1; i <= 40; i++) {
    seats.push({
      id: i,
      label: `Seat ${i}`,
      morning: seedData[i]?.morning || null,
      evening: seedData[i]?.evening || null,
      fullday: seedData[i]?.fullday || null
    });
  }
  return seats;
};

// Help helper to evaluate real-time system clock to active shift
const getRealTimeShift = () => {
  const hour = new Date().getHours();
  if (hour >= 8 && hour < 14) return 'morning'; // 8 AM to 2 PM
  if (hour >= 14 && hour < 20) return 'evening'; // 2 PM to 8 PM
  return 'closed';
};

// Helper to format date strings (YYYY-MM-DD) to "DD Month YYYY" (e.g. 18 May 2026)
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[monthIdx]} ${year}`;
};

// Helper to dynamically calculate booking status
const getBookingStatus = (booking) => {
  if (!booking) return 'avail';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(booking.dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) {
    return 'overdue';
  } else if (diffDays <= 3) {
    return 'due';
  }
  return 'paid';
};

function App() {
  const [seats, setSeats] = useState(() => {
    const saved = localStorage.getItem('library_seats');
    return saved ? JSON.parse(saved) : generateInitialSeats();
  });

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };
  
  // Active view toggle on the map (Morning / Evening / Full Day)
  const [viewShift, setViewShift] = useState('morning');
  
  // Real-time active shift for name highlighting/fading
  const [currentActiveShift, setCurrentActiveShift] = useState('morning');
  const [useRealTime, setUseRealTime] = useState(false);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeat, setSelectedSeat] = useState(null);
  
  // Form states for booking
  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    startDate: new Date().toISOString().split('T')[0],
    shiftType: 'morning', // morning, evening, fullday
    fee: 600
  });

  // Set booking form defaults when seat selection changes
  useEffect(() => {
    if (selectedSeat) {
      // Determine the first available shift type
      let defaultShift = 'morning';
      if (selectedSeat.fullday) {
        defaultShift = ''; // no available shifts
      } else if (!selectedSeat.morning) {
        defaultShift = 'morning';
      } else if (!selectedSeat.evening) {
        defaultShift = 'evening';
      }

      setBookingForm({
        name: '',
        phone: '',
        startDate: new Date().toISOString().split('T')[0],
        shiftType: defaultShift,
        fee: defaultShift === 'fullday' ? 1000 : 600
      });
    }
  }, [selectedSeat]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('library_seats', JSON.stringify(seats));
  }, [seats]);

  // Track dynamic real-time shift updates
  useEffect(() => {
    if (useRealTime) {
      const updateShift = () => {
        const shift = getRealTimeShift();
        setCurrentActiveShift(shift === 'closed' ? 'morning' : shift);
      };
      updateShift();
      const interval = setInterval(updateShift, 60000); // check every minute
      return () => clearInterval(interval);
    }
  }, [useRealTime]);

  // Note: Booking statuses are calculated dynamically in real-time

  // Set default fee on shift type change
  const handleShiftTypeChange = (e) => {
    const shift = e.target.value;
    setBookingForm(prev => ({
      ...prev,
      shiftType: shift,
      fee: shift === 'fullday' ? 1000 : 600
    }));
  };

  // Assign Student to Seat
  const handleBookSeat = (e) => {
    e.preventDefault();
    if (!bookingForm.name || !bookingForm.phone) return;

    // Calculate due date (30 days from start date)
    const startDate = new Date(bookingForm.startDate);
    const dueDateObj = new Date(startDate);
    dueDateObj.setDate(startDate.getDate() + 30);
    const dueDate = dueDateObj.toISOString().split('T')[0];

    const newBooking = {
      name: bookingForm.name,
      phone: bookingForm.phone,
      startDate: bookingForm.startDate,
      dueDate,
      fee: Number(bookingForm.fee),
      status: 'paid'
    };

    setSeats(prevSeats => 
      prevSeats.map(seat => {
        if (seat.id === selectedSeat.id) {
          const updated = { ...seat };
          if (bookingForm.shiftType === 'fullday') {
            updated.fullday = newBooking;
            updated.morning = null;
            updated.evening = null;
          } else if (bookingForm.shiftType === 'morning') {
            updated.morning = newBooking;
            updated.fullday = null;
          } else if (bookingForm.shiftType === 'evening') {
            updated.evening = newBooking;
            updated.fullday = null;
          }
          return updated;
        }
        return seat;
      })
    );

    // Reset Form & Close Modal
    setBookingForm({
      name: '',
      phone: '',
      startDate: new Date().toISOString().split('T')[0],
      shiftType: 'morning',
      fee: 600
    });
    setSelectedSeat(null);
  };

  // Renew Fee Booking
  const handleRenewBooking = (shiftKey) => {
    setSeats(prevSeats => 
      prevSeats.map(seat => {
        if (seat.id === selectedSeat.id) {
          const updated = { ...seat };
          const booking = updated[shiftKey];
          if (booking) {
            const currentDueDate = new Date(booking.dueDate);
            const newDueDateObj = new Date(currentDueDate);
            newDueDateObj.setDate(currentDueDate.getDate() + 30);
            const newDueDate = newDueDateObj.toISOString().split('T')[0];
            
            updated[shiftKey] = {
              ...booking,
              dueDate: newDueDate,
              status: 'paid'
            };
          }
          return updated;
        }
        return seat;
      })
    );
    setSelectedSeat(null);
  };

  // Remove / Release Booking
  const handleReleaseBooking = (shiftKey) => {
    setSeats(prevSeats => 
      prevSeats.map(seat => {
        if (seat.id === selectedSeat.id) {
          const updated = { ...seat };
          updated[shiftKey] = null;
          return updated;
        }
        return seat;
      })
    );
    setSelectedSeat(null);
  };

  // Add a new seat to the grid
  const handleAddSeat = () => {
    setSeats(prevSeats => {
      const maxId = prevSeats.reduce((max, seat) => Math.max(max, seat.id), 0);
      const newId = maxId + 1;
      const newSeat = {
        id: newId,
        label: `Seat ${newId}`,
        morning: null,
        evening: null,
        fullday: null
      };
      return [...prevSeats, newSeat];
    });
  };

  // Delete a seat from the grid
  const handleDeleteSeat = (seatId) => {
    const seat = seats.find(s => s.id === seatId);
    if (seat && (seat.morning || seat.evening || seat.fullday)) {
      if (!window.confirm(`Seat ${seatId} has active bookings. Are you sure you want to delete this seat?`)) {
        return;
      }
    }
    setSeats(prevSeats => prevSeats.filter(s => s.id !== seatId));
    setSelectedSeat(null);
  };

  // Calculate alerts lists (due soon & overdue)
  const getAlerts = () => {
    const alerts = [];
    seats.forEach(seat => {
      ['morning', 'evening', 'fullday'].forEach(shift => {
        const booking = seat[shift];
        if (booking) {
          const status = getBookingStatus(booking);
          if (status === 'due' || status === 'overdue') {
            alerts.push({
              seatId: seat.id,
              seatLabel: seat.label,
              shift,
              ...booking,
              status
            });
          }
        }
      });
    });
    // Sort overdue first
    return alerts.sort((a, b) => {
      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
      if (a.status !== 'overdue' && b.status === 'overdue') return 1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  };

  const alerts = getAlerts();

  // Statistics summaries
  const getStats = () => {
    let totalSeats = seats.length;
    let occupiedMorning = 0;
    let occupiedEvening = 0;
    let occupiedFullDay = 0;
    let overdueCount = 0;
    let dueSoonCount = 0;

    seats.forEach(seat => {
      if (seat.fullday) {
        occupiedFullDay++;
        const status = getBookingStatus(seat.fullday);
        if (status === 'overdue') overdueCount++;
        else if (status === 'due') dueSoonCount++;
      } else {
        if (seat.morning) {
          occupiedMorning++;
          const status = getBookingStatus(seat.morning);
          if (status === 'overdue') overdueCount++;
          else if (status === 'due') dueSoonCount++;
        }
        if (seat.evening) {
          occupiedEvening++;
          const status = getBookingStatus(seat.evening);
          if (status === 'overdue') overdueCount++;
          else if (status === 'due') dueSoonCount++;
        }
      }
    });

    const activeSeatsThisShift = viewShift === 'morning' 
      ? seats.filter(s => s.morning || s.fullday).length
      : viewShift === 'evening'
      ? seats.filter(s => s.evening || s.fullday).length
      : viewShift === 'all'
      ? seats.filter(s => s.morning || s.evening || s.fullday).length
      : seats.filter(s => s.fullday).length;

    return {
      activeSeatsThisShift,
      totalOccupied: occupiedMorning + occupiedEvening + occupiedFullDay,
      occupiedMorning,
      occupiedEvening,
      occupiedFullDay,
      overdueCount,
      dueSoonCount,
      freeSeats: totalSeats - activeSeatsThisShift
    };
  };

  const stats = getStats();

  // Launch WhatsApp pre-filled text
  const triggerWhatsApp = (alert) => {
    const text = `Hi ${alert.name}, your fee for Seat ${alert.seatId} (${alert.shift.toUpperCase()} Shift) is due on ${alert.dueDate}. Total due: ₹${alert.fee}. Kindly settle it to extend your subscription. Thank you!`;
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/91${alert.phone}?text=${encoded}`;
    window.open(url, '_blank');
  };

  // Search Filtered seats list
  const filteredSeats = seats.filter(seat => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    const morningMatch = seat.morning?.name.toLowerCase().includes(query) || seat.morning?.phone.includes(query);
    const eveningMatch = seat.evening?.name.toLowerCase().includes(query) || seat.evening?.phone.includes(query);
    const fulldayMatch = seat.fullday?.name.toLowerCase().includes(query) || seat.fullday?.phone.includes(query);
    const seatMatch = seat.label.toLowerCase().includes(query);
    
    return morningMatch || eveningMatch || fulldayMatch || seatMatch;
  });

  return (
    <div id="root">
      {/* Dashboard Top Header */}
      <header className="dashboard-header glass-panel">
        <div className="brand-section">
          <h1>SmartLibrary Manager</h1>
          <p>Visual Seat Grid & Fee Reconciliation Engine</p>
        </div>
        
        <div className="control-hub">
          {/* Active Shift Simulator */}
          <div className="sim-controls">
            <span className="sim-label">Active Shift (Highlighting):</span>
            <select 
              value={useRealTime ? 'realtime' : currentActiveShift} 
              onChange={(e) => {
                if (e.target.value === 'realtime') {
                  setUseRealTime(true);
                  const shift = getRealTimeShift();
                  setCurrentActiveShift(shift === 'closed' ? 'morning' : shift);
                } else {
                  setUseRealTime(false);
                  setCurrentActiveShift(e.target.value);
                }
              }}
              className="sim-select"
            >
              <option value="morning">Morning Shift (8AM - 2PM)</option>
              <option value="evening">Evening Shift (2PM - 8PM)</option>
              <option value="realtime">🔌 Real Time Clock</option>
            </select>
          </div>

          {isInstallable && (
            <button 
              onClick={handleInstallApp}
              className="btn-install-app"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              <Download size={14} />
              Install App
            </button>
          )}

          {/* Map View Toggle */}
          <div className="toggle-group">
            <button 
              className={`toggle-btn ${viewShift === 'all' ? 'active' : ''}`}
              onClick={() => setViewShift('all')}
            >
              All Seats
            </button>
            <button 
              className={`toggle-btn ${viewShift === 'morning' ? 'active' : ''}`}
              onClick={() => setViewShift('morning')}
            >
              Morning View
            </button>
            <button 
              className={`toggle-btn ${viewShift === 'evening' ? 'active' : ''}`}
              onClick={() => setViewShift('evening')}
            >
              Evening View
            </button>
            <button 
              className={`toggle-btn ${viewShift === 'fullday' ? 'active' : ''}`}
              onClick={() => setViewShift('fullday')}
            >
              Full-Day View
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="dashboard-grid">
        {/* Left Side: Seat Map */}
        <main className="map-section glass-panel">
          <div className="map-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div>
                <h2 className="map-title">Cabin A Grid</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Showing statuses for <strong>{viewShift.toUpperCase()}</strong> view
                </p>
              </div>
              <button 
                onClick={handleAddSeat}
                style={{
                  background: 'var(--accent)',
                  border: 'none',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 0 10px var(--accent-glow)',
                  transition: 'opacity 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              >
                <Plus size={14} />
                Add Seat
              </button>
            </div>
            
            {/* Search Desk bar */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search name, phone, seat..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  background: 'rgba(0,0,0,0.2)', 
                  border: '1px solid var(--border)', 
                  color: 'var(--text-primary)', 
                  padding: '8px 12px 8px 32px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  outline: 'none',
                  width: '220px'
                }}
              />
            </div>
          </div>

          {/* Grid Layout */}
          <div className="seats-grid">
            {filteredSeats.map(seat => {
              // Determine status relative to toggled map view (morning / evening / fullday)
              let statusClass = 'available';
              let activeBooking = null;

              if (viewShift === 'morning') {
                if (seat.fullday) {
                  activeBooking = seat.fullday;
                  statusClass = `fullday ${getBookingStatus(seat.fullday)}`;
                } else if (seat.morning) {
                  activeBooking = seat.morning;
                  statusClass = getBookingStatus(seat.morning);
                }
              } else if (viewShift === 'evening') {
                if (seat.fullday) {
                  activeBooking = seat.fullday;
                  statusClass = `fullday ${getBookingStatus(seat.fullday)}`;
                } else if (seat.evening) {
                  activeBooking = seat.evening;
                  statusClass = getBookingStatus(seat.evening);
                }
              } else if (viewShift === 'fullday') {
                if (seat.fullday) {
                  activeBooking = seat.fullday;
                  statusClass = `fullday ${getBookingStatus(seat.fullday)}`;
                }
              } else if (viewShift === 'all') {
                if (seat.fullday) {
                  activeBooking = seat.fullday;
                  statusClass = `fullday ${getBookingStatus(seat.fullday)}`;
                } else if (seat.morning || seat.evening) {
                  const morningStatus = getBookingStatus(seat.morning);
                  const eveningStatus = getBookingStatus(seat.evening);
                  
                  if (morningStatus === 'overdue' || eveningStatus === 'overdue') {
                    statusClass = 'overdue';
                    activeBooking = morningStatus === 'overdue' ? seat.morning : seat.evening;
                  } else if (morningStatus === 'due' || eveningStatus === 'due') {
                    statusClass = 'due';
                    activeBooking = morningStatus === 'due' ? seat.morning : seat.evening;
                  } else {
                    statusClass = 'paid';
                    activeBooking = seat.morning || seat.evening;
                  }
                }
              }

              return (
                <div 
                  key={seat.id} 
                  className={`seat-card ${statusClass}`}
                  onClick={() => setSelectedSeat(seat)}
                >
                  <div className="seat-number">
                    <span>{seat.id}</span>
                    <span className={`seat-indicator indicator-${activeBooking ? getBookingStatus(activeBooking) : 'avail'}`}>
                      {seat.fullday ? 'Full' : activeBooking ? getBookingStatus(activeBooking) : 'Free'}
                    </span>
                  </div>

                  {/* Seat Occupancy Names */}
                  <div className="seat-users-container">
                    {seat.fullday && (
                      <div className="seat-user active-shift-user" title={`Full-day: ${seat.fullday.name}`}>
                        <span className="shift-tag fullday">FD</span>
                        {seat.fullday.name}
                      </div>
                    )}
                    
                    {!seat.fullday && seat.morning && (
                      <div 
                        className={`seat-user ${(viewShift === 'all' || viewShift === 'morning') ? 'active-shift-user' : 'faded-shift-user'}`}
                        title={`Morning student: ${seat.morning.name}`}
                      >
                        <span className="shift-tag morning">M</span>
                        {seat.morning.name}
                      </div>
                    )}

                    {!seat.fullday && seat.evening && (
                      <div 
                        className={`seat-user ${(viewShift === 'all' || viewShift === 'evening') ? 'active-shift-user' : 'faded-shift-user'}`}
                        title={`Evening student: ${seat.evening.name}`}
                      >
                        <span className="shift-tag evening">E</span>
                        {seat.evening.name}
                      </div>
                    )}

                    {!seat.fullday && !seat.morning && !seat.evening && (
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Empty Desk
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* Right Side: Ledger Sidebar panel */}
        <aside className="ledger-panel glass-panel">
          <div className="ledger-header">
            <h2>
              <BookOpen size={20} style={{ color: 'var(--accent)' }} />
              Fee Ledger Hub
            </h2>
          </div>

          {/* Quick Metrics */}
          <div className="stat-row">
            <div className="stat-card">
              <div className="stat-label">Overdue Payments</div>
              <div className="stat-value" style={{ color: 'var(--status-overdue)' }}>
                {stats.overdueCount}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Due in 3 Days</div>
              <div className="stat-value" style={{ color: 'var(--status-due)' }}>
                {stats.dueSoonCount}
              </div>
            </div>
          </div>

          <div className="stat-row" style={{ marginTop: '-8px' }}>
            <div className="stat-card">
              <div className="stat-label">Total Subscribed</div>
              <div className="stat-value" style={{ color: 'var(--accent)' }}>
                {stats.totalOccupied}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">
                Vacant Desks ({
                  viewShift === 'morning' ? 'Morning' : 
                  viewShift === 'evening' ? 'Evening' : 
                  viewShift === 'fullday' ? 'Full Day' : 
                  'All Shifts'
                })
              </div>
              <div className="stat-value" style={{ color: '#fff' }}>
                {stats.freeSeats}
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px solid var(--border)', margin: '4px 0' }} />

          {/* Alerts Notifications List */}
          <div className="alerts-section">
            <h3>⚠️ Attention Required ({alerts.length})</h3>
            <div className="alerts-list">
              {alerts.length === 0 ? (
                <div className="empty-state">
                  <CheckCircle2 size={32} style={{ color: 'var(--status-paid)', marginBottom: '8px' }} />
                  <p>All clean! No due or overdue fees.</p>
                </div>
              ) : (
                alerts.map((alert, index) => (
                  <div key={index} className="alert-card">
                    <div className="alert-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h4>{alert.name}</h4>
                        <span className={`badge badge-${alert.status}`}>
                          {alert.status.toUpperCase()}
                        </span>
                      </div>
                      <p>
                        Seat {alert.seatId} ({alert.shift === 'fullday' ? 'Full Day' : alert.shift === 'morning' ? 'Morning' : 'Evening'})
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                        Expired on: {formatDate(alert.dueDate)}
                      </p>
                    </div>
                    <button 
                      className="btn-whatsapp"
                      onClick={() => triggerWhatsApp(alert)}
                      title="Send WhatsApp Reminder"
                    >
                      <Send size={12} />
                      Remind
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Book & Edit Seat Modal */}
      {selectedSeat && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2>Manage Seat {selectedSeat.id}</h2>
                <button 
                  onClick={() => handleDeleteSeat(selectedSeat.id)}
                  title="Delete Seat"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: '500'
                  }}
                >
                  <Trash2 size={12} />
                  Delete Seat
                </button>
              </div>
              <button className="modal-close" onClick={() => setSelectedSeat(null)}>
                <X size={20} />
              </button>
            </div>

            {/* Current Bookings Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {['morning', 'evening', 'fullday'].map(shiftKey => {
                const booking = selectedSeat[shiftKey];
                if (!booking) return null;

                return (
                  <div 
                    key={shiftKey} 
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.02)', 
                      border: '1.5px solid var(--border)', 
                      borderRadius: '12px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={`shift-tag ${shiftKey}`} style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '4px' }}>
                        {shiftKey.toUpperCase()} SHIFT
                      </span>
                      <span className={`badge badge-${getBookingStatus(booking)}`}>
                        {getBookingStatus(booking).toUpperCase()}
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px', margin: '4px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontWeight: '600' }}>
                        <User size={14} style={{ color: 'var(--accent)' }} />
                        {booking.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Phone size={14} />
                        {booking.phone}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={14} />
                        Due: {formatDate(booking.dueDate)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <DollarSign size={14} />
                        Fee: ₹{booking.fee}/mo
                      </div>
                    </div>

                    {/* Booking Control Buttons */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => handleRenewBooking(shiftKey)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <RefreshCw size={12} />
                        Renew 30 Days
                      </button>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => handleReleaseBooking(shiftKey)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '6px' }}
                      >
                        <Trash2 size={12} />
                        Release
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Show allocation options if not fully booked */}
              {(!selectedSeat.fullday && (!selectedSeat.morning || !selectedSeat.evening)) && (
                <form onSubmit={handleBookSeat} style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <h3 style={{ fontSize: '14px', marginBottom: '12px', fontWeight: '600' }}>
                    Allocate New Shift Booking
                  </h3>
                  
                  <div className="form-group">
                    <label>Student Full Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Ramesh Kumar"
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, name: e.target.value }))}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>WhatsApp / Phone Number</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      placeholder="e.g. 9876543210 (10 digits)"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                      required 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label>Shift Selection</label>
                      <select 
                        className="form-input"
                        value={bookingForm.shiftType}
                        onChange={handleShiftTypeChange}
                      >
                        {/* Only offer morning if morning is free and fullday is free */}
                        {!selectedSeat.morning && !selectedSeat.fullday && (
                          <option value="morning">Morning (6 Hrs)</option>
                        )}
                        {/* Only offer evening if evening is free and fullday is free */}
                        {!selectedSeat.evening && !selectedSeat.fullday && (
                          <option value="evening">Evening (6 Hrs)</option>
                        )}
                        {/* Only offer fullday if BOTH morning and evening are free */}
                        {!selectedSeat.morning && !selectedSeat.evening && !selectedSeat.fullday && (
                          <option value="fullday">Full Day (12 Hrs)</option>
                        )}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Monthly Fee Amount</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={bookingForm.fee}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, fee: Number(e.target.value) }))}
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Subscription Start Date</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={bookingForm.startDate}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, startDate: e.target.value }))}
                      required 
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                    Confirm Allocation
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
