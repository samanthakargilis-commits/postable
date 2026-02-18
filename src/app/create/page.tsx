'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './create.module.css';

/* ── Data ─── */
const VIBES = [
    { id: 'cozy', label: 'Cozy', emoji: '🕯️', color: '#d4873e', desc: 'Warm & intimate' },
    { id: 'birthday', label: 'Birthday', emoji: '🎂', color: '#c67a5c', desc: 'Celebrate someone' },
    { id: 'love', label: 'Love', emoji: '💌', color: '#d4a0a0', desc: 'Romantic & tender' },
    { id: 'gratitude', label: 'Gratitude', emoji: '🌿', color: '#9caf88', desc: 'Thank you, truly' },
    { id: 'sympathy', label: 'Sympathy', emoji: '🕊️', color: '#8a6070', desc: 'I\'m here for you' },
    { id: 'congratulations', label: 'Congrats', emoji: '✨', color: '#c9a84c', desc: 'You did it!' },
    { id: 'justbecause', label: 'Just Because', emoji: '🌸', color: '#d4a0a0', desc: 'No reason needed' },
    { id: 'seasonal', label: 'Seasonal', emoji: '❄️', color: '#8aa0b8', desc: 'Winter warmth' },
];

const STICKERS = [
    { id: 's1', emoji: '🌹', label: 'Rose' },
    { id: 's2', emoji: '🦋', label: 'Butterfly' },
    { id: 's3', emoji: '🌻', label: 'Sunflower' },
    { id: 's4', emoji: '☕', label: 'Tea' },
    { id: 's5', emoji: '🍰', label: 'Cake' },
    { id: 's6', emoji: '🌙', label: 'Moon' },
    { id: 's7', emoji: '🕊️', label: 'Dove' },
    { id: 's8', emoji: '🎀', label: 'Ribbon' },
    { id: 's9', emoji: '🌿', label: 'Leaf' },
    { id: 's10', emoji: '💐', label: 'Bouquet' },
    { id: 's11', emoji: '🧸', label: 'Bear' },
    { id: 's12', emoji: '🍓', label: 'Strawberry' },
];

const STAMPS = [
    { id: 'wax-red', label: 'Ruby Wax', color: '#8a2030', symbol: '♥' },
    { id: 'wax-gold', label: 'Gold Wax', color: '#c9a84c', symbol: '✦' },
    { id: 'wax-sage', label: 'Sage Wax', color: '#6e8a5a', symbol: '✿' },
    { id: 'wax-plum', label: 'Plum Wax', color: '#5c3a4a', symbol: '✧' },
    { id: 'wax-pink', label: 'Blush Wax', color: '#c07878', symbol: '❀' },
    { id: 'wax-navy', label: 'Navy Wax', color: '#2a3a5a', symbol: '⚜' },
];

const ENVELOPE_STYLES = [
    { id: 'cream', label: 'Cream', bg: 'linear-gradient(135deg, #f5efe6, #e8dcc8)', inner: '#dccab0' },
    { id: 'blush', label: 'Blush', bg: 'linear-gradient(135deg, #f0d0d0, #e8b8b8)', inner: '#daa8a8' },
    { id: 'sage', label: 'Sage', bg: 'linear-gradient(135deg, #d0dcc8, #b8c8a8)', inner: '#a8b898' },
    { id: 'midnight', label: 'Midnight', bg: 'linear-gradient(135deg, #2a2a4e, #1a1a3a)', inner: '#3a3a5e' },
];

type PlacedSticker = {
    id: string;
    stickerId: string;
    emoji: string;
    x: number;
    y: number;
    rotation: number;
    scale: number;
};

type ViewMode = 'letter' | 'envelope' | 'sending' | 'sent';

