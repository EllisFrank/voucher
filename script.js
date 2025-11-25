// Data storage for bookings, events, and packages
let bookings = JSON.parse(localStorage.getItem('swanzyBookings')) || [];
let events = JSON.parse(localStorage.getItem('swanzyEvents')) || [
    {
        id: 'evt1',
        title: 'FIFA Tournament 2024',
        date: '2024-03-15',
        price: 50,
        description: 'Compete in our annual FIFA gaming tournament with amazing prizes!',
        type: 'gaming',
        packageId: 'pkg1'
    },
    {
        id: 'evt2',
        title: 'Champions League Final Viewing',
        date: '2024-05-28',
        price: 30,
        description: 'Watch the Champions League final on our big screens with fellow fans!',
        type: 'football',
        packageId: 'pkg4'
    }
];

let packages = JSON.parse(localStorage.getItem('swanzyPackages')) || [
    {
        id: 'pkg1',
        name: 'Standard Gaming',
        price: 50,
        type: 'gaming',
        features: ['2 hours gaming', 'Free drink', 'Comfortable seating']
    },
    {
        id: 'pkg2',
        name: 'Premium Gaming',
        price: 80,
        type: 'gaming',
        features: ['4 hours gaming', 'Free meal', 'VIP seating', 'Priority access']
    },
    {
        id: 'pkg3',
        name: 'VIP Experience',
        price: 120,
        type: 'gaming',
        features: ['6 hours gaming', 'Premium meal', 'VIP lounge access', 'Personal assistant']
    },
    {
        id: 'pkg4',
        name: 'Standard Football Ticket',
        price: 30,
        type: 'football',
        features: ['Standard seating', 'Match program']
    },
    {
        id: 'pkg5',
        name: 'Premium Football Ticket',
        price: 60,
        type: 'football',
        features: ['Premium seating', 'Match program', 'Free drink']
    },
    {
        id: 'pkg6',
        name: 'VIP Football Experience',
        price: 100,
        type: 'football',
        features: ['VIP seating', 'Match program', 'Free meal', 'Meet & greet with players']
    },
    {
        id: 'pkg7',
        name: 'Standard Event Ticket',
        price: 40,
        type: 'Events',
        features: ['General admission', 'Event program']
    },
    {
        id: 'pkg8',
        name: 'Premium Event Ticket',
        price: 75,
        type: 'Events',
        features: ['VIP admission', 'Event program', 'Free drink']
    },
    {
        id: 'pkg9',
        name: 'VIP Event Experience',
        price: 150,
        type: 'Events',
        features: ['VIP admission', 'Event program', 'Free meal', 'Meet & greet']
    }
];

let currentBookingId = null;
let currentEditingEventId = null;
let currentEditingPackageId = null;

// Save initial data to localStorage
if (!localStorage.getItem('swanzyEvents')) {
    localStorage.setItem('swanzyEvents', JSON.stringify(events));
}

if (!localStorage.getItem('swanzyPackages')) {
    localStorage.setItem('swanzyPackages', JSON.stringify(packages));
}

// Fixed transition code - guaranteed to work
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded - starting 15 second timer');
    
    const introScreen = document.getElementById('intro-screen');
    const mainContent = document.getElementById('main-content');
    
    // Start the transition after 15 seconds
    setTimeout(function() {
        console.log('15 seconds elapsed - transitioning to main content');
        
        // Fade out intro screen
        introScreen.style.opacity = '0';
        
        setTimeout(function() {
            // Hide intro screen completely
            introScreen.style.visibility = 'hidden';
            
            // Show main content
            mainContent.style.display = 'block';
            
            // Fade in main content
            setTimeout(function() {
                mainContent.style.opacity = '1';
                
                // Initialize the main application
                initializeApp();
            }, 50);
        }, 800); // Wait for fade out to complete
    }, 15000); // 15 seconds in milliseconds
});

// Initialize the main application
function initializeApp() {
    console.log('Initializing application...');
    
    // Set up navigation
    setupNavigation();
    
    // Set up booking form
    setupBookingForm();
    
    // Set up payment modal
    setupPaymentModal();
    
    // Set up admin page
    setupAdminPage();
    
    // Set up receipt modal
    setupReceiptModal();
    
    // Set up events page
    setupEventsPage();
    
    // Set up add event modal
    setupAddEventModal();
    
    // Set up add package modal
    setupAddPackageModal();
    
    // Set up payment receipt modal
    setupPaymentReceiptModal();
    
    // Load packages for booking form
    loadPackagesForBooking();

    // Load saved system settings (API keys, endpoints)
    loadSettings();
    
    // Update admin dashboard if already logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        document.getElementById('admin-login').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
        updateAdminDashboard();
    }
    
    console.log('Application initialized successfully');
}

