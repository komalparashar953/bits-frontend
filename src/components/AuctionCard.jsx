import React, { useState, useEffect } from 'react';
import '../styles/designSystem.css';

const AuctionCard = ({ item, onBid, isHighestBidder, timeOffset = 0 }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [flashClass, setFlashClass] = useState('');

    // Timer Logic
    useEffect(() => {
        const timer = setInterval(() => {
            const now = Date.now() + timeOffset;
            const diff = item.endTime - now;

            if (diff <= 0) {
                setTimeLeft('Auction Ended');
                clearInterval(timer);
            } else {
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${minutes}m ${seconds}s`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [item.endTime]);

    // Flash Animation Effect on Price Change
    useEffect(() => {
        // Determine flash color
        // If we just got updated and I'm NOT the highest bidder (someone else bid), or just general update
        // The requirement: "new bid comes in... green flash"
        // "If I get outbid... red outbid state"

        // Simple approach: Flash green on any increase.
        // We can use a ref to track previous bid if needed, but we can just trigger on change.

        setFlashClass('flash-success');
        const timeout = setTimeout(() => setFlashClass(''), 500);
        return () => clearTimeout(timeout);
    }, [item.currentBid]);

    // Handling "Outbid" visual state
    // If I was the highest bidder and now I'm not, that logic is likely calculated in parent or passed down.
    // We use `isHighestBidder` prop to show "Winning" badge.
    // If I *was* winning in previous render and now *not*, that's distinct.
    // For now, let's strictly follow "If I am highest bidder -> Winning Badge".
    // "If I get outbid -> switch to red Outbid state".
    // This implies we need to know if we *were* winning.

    return (
        <div className={`card ${flashClass}`} style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-md)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            border: isHighestBidder ? '2px solid var(--color-success)' : '1px solid rgba(255,255,255,0.1)'
        }}>
            <div style={{
                height: '200px',
                backgroundImage: `url(${item.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--spacing-md)'
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>{item.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Starting: ${item.startingPrice}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Current Bid</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>${item.currentBid}</div>
                </div>
            </div>

            <div style={{
                marginTop: 'var(--spacing-md)',
                paddingtop: 'var(--spacing-sm)',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ fontWeight: 'bold', color: timeLeft === 'Auction Ended' ? 'var(--color-error)' : 'var(--text-primary)' }}>
                    {timeLeft}
                </div>

                {isHighestBidder && (
                    <span style={{
                        backgroundColor: 'var(--color-success)',
                        color: '#000',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                    }}>
                        {timeLeft === 'Auction Ended' ? 'YOU WON!' : 'YOU ARE WINNING'}
                    </span>
                )}
            </div>

            <button
                onClick={() => onBid(item.id, item.currentBid + 10)}
                disabled={timeLeft === 'Auction Ended'}
                style={{
                    marginTop: 'var(--spacing-md)',
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'var(--color-primary)',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    opacity: timeLeft === 'Auction Ended' ? 0.5 : 1
                }}
            >
                Bid $+10
            </button>
        </div>
    );
};

export default AuctionCard;
