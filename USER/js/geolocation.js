// FIXED Geolocation Handler
const GeoLocation = {
    // Get current location
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                alert('❌ Geolocation not supported by your browser');
                reject(new Error('Geolocation not supported'));
                return;
            }

            const locationBtn = document.querySelector('.location-btn');
            if (locationBtn) {
                locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting location...';
                locationBtn.disabled = true;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        // Use free Nominatim API instead of Google Maps
                        const address = await this.reverseGeocode(
                            position.coords.latitude,
                            position.coords.longitude
                        );
                        this.fillAddressFields(address);
                        this.showSuccess('✅ Location detected!');
                        
                        if (locationBtn) {
                            locationBtn.innerHTML = '<i class="fas fa-check"></i> Location Detected';
                        }
                        resolve(address);
                    } catch (error) {
                        console.error('Geocoding error:', error);
                        this.showError('❌ Could not get address. Please enter manually.');
                        if (locationBtn) {
                            locationBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Use My Current Location';
                            locationBtn.disabled = false;
                        }
                        reject(error);
                    }
                },
                (error) => {
                    console.error('Location error:', error);
                    this.showError('❌ Location access denied.');
                    if (locationBtn) {
                        locationBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Use My Current Location';
                        locationBtn.disabled = false;
                    }
                    reject(error);
                }
            );
        });
    },

    // Reverse geocode using FREE Nominatim API (no API key needed!)
    async reverseGeocode(lat, lng) {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'FixItNow/1.0'
            }
        });
        
        if (!response.ok) {
            throw new Error('Geocoding failed');
        }

        const data = await response.json();
        return this.parseAddress(data);
    },

    // Parse address from Nominatim response
    parseAddress(data) {
        const addr = data.address || {};
        return {
            fullAddress: data.display_name,
            street: `${addr.house_number || ''} ${addr.road || ''}`.trim(),
            city: addr.city || addr.town || addr.village || '',
            state: addr.state || '',
            country: addr.country || '',
            zipcode: addr.postcode || '',
            lat: data.lat,
            lng: data.lon
        };
    },

    // Fill address fields
    fillAddressFields(address) {
        const fields = {
            'address': address.street || address.fullAddress,
            'city': address.city,
            'state': address.state,
            'zipcode': address.zipcode
        };

        Object.entries(fields).forEach(([id, value]) => {
            const input = document.getElementById(id);
            if (input && value) {
                input.value = value;
                input.style.borderColor = '#10b981';
                setTimeout(() => {
                    input.style.borderColor = '';
                }, 2000);
            }
        });
    },

    // Show success message
    showSuccess(message) {
        this.showNotification(message, '#10b981');
    },

    // Show error message
    showError(message) {
        this.showNotification(message, '#ef4444');
    },

    // Show notification
    showNotification(message, color) {
        const existing = document.getElementById('geoNotification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.id = 'geoNotification';
        notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            background: ${color};
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

window.GeoLocation = GeoLocation;