// Set up navigation
function setupNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            navTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            const pageId = `${tab.dataset.page}-page`;
            document.getElementById(pageId).classList.add('active');
            
            if (tab.dataset.page === 'admin') {
                document.getElementById('admin-login').style.display = 'block';
                document.getElementById('admin-dashboard').style.display = 'none';
                document.getElementById('admin-password').value = '';
            } else if (tab.dataset.page === 'my-tickets') {
                // Clear the tickets list when switching to My Tickets
                document.getElementById('tickets-list').innerHTML = '<p>Enter your Booking ID to find and download your ticket.</p>';
                document.getElementById('booking-id-lookup').value = '';
            } else if (tab.dataset.page === 'events') {
                loadEvents();
            } else if (tab.dataset.page === 'booking') {
                loadPackagesForBooking();
            }
        });
    });
    
    // Set up event type selection
    const eventTypeBtns = document.querySelectorAll('.event-type-btn');
    
    eventTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            eventTypeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const eventType = btn.dataset.type;
            
            document.getElementById('gaming-content').style.display = 
                eventType === 'gaming' ? 'block' : 'none';
            document.getElementById('football-content').style.display = 
                eventType === 'football' ? 'block' : 'none';
            document.getElementById('events-content').style.display = 
                eventType === 'Events' ? 'block' : 'none';
            
            // Update packages based on event type
            loadPackagesForBooking(eventType);
        });
    });
}

// Load packages for booking form
function loadPackagesForBooking(eventType = 'gaming') {
    const packageSelect = document.getElementById('package');
    packageSelect.innerHTML = '';
    
    const filteredPackages = packages.filter(pkg => pkg.type === eventType);
    
    if (filteredPackages.length === 0) {
        packageSelect.innerHTML = '<option value="">No packages available</option>';
        document.getElementById('total-price').textContent = '₵0';
        return;
    }
    
    filteredPackages.forEach(pkg => {
        const option = document.createElement('option');
        option.value = pkg.id;
        option.textContent = `${pkg.name} - ₵${pkg.price}`;
        packageSelect.appendChild(option);
    });
    
    // Update price
    updatePrice();
}

// Set up booking form
function setupBookingForm() {
    const packageSelect = document.getElementById('package');
    const quantityInput = document.getElementById('quantity');
    
    // Update price function
    window.updatePrice = () => {
        const selectedPackageId = packageSelect.value;
        const selectedPackage = packages.find(pkg => pkg.id === selectedPackageId);
        
        if (selectedPackage) {
            const price = selectedPackage.price;
            const quantity = parseInt(quantityInput.value) || 1;
            const total = price * quantity;
            document.getElementById('total-price').textContent = `₵${total}`;
        } else {
            document.getElementById('total-price').textContent = '₵0';
        }
    };
    
    packageSelect.addEventListener('change', updatePrice);
    quantityInput.addEventListener('input', updatePrice);
    
    // Set up pay button
    document.getElementById('pay-btn').addEventListener('click', function() {
        // Validate form
        const fullName = document.getElementById('fullName').value;
        const phone = document.getElementById('phone').value;
        const packageId = document.getElementById('package').value;
        
        if (!fullName || !phone || !packageId) {
            alert('Please fill in all required fields');
            return;
        }
        
        document.getElementById('payment-modal').classList.add('active');
    });
}

// Set up payment modal
function setupPaymentModal() {
    const closeModalBtn = document.getElementById('close-modal');
    const cancelPaymentBtn = document.getElementById('cancel-payment');
    const confirmPaymentBtn = document.getElementById('confirm-payment');
    const uploadBtn = document.getElementById('upload-btn');
    const screenshotInput = document.getElementById('screenshot');
    const paymentModal = document.getElementById('payment-modal');
    
    // Close payment modal
    const closeModal = () => {
        paymentModal.classList.remove('active');
        document.getElementById('screenshot-preview').innerHTML = '';
        document.getElementById('screenshot-error').style.display = 'none';
        document.getElementById('payment-success').style.display = 'none';
        document.getElementById('screenshot').value = '';
    };
    
    closeModalBtn.addEventListener('click', closeModal);
    cancelPaymentBtn.addEventListener('click', closeModal);
    
    // Upload screenshot
    uploadBtn.addEventListener('click', () => {
        screenshotInput.click();
    });
    
    screenshotInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.match('image.*')) {
                document.getElementById('screenshot-error').style.display = 'block';
                document.getElementById('screenshot-error').textContent = 'Please upload a valid image file';
                return;
            }
            
            document.getElementById('screenshot-error').style.display = 'none';
            
            const reader = new FileReader();
            reader.onload = (event) => {
                document.getElementById('screenshot-preview').innerHTML = `
                    <img src="${event.target.result}" style="max-width: 100%; border-radius: 8px;" alt="Receipt preview">
                `;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Confirm payment - FIXED
    confirmPaymentBtn.addEventListener('click', () => {
        const file = screenshotInput.files[0];
        if (!file) {
            document.getElementById('screenshot-error').style.display = 'block';
            document.getElementById('screenshot-error').textContent = 'Please upload a payment receipt';
            return;
        }
        
        // Create booking
        const bookingIds = createBooking(file);
        
        document.getElementById('payment-success').style.display = 'block';
        document.getElementById('booking-id-display').textContent = bookingIds.join(', ');
        
        // Disable button and change text
        confirmPaymentBtn.disabled = true;
        confirmPaymentBtn.textContent = 'SUBMITTED';
        
        // Close modal after 5 seconds
        setTimeout(() => {
            closeModal();
            
            // Reset form
            document.getElementById('booking-form').reset();
            document.getElementById('total-price').textContent = '₵0';
            
            // Reset button
            setTimeout(() => {
                confirmPaymentBtn.disabled = false;
                confirmPaymentBtn.textContent = 'I HAVE PAID';
            }, 3000);
        }, 5000);
    });
}