export default function CreatePage() {
    const [selectedVibe, setSelectedVibe] = useState(VIBES[0]);
    const [letterText, setLetterText] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
    const [stickerTinOpen, setStickerTinOpen] = useState(false);
    const [stampDrawerOpen, setStampDrawerOpen] = useState(false);
    const [selectedStamp, setSelectedStamp] = useState(STAMPS[0]);
    const [selectedEnvelope, setSelectedEnvelope] = useState(ENVELOPE_STYLES[0]);
    const [viewMode, setViewMode] = useState<ViewMode>('letter');
    const [roomLoaded, setRoomLoaded] = useState(false);
    const [aiArtReady, setAiArtReady] = useState(false);
    const [birdVisible, setBirdVisible] = useState(false);
    const [draggedSticker, setDraggedSticker] = useState<{ emoji: string; id: string } | null>(null);
    const [sealPressed, setSealPressed] = useState(false);
    const [sendPhase, setSendPhase] = useState(0); // 0: fold, 1: seal, 2: float, 3: done

    const canvasRef = useRef<HTMLDivElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const t = setTimeout(() => setRoomLoaded(true), 300);
        return () => clearTimeout(t);
    }, []);

    // AI art "generation" effect — bird appears while writing
    useEffect(() => {
        if (letterText.length > 50 && !aiArtReady) {
            setBirdVisible(true);
            const t = setTimeout(() => {
                setAiArtReady(true);
                setBirdVisible(false);
            }, 3000);
            return () => clearTimeout(t);
        }
    }, [letterText, aiArtReady]);

    /* ── Sticker drag & drop ─── */
    const handleStickerDragStart = useCallback((sticker: { id: string; emoji: string }) => {
        setDraggedSticker(sticker);
    }, []);

    const handleCanvasDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!draggedSticker || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setPlacedStickers(prev => [...prev, {
            id: `placed-${Date.now()}`,
            stickerId: draggedSticker.id,
            emoji: draggedSticker.emoji,
            x,
            y,
            rotation: -15 + Math.random() * 30,
            scale: 0.9 + Math.random() * 0.3,
        }]);
        setDraggedSticker(null);
    }, [draggedSticker]);

    const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const removeSticker = useCallback((id: string) => {
        setPlacedStickers(prev => prev.filter(s => s.id !== id));
    }, []);

    /* ── Send Flow ─── */
    const handleSend = useCallback(() => {
        if (!letterText.trim() || !recipientName.trim()) return;
        setViewMode('sending');
        setSendPhase(0);

        // Letter fold
        setTimeout(() => setSendPhase(1), 1500);
        // Seal bloom
        setTimeout(() => {
            setSealPressed(true);
            setSendPhase(2);
        }, 3000);
        // Float away
        setTimeout(() => setSendPhase(3), 4500);
        // Final screen
        setTimeout(() => setViewMode('sent'), 6500);
    }, [letterText, recipientName]);

    /* ── Vibe-dependent room styles ─── */
    const getVibeRoomClass = () => {
        switch (selectedVibe.id) {
            case 'birthday': return styles.roomBirthday;
            case 'love': return styles.roomLove;
            case 'sympathy': return styles.roomSympathy;
            case 'congratulations': return styles.roomCongrats;
            default: return '';
        }
    };

    /* ── Stationery style per vibe ─── */
    const getStationeryStyle = () => {
        switch (selectedVibe.id) {
            case 'love': return { borderColor: '#d4a0a088', background: 'linear-gradient(180deg, #fdf5f5, #f8e8e8)' };
            case 'birthday': return { borderColor: '#c67a5c88', background: 'linear-gradient(180deg, #fffaf5, #f8f0e8)' };
            case 'sympathy': return { borderColor: '#8a607088', background: 'linear-gradient(180deg, #f5f0f2, #ece4e8)' };
            case 'gratitude': return { borderColor: '#9caf8888', background: 'linear-gradient(180deg, #f5f8f2, #e8f0e0)' };
            case 'congratulations': return { borderColor: '#c9a84c88', background: 'linear-gradient(180deg, #fdf8f0, #f8f0d8)' };
            default: return { borderColor: '#d4873e44', background: 'linear-gradient(180deg, #faf8f5, #f5efe6)' };
        }
    };

    if (viewMode === 'sent') {
        return (
            <div className={styles.sentScreen}>
                <div className={styles.sentWindow}>
                    <div className={styles.sentStars}>
                        {Array.from({ length: 30 }, (_, i) => (
                            <div
                                key={i}
                                className={styles.sentStar}
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 3}s`,
                                    width: `${1 + Math.random() * 2}px`,
                                    height: `${1 + Math.random() * 2}px`,
                                }}
                            />
                        ))}
                    </div>
                    <div className={styles.travelingLight} />
                </div>
                <div className={styles.sentContent}>
                    <p className={styles.sentMessage}>Your letter is on its way</p>
                    <p className={styles.sentRecipient}>To {recipientName}</p>
                    <p className={styles.sentTimer}>Arriving in 24 hours</p>
                    <button className={styles.sentButton} onClick={() => {
                        setViewMode('letter');
                        setLetterText('');
                        setRecipientName('');
                        setPlacedStickers([]);
                        setAiArtReady(false);
                        setSealPressed(false);
                        setSendPhase(0);
                    }}>
                        Write another letter
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.room} ${roomLoaded ? styles.roomLoaded : ''} ${getVibeRoomClass()}`}>

            {/* ── Ambient background ─── */}
            <div className={styles.roomBg}>
                <div className={styles.fireplace}>
                    <div className={styles.fireplaceMantel} />
                    <div className={styles.fireBox}>
                        <div className={styles.fireGlow} />
                        <div className={styles.flame} style={{ animationDelay: '0s' }} />
                        <div className={styles.flame} style={{ animationDelay: '0.3s' }} />
                        <div className={styles.flame} style={{ animationDelay: '0.6s' }} />
                        <div className={styles.ember} style={{ left: '30%', animationDelay: '0s' }} />
                        <div className={styles.ember} style={{ left: '50%', animationDelay: '1s' }} />
                        <div className={styles.ember} style={{ left: '70%', animationDelay: '2s' }} />
                    </div>
                </div>

                <div className={styles.windowScene}>
                    <div className={styles.windowSky} />
                    <div className={styles.windowCurtainLeft} />
                    <div className={styles.windowCurtainRight} />
                </div>

                <div className={styles.bookshelf}>
                    <div className={styles.bookRow}>
                        {['#8a4040', '#4a6a4a', '#c9a84c', '#5c3a4a', '#6a8090', '#b07848', '#9c6060'].map((c, i) => (
                            <div key={i} className={styles.book} style={{ background: c, height: `${30 + Math.random() * 20}px` }} />
                        ))}
                    </div>
                </div>

                {/* Tea cup */}
                <div className={styles.teaCup}>
                    <div className={styles.teaSteam}>
                        <div className={styles.steamLine} style={{ animationDelay: '0s' }} />
                        <div className={styles.steamLine} style={{ animationDelay: '0.8s' }} />
                        <div className={styles.steamLine} style={{ animationDelay: '1.6s' }} />
                    </div>
                </div>

                {/* AI art bird */}
                <div className={`${styles.bird} ${birdVisible ? styles.birdVisible : ''}`}>
                    🐦
                </div>

                {/* Lamp */}
                <div className={styles.deskLamp}>
                    <div className={styles.lampGlow} />
                </div>
            </div>

            {/* ── Vibe Selector (left sidebar) ─── */}
            <div className={styles.vibeBar}>
                <div className={styles.vibeTitle}>Set the mood</div>
                {VIBES.map(v => (
                    <button
                        key={v.id}
                        className={`${styles.vibeChip} ${selectedVibe.id === v.id ? styles.vibeChipActive : ''}`}
                        onClick={() => { setSelectedVibe(v); setAiArtReady(false); }}
                        style={{ '--vibe-color': v.color } as React.CSSProperties}
                    >
                        <span className={styles.vibeEmoji}>{v.emoji}</span>
                        <span className={styles.vibeLabel}>{v.label}</span>
                    </button>
                ))}
            </div>

            {/* ── Main desk / canvas area ─── */}
            <div className={styles.deskArea}>
                {viewMode === 'letter' && (
                    <>
                        {/* Letter canvas */}
                        <div
                            className={`${styles.letterCanvas} ${aiArtReady ? styles.letterCanvasArt : ''}`}
                            ref={canvasRef}
                            onDrop={handleCanvasDrop}
                            onDragOver={handleCanvasDragOver}
                            style={getStationeryStyle()}
                        >
                            {/* AI art border */}
                            {aiArtReady && (
                                <div className={styles.artBorder} style={{ borderColor: selectedVibe.color + '60' }}>
                                    <div className={styles.artCorner} style={{ top: 0, left: 0, borderColor: selectedVibe.color + '40' }} />
                                    <div className={styles.artCorner} style={{ top: 0, right: 0, borderColor: selectedVibe.color + '40' }} />
                                    <div className={styles.artCorner} style={{ bottom: 0, left: 0, borderColor: selectedVibe.color + '40' }} />
                                    <div className={styles.artCorner} style={{ bottom: 0, right: 0, borderColor: selectedVibe.color + '40' }} />
                                </div>
                            )}

                            {/* Header area */}
                            <div className={styles.letterHeader}>
                                <input
                                    className={styles.recipientInput}
                                    placeholder="Dear..."
                                    value={recipientName}
                                    onChange={e => setRecipientName(e.target.value)}
                                />
                            </div>

                            {/* Text area */}
                            <textarea
                                ref={textAreaRef}
                                className={styles.letterTextArea}
                                placeholder="Write your letter here... Take your time. There's no rush."
                                value={letterText}
                                onChange={e => setLetterText(e.target.value)}
                            />

                            {/* Placed stickers */}
                            {placedStickers.map(s => (
                                <div
                                    key={s.id}
                                    className={styles.placedSticker}
                                    style={{
                                        left: `${s.x}%`,
                                        top: `${s.y}%`,
                                        transform: `translate(-50%, -50%) rotate(${s.rotation}deg) scale(${s.scale})`,
                                    }}
                                    onClick={() => removeSticker(s.id)}
                                    title="Click to remove"
                                >
                                    {s.emoji}
                                </div>
                            ))}

                            {/* Character count */}
                            <div className={styles.charCount}>
                                {letterText.length > 0 && `${letterText.length} characters`}
                            </div>
                        </div>

                        {/* Action bar beneath canvas */}
                        <div className={styles.actionBar}>
                            <button
                                className={styles.actionBtn}
                                onClick={() => setViewMode('envelope')}
                                disabled={!letterText.trim() || !recipientName.trim()}
                            >
                                <span>✉</span> Seal & Send
                            </button>
                        </div>
                    </>
                )}

                {viewMode === 'envelope' && (
                    <div className={styles.envelopeView}>
                        <div
                            className={styles.envelope}
                            style={{ background: selectedEnvelope.bg }}
                        >
                            <div className={styles.envelopeFlap} style={{ borderBottomColor: selectedEnvelope.inner }} />
                            <div className={styles.envelopeFront}>
                                <p className={styles.envelopeTo}>{recipientName}</p>
                                {selectedStamp && (
                                    <div
                                        className={`${styles.envelopeSeal} ${sealPressed ? styles.sealBloomed : ''}`}
                                        style={{ background: selectedStamp.color }}
                                        onClick={() => setSealPressed(!sealPressed)}
                                    >
                                        <span>{selectedStamp.symbol}</span>
                                    </div>
                                )}
                            </div>
                            <p className={styles.envelopeSubtext}>
                                A letter from you • Arriving in 24 hours
                            </p>
                        </div>

                        {/* Envelope style picker */}
                        <div className={styles.envelopePicker}>
                            <p className={styles.pickerLabel}>Envelope Style</p>
                            <div className={styles.pickerRow}>
                                {ENVELOPE_STYLES.map(env => (
                                    <button
                                        key={env.id}
                                        className={`${styles.envelopeOption} ${selectedEnvelope.id === env.id ? styles.envelopeOptionActive : ''}`}
                                        style={{ background: env.bg }}
                                        onClick={() => setSelectedEnvelope(env)}
                                        title={env.label}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className={styles.envelopeActions}>
                            <button className={styles.backBtn} onClick={() => setViewMode('letter')}>
                                ← Back to letter
                            </button>
                            <button className={styles.sendBtn} onClick={handleSend}>
                                Send this letter ✦
                            </button>
                        </div>
                    </div>
                )}

                {viewMode === 'sending' && (
                    <div className={styles.sendingView}>
                        <div className={`${styles.sendingLetter} ${sendPhase >= 0 ? styles.letterFolding : ''}`}>
                            <div className={styles.sendingLetterContent} style={getStationeryStyle()}>
                                <p className={styles.sendingPreview}>{letterText.slice(0, 80)}...</p>
                            </div>
                        </div>

                        {sendPhase >= 1 && (
                            <div className={`${styles.sendingEnvelope} ${sendPhase >= 3 ? styles.envelopeFloating : ''}`}
                                style={{ background: selectedEnvelope.bg }}>
                                <div className={styles.sendingEnvelopeFront}>
                                    <p className={styles.sendingTo}>{recipientName}</p>
                                </div>
                                {sendPhase >= 2 && (
                                    <div
                                        className={`${styles.sendingSeal} ${styles.sealBlooming}`}
                                        style={{ background: selectedStamp.color }}
                                    >
                                        <span>{selectedStamp.symbol}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <p className={styles.sendingStatus}>
                            {sendPhase === 0 && 'Folding your letter...'}
                            {sendPhase === 1 && 'Sliding into the envelope...'}
                            {sendPhase === 2 && 'Pressing the seal...'}
                            {sendPhase === 3 && 'Sending it on its way...'}
                        </p>
                    </div>
                )}
            </div>

            {/* ── Sticker Tin (bottom) ─── */}
            <div className={`${styles.stickerTin} ${stickerTinOpen ? styles.stickerTinOpen : ''}`}>
                <button
                    className={styles.tinLid}
                    onClick={() => { setStickerTinOpen(!stickerTinOpen); setStampDrawerOpen(false); }}
                >
                    <span className={styles.tinLabel}>🎨 Stickers</span>
                    <span className={styles.tinToggle}>{stickerTinOpen ? '▼' : '▲'}</span>
                </button>
                {stickerTinOpen && (
                    <div className={styles.tinContents}>
                        {STICKERS.map(s => (
                            <div
                                key={s.id}
                                className={styles.stickerItem}
                                draggable
                                onDragStart={() => handleStickerDragStart(s)}
                                title={s.label}
                            >
                                {s.emoji}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Stamp Drawer (right side) ─── */}
            <div className={`${styles.stampDrawer} ${stampDrawerOpen ? styles.stampDrawerOpen : ''}`}>
                <button
                    className={styles.drawerHandle}
                    onClick={() => { setStampDrawerOpen(!stampDrawerOpen); setStickerTinOpen(false); }}
                >
                    <span>Seals</span>
                </button>
                {stampDrawerOpen && (
                    <div className={styles.drawerContents}>
                        <div className={styles.velvetLiner}>
                            {STAMPS.map(st => (
                                <button
                                    key={st.id}
                                    className={`${styles.stampItem} ${selectedStamp.id === st.id ? styles.stampItemActive : ''}`}
                                    onClick={() => setSelectedStamp(st)}
                                    style={{ '--stamp-color': st.color } as React.CSSProperties}
                                >
                                    <div className={styles.waxSeal} style={{ background: st.color }}>
                                        <span>{st.symbol}</span>
                                    </div>
                                    <span className={styles.stampLabel}>{st.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
