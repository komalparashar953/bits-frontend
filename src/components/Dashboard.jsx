import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import AuctionCard from './AuctionCard';

// In a real app, this URL should come from env vars
// Auto-detect URL: if dev, localhost:3001, else relative (/)
const SOCKET_URL = import.meta.env.DEV ? 'http://localhost:3001' : '/';

const Dashboard = () => {
    const [items, setItems] = useState([]);
    const [socket, setSocket] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('Connecting...');
    const [timeOffset, setTimeOffset] = useState(0);

    useEffect(() => {
        // Initialize Socket
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            setConnectionStatus('Connected');
            console.log('Connected to server');
        });

        newSocket.on('connect_error', (err) => {
            setConnectionStatus('Connection Error');
            console.error('Connection Error:', err);
        });

        // Listen for initial data if server sends it, or we fetch it via REST
        newSocket.on('INITIAL_DATA', (data) => {
            if (Array.isArray(data)) {
                setItems(data);
            } else {
                setItems(data.items);
                const clientTime = Date.now();
                const serverTime = data.serverTime;
                const offset = serverTime - clientTime;
                setTimeOffset(offset);
            }
        });

        // Real-time updates
        newSocket.on('UPDATE_BID', (updatedItem) => {
            setItems((currentItems) =>
                currentItems.map(item =>
                    item.id === updatedItem.itemId
                        ? { ...item, currentBid: updatedItem.currentBid, highestBidder: updatedItem.highestBidder }
                        : item
                )
            );
        });

        newSocket.on('BID_ERROR', (error) => {
            alert(`Bid failed: ${error.message}`);
        });

        // Cleanup
        return () => {
            newSocket.disconnect();
        };
    }, []);

    // Fetch initial data via REST as fallback or primary method
    useEffect(() => {
        fetch(`${SOCKET_URL}/items`)
            .then(res => res.json())
            .then(data => setItems(data))
            .catch(err => console.error('Failed to fetch items:', err));
    }, []);

    const handleBid = (itemId, amount) => {
        if (socket) {
            socket.emit('BID_PLACED', { itemId, amount });
        }
    };

    return (
        <div className="container">
            <div className="header">
                <h1>Live Auctions</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: connectionStatus === 'Connected' ? 'var(--color-success)' : 'var(--color-error)'
                    }}></span>
                    <span>{connectionStatus}</span>
                </div>
            </div>

            <div className="grid">
                {items.map(item => (
                    <AuctionCard
                        key={item.id}
                        item={item}
                        onBid={handleBid}
                        isHighestBidder={socket && socket.id === item.highestBidder}
                        timeOffset={timeOffset}
                    />
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