// Create a new booking - FIXED to create multiple bookings based on quantity
function createBooking(receiptFile) {
    const fullName = document.getElementById('fullName').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const packageId = document.getElementById('package').value;
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    const eventType = document.querySelector('.event-type-btn.active').dataset.type;
    
    // Get package details
    const selectedPackage = packages.find(pkg => pkg.id === packageId);
    const total = selectedPackage.price * quantity;
    
    // Convert receipt to base64
    const reader = new FileReader();
    const bookingIds = [];
    
    reader.onload = (event) => {
        const receiptDataUrl = event.target.result;
        
        // Create multiple bookings based on quantity
        for (let i = 0; i < quantity; i++) {
            // Generate unique booking ID for each ticket
            const bookingId = 'SW' + Date.now().toString().slice(-6) + '-' + (i + 1);
            bookingIds.push(bookingId);
            
            // Create booking object
            const booking = {
                id: bookingId,
                name: fullName,
                phone: phone,
                email: email,
                packageId: packageId,
                packageName: selectedPackage.name,
                eventType: eventType,
                quantity: 1, // Each booking is for 1 ticket
                total: selectedPackage.price, // Individual ticket price
                status: 'pending',
                date: new Date().toISOString(),
                receipt: receiptDataUrl
            };
            
            // Add to bookings array
            bookings.push(booking);
        }
        
        // Save to localStorage
        localStorage.setItem('swanzyBookings', JSON.stringify(bookings));
        
        // Update admin dashboard if visible
        if (document.getElementById('admin-dashboard').style.display !== 'none') {
            updateAdminDashboard();
        }
        
        console.log('Bookings created:', bookings.slice(-quantity));
    };
    
    reader.readAsDataURL(receiptFile);
    return bookingIds;
}

// Set up receipt modal
function setupReceiptModal() {
    const closeReceiptBtn = document.getElementById('close-receipt');
    const closeReceiptBtn2 = document.getElementById('close-receipt-btn');
    const printReceiptBtn = document.getElementById('print-receipt');
    const receiptModal = document.getElementById('receipt-modal');
    
    // Close receipt modal
    const closeReceipt = () => {
        receiptModal.classList.remove('active');
    };
    
    closeReceiptBtn.addEventListener('click', closeReceipt);
    closeReceiptBtn2.addEventListener('click', closeReceipt);
    
    // Print receipt
    printReceiptBtn.addEventListener('click', () => {
        window.print();
    });
}

// Set up payment receipt modal
function setupPaymentReceiptModal() {
    const closePaymentReceiptBtn = document.getElementById('close-payment-receipt');
    const closePaymentReceiptBtn2 = document.getElementById('close-payment-receipt-btn');
    const paymentReceiptModal = document.getElementById('payment-receipt-modal');
    
    // Close payment receipt modal
    const closePaymentReceipt = () => {
        paymentReceiptModal.classList.remove('active');
    };
    
    closePaymentReceiptBtn.addEventListener('click', closePaymentReceipt);
    closePaymentReceiptBtn2.addEventListener('click', closePaymentReceipt);
}

// Show receipt for a booking
function showReceipt(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    
    if (!booking) {
        console.error('Booking not found:', bookingId);
        return;
    }
    
    // Update receipt content
    document.getElementById('receipt-booking-id').textContent = booking.id;
    document.getElementById('receipt-name').textContent = booking.name;
    document.getElementById('receipt-phone').textContent = booking.phone;
    document.getElementById('receipt-event-type').textContent = booking.eventType.charAt(0).toUpperCase() + booking.eventType.slice(1);
    document.getElementById('receipt-package').textContent = booking.packageName;
    document.getElementById('receipt-quantity').textContent = booking.quantity;
    document.getElementById('receipt-total').textContent = `₵${booking.total}`;
    document.getElementById('receipt-grand-total').textContent = `Total: ₵${booking.total}`;
    
    // Update status badge
    const statusCell = document.querySelector('#receipt-content .badge');
    statusCell.className = 'badge';
    if (booking.status === 'pending') {
        statusCell.classList.add('badge-pending');
        statusCell.textContent = 'Pending';
    } else if (booking.status === 'paid') {
        statusCell.classList.add('badge-paid');
        statusCell.textContent = 'Paid';
    } else {
        statusCell.classList.add('badge-used');
        statusCell.textContent = 'Used';
    }
    
    // Show watermark if booking is paid or used
    const watermark = document.getElementById('receipt-watermark');
    if (booking.status === 'paid' || booking.status === 'used') {
        watermark.style.display = 'block';
    } else {
        watermark.style.display = 'none';
    }
    
    // Generate barcode
    JsBarcode("#receipt-barcode", booking.id, {
        format: "CODE128",
        width: 2,
        height: 60,
        displayValue: true
    });
    
    // Show receipt modal
    document.getElementById('receipt-modal').classList.add('active');
}

// Show payment receipt
function showPaymentReceipt(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    
    if (!booking || !booking.receipt) {
        alert('No payment receipt found for this booking');
        return;
    }
    
    document.getElementById('payment-receipt-content').innerHTML = `
        <img src="${booking.receipt}" class="payment-receipt-img" alt="Payment receipt">
    `;
    
    document.getElementById('payment-receipt-modal').classList.add('active');
}

// Set up admin page
function setupAdminPage() {
    document.getElementById('login-btn').addEventListener('click', function() {
        const password = document.getElementById('admin-password').value;
        if (password === 'admin123') {
            document.getElementById('admin-login').style.display = 'none';
            document.getElementById('admin-dashboard').style.display = 'block';
            localStorage.setItem('adminLoggedIn', 'true');
            updateAdminDashboard();
        } else {
            alert('Incorrect password!');
        }
    });
    
    document.getElementById('export-csv').addEventListener('click', function() {
        exportToCSV();
    });
    
    // Set up admin search button - FIXED
    document.getElementById('admin-search-btn').addEventListener('click', function() {
        const searchTerm = document.getElementById('admin-search').value.toLowerCase().trim();
        if (searchTerm) {
            const filteredBookings = bookings.filter(booking => 
                booking.id.toLowerCase().includes(searchTerm) ||
                booking.name.toLowerCase().includes(searchTerm) ||
                booking.phone.includes(searchTerm)
            );
            updateAdminTable(filteredBookings);
        } else {
            updateAdminTable(bookings);
        }
    });
    
    // Set up admin search input to reset when cleared - FIXED
    document.getElementById('admin-search').addEventListener('input', function() {
        if (this.value.trim() === '') {
            updateAdminTable(bookings);
        }
    });
    
    // Set up lookup button for my tickets - FIXED
    document.getElementById('lookup-btn').addEventListener('click', function() {
        const bookingId = document.getElementById('booking-id-lookup').value.trim().toUpperCase();
        if (!bookingId) {
            alert('Please enter a Booking ID');
            return;
        }
        
        // Find booking
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
            displaySingleBooking(booking);
        } else {
            alert('Booking not found. Please check your Booking ID and try again.');
        }
    });
    
    // Set up lookup input to reset when cleared - FIXED
    document.getElementById('booking-id-lookup').addEventListener('input', function() {
        if (this.value.trim() === '') {
            document.getElementById('tickets-list').innerHTML = '<p>Enter your Booking ID to find and download your ticket.</p>';
        }
    });
}

// Export to CSV
function exportToCSV() {
    if (bookings.length === 0) {
        alert('No bookings to export');
        return;
    }
    
    const headers = ['Booking ID', 'Name', 'Phone', 'Email', 'Package', 'Event Type', 'Quantity', 'Total', 'Status', 'Date'];
    const csvContent = [
        headers.join(','),
        ...bookings.map(booking => [
            booking.id,
            `"${booking.name}"`,
            booking.phone,
            booking.email || '',
            `"${booking.packageName}"`,
            booking.eventType,
            booking.quantity,
            booking.total,
            booking.status,
            new Date(booking.date).toLocaleDateString()
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `swanzy-bookings-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('CSV file downloaded successfully!');
}

// Update admin dashboard with booking data
function updateAdminDashboard() {
    // Update stats
    document.getElementById('total-bookings').textContent = bookings.length;
    document.getElementById('pending-bookings').textContent = bookings.filter(b => b.status === 'pending').length;
    document.getElementById('paid-bookings').textContent = bookings.filter(b => b.status === 'paid').length;
    document.getElementById('used-bookings').textContent = bookings.filter(b => b.status === 'used').length;
    
    // Update table
    updateAdminTable(bookings);
    
    // Update admin events
    updateAdminEvents();
    
    // Update packages list
    updatePackagesList();
}

// Update admin table with bookings
function updateAdminTable(bookingsToShow) {
    const tableBody = document.getElementById('admin-bookings-table');
    
    if (bookingsToShow.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No bookings found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = '';
    
    bookingsToShow.forEach(booking => {
        const row = document.createElement('tr');
        
        // Get status badge
        let statusBadge;
        if (booking.status === 'pending') {
            statusBadge = '<span class="badge badge-pending">Pending</span>';
        } else if (booking.status === 'paid') {
            statusBadge = '<span class="badge badge-paid">Paid</span>';
        } else {
            statusBadge = '<span class="badge badge-used">Used</span>';
        }
        
        row.innerHTML = `
            <td>${booking.id}</td>
            <td>${booking.name}</td>
            <td>${booking.phone}</td>
            <td>${booking.packageName}</td>
            <td>${booking.eventType.charAt(0).toUpperCase() + booking.eventType.slice(1)}</td>
            <td>₵${booking.total}</td>
            <td>${statusBadge}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-secondary action-btn mark-paid" data-id="${booking.id}">Mark Paid</button>
                    <button class="btn btn-primary action-btn mark-used" data-id="${booking.id}">Mark Used</button>
                    <button class="btn btn-ghost action-btn view-receipt" data-id="${booking.id}">View Receipt</button>
                    <button class="btn btn-ghost action-btn view-payment-receipt" data-id="${booking.id}">Payment Receipt</button>
                    <button class="btn btn-danger action-btn delete-booking" data-id="${booking.id}">Delete</button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.mark-paid').forEach(btn => {
        btn.addEventListener('click', function() {
            const bookingId = this.dataset.id;
            updateBookingStatus(bookingId, 'paid');
        });
    });
    
    document.querySelectorAll('.mark-used').forEach(btn => {
        btn.addEventListener('click', function() {
            const bookingId = this.dataset.id;
            updateBookingStatus(bookingId, 'used');
        });
    });
    
    document.querySelectorAll('.view-receipt').forEach(btn => {
        btn.addEventListener('click', function() {
            const bookingId = this.dataset.id;
            showReceipt(bookingId);
        });
    });
    
    document.querySelectorAll('.view-payment-receipt').forEach(btn => {
        btn.addEventListener('click', function() {
            const bookingId = this.dataset.id;
            showPaymentReceipt(bookingId);
        });
    });
    
    document.querySelectorAll('.delete-booking').forEach(btn => {
        btn.addEventListener('click', function() {
            const bookingId = this.dataset.id;
            deleteBooking(bookingId);
        });
    });
}

// Update packages list in admin
function updatePackagesList() {
    const packagesList = document.getElementById('packages-list');
    
    if (packages.length === 0) {
        packagesList.innerHTML = '<p>No packages available. Add some packages to get started!</p>';
        return;
    }
    
    let html = '';
    packages.forEach(pkg => {
        html += `
            <div class="card" style="margin-bottom: 16px;">
                <h3>${pkg.name} - ₵${pkg.price}</h3>
                <p><strong>Type:</strong> ${pkg.type.charAt(0).toUpperCase() + pkg.type.slice(1)}</p>
                <p><strong>Features:</strong> ${pkg.features.join(', ')}</p>
                <div class="action-buttons" style="margin-top: 10px;">
                    <button class="btn btn-secondary action-btn edit-package" data-id="${pkg.id}">Edit</button>
                    <button class="btn btn-danger action-btn delete-package" data-id="${pkg.id}">Delete</button>
                </div>
            </div>
        `;
    });
    
    packagesList.innerHTML = html;
    
    // Add event listeners to package buttons
    document.querySelectorAll('.edit-package').forEach(btn => {
        btn.addEventListener('click', function() {
            const packageId = this.dataset.id;
            editPackage(packageId);
        });
    });
    
    document.querySelectorAll('.delete-package').forEach(btn => {
        btn.addEventListener('click', function() {
            const packageId = this.dataset.id;
            deletePackage(packageId);
        });
    });
}

// Update admin events
function updateAdminEvents() {
    const adminEventsGrid = document.getElementById('admin-events-grid');
    
    if (events.length === 0) {
        adminEventsGrid.innerHTML = '<p>No events available. Add some events to get started!</p>';
        return;
    }
    
    let html = '';
    events.forEach(event => {
        const eventDate = new Date(event.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Get package name
        const package = packages.find(p => p.id === event.packageId);
        const packageName = package ? package.name : 'Unknown Package';
        
        html += `
            <div class="event-card">
                <h3 class="event-title">${event.title}</h3>
                <p class="event-date">${eventDate}</p>
                <p>${event.description}</p>
                <p><strong>Package:</strong> ${packageName}</p>
                <p class="event-price">₵${event.price}</p>
                <div class="action-buttons" style="margin-top: 10px;">
                    <button class="btn btn-secondary action-btn edit-event" data-id="${event.id}">Edit</button>
                    <button class="btn btn-danger action-btn delete-event" data-id="${event.id}">Delete</button>
                </div>
            </div>
        `;
    });
    
    adminEventsGrid.innerHTML = html;
    
    // Add event listeners to event buttons
    document.querySelectorAll('.edit-event').forEach(btn => {
        btn.addEventListener('click', function() {
            const eventId = this.dataset.id;
            editEvent(eventId);
        });
    });
    
    document.querySelectorAll('.delete-event').forEach(btn => {
        btn.addEventListener('click', function() {
            const eventId = this.dataset.id;
            deleteEvent(eventId);
        });
    });
}

// Update booking status
function updateBookingStatus(bookingId, status) {
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex !== -1) {
        bookings[bookingIndex].status = status;
        localStorage.setItem('swanzyBookings', JSON.stringify(bookings));
        updateAdminDashboard();
    }
}

// Delete booking
function deleteBooking(bookingId) {
    if (confirm('Are you sure you want to delete this booking?')) {
        bookings = bookings.filter(b => b.id !== bookingId);
        localStorage.setItem('swanzyBookings', JSON.stringify(bookings));
        updateAdminDashboard();
    }
}

// Delete event
function deleteEvent(eventId) {
    if (confirm('Are you sure you want to delete this event?')) {
        events = events.filter(e => e.id !== eventId);
        localStorage.setItem('swanzyEvents', JSON.stringify(events));
        updateAdminDashboard();
        loadEvents(); // Update events page as well
    }
}

// Delete package
function deletePackage(packageId) {
    if (confirm('Are you sure you want to delete this package?')) {
        packages = packages.filter(p => p.id !== packageId);
        localStorage.setItem('swanzyPackages', JSON.stringify(packages));
        updateAdminDashboard();
        loadPackagesForBooking(); // Update booking form
    }
}

// Display single booking in My Tickets
function displaySingleBooking(booking) {
    const ticketsList = document.getElementById('tickets-list');
    
    let statusBadge;
    if (booking.status === 'pending') {
        statusBadge = '<span class="badge badge-pending">Pending</span>';
    } else if (booking.status === 'paid') {
        statusBadge = '<span class="badge badge-paid">Paid</span>';
    } else {
        statusBadge = '<span class="badge badge-used">Used</span>';
    }
    
    ticketsList.innerHTML = `
        <div class="card" style="margin-bottom: 16px;">
            <h3>Booking ID: ${booking.id}</h3>
            <p><strong>Name:</strong> ${booking.name}</p>
            <p><strong>Event Type:</strong> ${booking.eventType.charAt(0).toUpperCase() + booking.eventType.slice(1)}</p>
            <p><strong>Package:</strong> ${booking.packageName}</p>
            <p><strong>Total:</strong> ₵${booking.total}</p>
            <p><strong>Status:</strong> ${statusBadge}</p>
            <button class="btn btn-secondary download-ticket-btn" data-id="${booking.id}" style="margin-top: 10px;">Download Ticket</button>
        </div>
    `;
    
    // Add event listener to download ticket button
    document.querySelector('.download-ticket-btn').addEventListener('click', function() {
        showReceipt(booking.id);
    });
}

// Set up events page
function setupEventsPage() {
    // Events will be loaded when the page is activated
}

// Load events on the events page
function loadEvents() {
    const eventsGrid = document.getElementById('events-grid');
    
    if (events.length === 0) {
        eventsGrid.innerHTML = '<p>No events available at the moment. Check back later!</p>';
        return;
    }
    
    let html = '';
    events.forEach(event => {
        const eventDate = new Date(event.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Get package name
        const package = packages.find(p => p.id === event.packageId);
        const packageName = package ? package.name : 'Unknown Package';
        
        html += `
            <div class="event-card" data-event-id="${event.id}">
                <h3 class="event-title">${event.title}</h3>
                <p class="event-date">${eventDate}</p>
                <p>${event.description}</p>
                <p><strong>Package:</strong> ${packageName}</p>
                <p class="event-price">₵${event.price}</p>
                <button class="btn btn-primary book-event-btn" data-event-id="${event.id}" style="margin-top: 10px;">Book Now</button>
            </div>
        `;
    });
    
    eventsGrid.innerHTML = html;
    
    // Add event listeners to book buttons
    document.querySelectorAll('.book-event-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const eventId = this.dataset.eventId;
            bookEvent(eventId);
        });
    });
}

// Book an event - FIXED to set event type to "Events" when applicable
function bookEvent(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) {
        alert('Event not found!');
        return;
    }
    
    // Switch to booking page and pre-fill with event details
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector('.nav-tab[data-page="booking"]').classList.add('active');
    
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('booking-page').classList.add('active');
    
    // Set event type based on event - FIXED to properly handle "Events" type
    document.querySelectorAll('.event-type-btn').forEach(btn => btn.classList.remove('active'));
    const eventTypeBtn = document.querySelector(`.event-type-btn[data-type="${event.type}"]`);
    if (eventTypeBtn) {
        eventTypeBtn.classList.add('active');
    }
    
    // Show appropriate content
    document.getElementById('gaming-content').style.display = event.type === 'gaming' ? 'block' : 'none';
    document.getElementById('football-content').style.display = event.type === 'football' ? 'block' : 'none';
    document.getElementById('events-content').style.display = event.type === 'Events' ? 'block' : 'none';
    
    // Update packages based on event type and select the package associated with the event
    loadPackagesForBooking(event.type);
    
    // Set the package to the one associated with the event
    const packageSelect = document.getElementById('package');
    packageSelect.value = event.packageId;
    
    // Update the price
    updatePrice();
    
    alert(`Ready to book "${event.title}"! Fill in your details and complete the booking.`);
}

// Set up add event modal
function setupAddEventModal() {
    const addEventBtn = document.getElementById('add-event-btn');
    const closeAddEventBtn = document.getElementById('close-add-event');
    const cancelAddEventBtn = document.getElementById('cancel-add-event');
    const saveEventBtn = document.getElementById('save-event');
    const addEventModal = document.getElementById('add-event-modal');
    
    // Open add event modal
    addEventBtn.addEventListener('click', () => {
        currentEditingEventId = null;
        document.getElementById('add-event-form').reset();
        document.getElementById('add-event-modal-title').textContent = 'Add New Event';
        
        // Load packages for event type selection
        loadPackagesForEventModal();
        
        addEventModal.classList.add('active');
    });
    
    // Close add event modal
    const closeModal = () => {
        addEventModal.classList.remove('active');
    };
    
    closeAddEventBtn.addEventListener('click', closeModal);
    cancelAddEventBtn.addEventListener('click', closeModal);
    
    // Save event
    saveEventBtn.addEventListener('click', () => {
        const title = document.getElementById('event-title').value;
        const date = document.getElementById('event-date').value;
        const price = parseInt(document.getElementById('event-price').value);
        const type = document.getElementById('event-type').value;
        const packageId = document.getElementById('event-package').value;
        const description = document.getElementById('event-description').value;
        
        if (!title || !date || !price || !description || !packageId) {
            alert('Please fill in all fields');
            return;
        }
        
        if (currentEditingEventId) {
            // Update existing event
            const eventIndex = events.findIndex(e => e.id === currentEditingEventId);
            if (eventIndex !== -1) {
                events[eventIndex] = {
                    ...events[eventIndex],
                    title,
                    date,
                    price,
                    type,
                    packageId,
                    description
                };
            }
        } else {
            // Generate event ID
            const eventId = 'evt' + Date.now().toString().slice(-6);
            
            // Create event object
            const event = {
                id: eventId,
                title: title,
                date: date,
                price: price,
                type: type,
                packageId: packageId,
                description: description
            };
            
            // Add to events array
            events.push(event);
        }
        
        // Save to localStorage
        localStorage.setItem('swanzyEvents', JSON.stringify(events));
        
        // Update admin dashboard and events page
        updateAdminDashboard();
        loadEvents();
        
        // Close modal
        closeModal();
        
        alert(`Event ${currentEditingEventId ? 'updated' : 'added'} successfully!`);
    });
}

// Load packages for event modal
function loadPackagesForEventModal() {
    const packageSelect = document.getElementById('event-package');
    packageSelect.innerHTML = '';
    
    packages.forEach(pkg => {
        const option = document.createElement('option');
        option.value = pkg.id;
        option.textContent = `${pkg.name} - ₵${pkg.price}`;
        packageSelect.appendChild(option);
    });
}

// Edit event
function editEvent(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) {
        alert('Event not found!');
        return;
    }
    
    currentEditingEventId = eventId;
    
    // Fill form with event details
    document.getElementById('event-title').value = event.title;
    document.getElementById('event-date').value = event.date;
    document.getElementById('event-price').value = event.price;
    document.getElementById('event-type').value = event.type;
    document.getElementById('event-package').value = event.packageId;
    document.getElementById('event-description').value = event.description;
    
    // Load packages for event type selection
    loadPackagesForEventModal();
    
    // Update modal title
    document.getElementById('add-event-modal-title').textContent = 'Edit Event';
    
    // Show modal
    document.getElementById('add-event-modal').classList.add('active');
}

// Set up add package modal
function setupAddPackageModal() {
    const addPackageBtn = document.getElementById('add-package-btn');
    const closeAddPackageBtn = document.getElementById('close-add-package');
    const cancelAddPackageBtn = document.getElementById('cancel-add-package');
    const savePackageBtn = document.getElementById('save-package');
    const addFeatureBtn = document.getElementById('add-feature-btn');
    const addPackageModal = document.getElementById('add-package-modal');
    const packageFeatures = document.getElementById('package-features');
    
    // Open add package modal
    addPackageBtn.addEventListener('click', () => {
        currentEditingPackageId = null;
        document.getElementById('add-package-form').reset();
        document.getElementById('add-package-modal-title').textContent = 'Add New Package';
        
        // Reset features
        packageFeatures.innerHTML = `
            <div class="feature-item">
                <input type="text" class="form-control" placeholder="Feature (e.g., Free Meal)">
            </div>
        `;
        
        addPackageModal.classList.add('active');
    });
    
    // Close add package modal
    const closeModal = () => {
        addPackageModal.classList.remove('active');
    };
    
    closeAddPackageBtn.addEventListener('click', closeModal);
    cancelAddPackageBtn.addEventListener('click', closeModal);
    
    // Add feature input
    addFeatureBtn.addEventListener('click', () => {
        const newFeature = document.createElement('div');
        newFeature.className = 'feature-item';
        newFeature.innerHTML = `
            <input type="text" class="form-control" placeholder="Feature (e.g., Free Meal)">
            <button type="button" class="btn btn-danger remove-feature-btn">Remove</button>
        `;
        packageFeatures.appendChild(newFeature);
        
        // Add event listener to remove button
        newFeature.querySelector('.remove-feature-btn').addEventListener('click', function() {
            if (packageFeatures.children.length > 1) {
                packageFeatures.removeChild(newFeature);
            }
        });
    });
    
    // Save package
    savePackageBtn.addEventListener('click', () => {
        const name = document.getElementById('package-name').value;
        const price = parseInt(document.getElementById('package-price').value);
        const type = document.getElementById('package-type').value;
        
        // Get features
        const features = [];
        const featureInputs = packageFeatures.querySelectorAll('input');
        featureInputs.forEach(input => {
            if (input.value.trim()) {
                features.push(input.value.trim());
            }
        });
        
        if (!name || !price || features.length === 0) {
            alert('Please fill in all fields and add at least one feature');
            return;
        }
        
        if (currentEditingPackageId) {
            // Update existing package
            const packageIndex = packages.findIndex(p => p.id === currentEditingPackageId);
            if (packageIndex !== -1) {
                packages[packageIndex] = {
                    ...packages[packageIndex],
                    name,
                    price,
                    type,
                    features
                };
            }
        } else {
            // Generate package ID
            const packageId = 'pkg' + Date.now().toString().slice(-6);
            
            // Create package object
            const pkg = {
                id: packageId,
                name: name,
                price: price,
                type: type,
                features: features
            };
            
            // Add to packages array
            packages.push(pkg);
        }
        
        // Save to localStorage
        localStorage.setItem('swanzyPackages', JSON.stringify(packages));
        
        // Update admin dashboard and booking form
        updateAdminDashboard();
        loadPackagesForBooking();
        
        // Close modal
        closeModal();
        
        alert(`Package ${currentEditingPackageId ? 'updated' : 'added'} successfully!`);
    });
}

// Edit package
function editPackage(packageId) {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) {
        alert('Package not found!');
        return;
    }
    
    currentEditingPackageId = packageId;
    
    // Fill form with package details
    document.getElementById('package-name').value = pkg.name;
    document.getElementById('package-price').value = pkg.price;
    document.getElementById('package-type').value = pkg.type;
    
    // Fill features
    const packageFeatures = document.getElementById('package-features');
    packageFeatures.innerHTML = '';
    pkg.features.forEach(feature => {
        const featureItem = document.createElement('div');
        featureItem.className = 'feature-item';
        featureItem.innerHTML = `
            <input type="text" class="form-control" value="${feature}">
            <button type="button" class="btn btn-danger remove-feature-btn">Remove</button>
        `;
        packageFeatures.appendChild(featureItem);
        
        // Add event listener to remove button
        featureItem.querySelector('.remove-feature-btn').addEventListener('click', function() {
            if (packageFeatures.children.length > 1) {
                packageFeatures.removeChild(featureItem);
            }
        });
    });
    
    // Update modal title
    document.getElementById('add-package-modal-title').textContent = 'Edit Package';
    
    // Show modal
    document.getElementById('add-package-modal').classList.add('active');
}

// --- Admin helpers: tabs, login/logout, and settings ---

function showAdminTab(tab) {
    const tabs = ['bookings', 'events', 'packages', 'settings'];
    tabs.forEach(t => {
        const el = document.getElementById(`${t}-admin`);
        if (el) el.style.display = (t === tab) ? 'block' : 'none';
    });

    // If switching to bookings or other sections, refresh content
    if (tab === 'bookings') updateAdminDashboard();
    if (tab === 'events') loadEvents();
    if (tab === 'packages') updatePackagesAdmin && updatePackagesAdmin();
}

function adminLogin() {
    const password = document.getElementById('admin-password').value;
    if (password === 'admin123') {
        document.getElementById('admin-login').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
        localStorage.setItem('adminLoggedIn', 'true');
        updateAdminDashboard();
    } else {
        alert('Incorrect password!');
    }
}

function adminLogout() {
    localStorage.removeItem('adminLoggedIn');
    document.getElementById('admin-dashboard').style.display = 'none';
    document.getElementById('admin-login').style.display = 'block';
}

// Settings storage format saved under 'swanzySettings'
function saveSettings() {
    const settings = {
        arkasel: {
            baseUrl: document.getElementById('arkasel-base-url').value.trim(),
            apiKey: document.getElementById('arkasel-api-key').value.trim(),
            merchantId: document.getElementById('arkasel-merchant-id').value.trim(),
            secret: document.getElementById('arkasel-secret').value.trim()
        },
        paystack: {
            publicKey: document.getElementById('paystack-public-key').value.trim(),
            secretKey: document.getElementById('paystack-secret-key').value.trim(),
            callbackUrl: document.getElementById('paystack-callback-url').value.trim(),
            env: document.getElementById('paystack-env').value
        }
    };

    localStorage.setItem('swanzySettings', JSON.stringify(settings));
    const status = document.getElementById('settings-status');
    if (status) {
        status.textContent = 'Settings saved';
        setTimeout(() => { status.textContent = ''; }, 3000);
    }
}

function loadSettings() {
    const raw = localStorage.getItem('swanzySettings');
    if (!raw) return;
    let settings = {};
    try {
        settings = JSON.parse(raw);
    } catch (e) {
        console.warn('Failed to parse settings:', e);
        return;
    }

    if (settings.arkasel) {
        document.getElementById('arkasel-base-url').value = settings.arkasel.baseUrl || '';
        document.getElementById('arkasel-api-key').value = settings.arkasel.apiKey || '';
        document.getElementById('arkasel-merchant-id').value = settings.arkasel.merchantId || '';
        document.getElementById('arkasel-secret').value = settings.arkasel.secret || '';
    }

    if (settings.paystack) {
        document.getElementById('paystack-public-key').value = settings.paystack.publicKey || '';
        document.getElementById('paystack-secret-key').value = settings.paystack.secretKey || '';
        document.getElementById('paystack-callback-url').value = settings.paystack.callbackUrl || '';
        document.getElementById('paystack-env').value = settings.paystack.env || 'test';
    }
}

function testArkasel() {
    const baseUrl = document.getElementById('arkasel-base-url').value.trim();
    const apiKey = document.getElementById('arkasel-api-key').value.trim();
    if (!baseUrl || !apiKey) {
        alert('Please provide ArkaSel base URL and API key to test.');
        return;
    }

    // Basic test: try a GET to the base URL (no assumptions about endpoints)
    fetch(baseUrl, { method: 'GET' })
        .then(res => {
            if (res.ok) {
                alert('ArkaSel base URL is reachable (HTTP ' + res.status + ').');
            } else {
                alert('ArkaSel responded with HTTP ' + res.status + '.');
            }
        })
        .catch(err => {
            console.warn(err);
            alert('Could not reach ArkaSel base URL. Check the URL and network.');
        });
}

function testPaystack() {
    const pub = document.getElementById('paystack-public-key').value.trim();
    const sk = document.getElementById('paystack-secret-key').value.trim();
    if (!pub || !sk) {
        alert('Please provide Paystack public and secret keys to test.');
        return;
    }

    // Basic validation only: check keys look like keys
    const ok = (pub.startsWith('pk_') || pub.startsWith('PUBLISHABLE_') || pub.length > 10) && (sk.startsWith('sk_') || sk.length > 10);
    if (ok) {
        alert('Paystack keys look valid (basic check).');
    } else {
        alert('Paystack keys may be invalid. Please verify them.');
    }
}

// Ensure the login button added to the DOM is wired (for the recreated HTML)
document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) loginBtn.addEventListener('click', adminLogin);
});
