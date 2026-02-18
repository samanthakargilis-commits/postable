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
    { id: 's1', type: 'image', label: 'Rose', imageUrl: '/stickers/rose.png' },
    { id: 's2', type: 'image', label: 'Butterfly', imageUrl: '/stickers/butterfly.png' },
    { id: 's3', type: 'image', label: 'Sunflower', imageUrl: '/stickers/sunflower.png' },
    { id: 's4', type: 'image', label: 'Teacup', imageUrl: '/stickers/teacup.png' },
    { id: 's5', type: 'image', label: 'Strawberry', imageUrl: '/stickers/strawberry.png' },
    { id: 's6', type: 'image', label: 'Bouquet', imageUrl: '/stickers/bouquet.png' },
    { id: 's7', type: 'image', label: 'Robin', imageUrl: '/stickers/bird.png' },
    { id: 's8', type: 'image', label: 'Figs', imageUrl: '/stickers/fig.png' },
    { id: 's9', type: 'image', label: 'Candles', imageUrl: '/stickers/candles.png' },
    { id: 's10', type: 'image', label: 'Lemon', imageUrl: '/stickers/lemon.png' },
    { id: 's11', type: 'image', label: 'Olive Oil', imageUrl: '/stickers/olive-oil.png' },
    { id: 'custom', type: 'custom', label: 'Custom...', emoji: '✏️' },
    { id: 'upload', type: 'upload', label: 'Upload', emoji: '📸' },
];

const STAMPS = [
    { id: 'wax-red', label: 'Ruby Wax', color: '#8a2030', symbol: '♥', isCustom: false },
    { id: 'wax-gold', label: 'Gold Wax', color: '#c9a84c', symbol: '✦', isCustom: false },
    { id: 'wax-sage', label: 'Sage Wax', color: '#6e8a5a', symbol: '✿', isCustom: false },
    { id: 'wax-plum', label: 'Plum Wax', color: '#5c3a4a', symbol: '✧', isCustom: false },
    { id: 'wax-pink', label: 'Blush Wax', color: '#c07878', symbol: '❀', isCustom: false },
    { id: 'wax-navy', label: 'Navy Wax', color: '#2a3a5a', symbol: '⚜', isCustom: false },
    { id: 'custom-stamp', label: 'Custom', color: '#4a3a3a', symbol: '?', isCustom: true },
];

const ENVELOPE_STYLES = [
    { id: 'cream', label: 'Cream', bg: 'linear-gradient(135deg, #f5efe6, #e8dcc8)', inner: '#dccab0', isDark: false },
    { id: 'blush', label: 'Blush', bg: 'linear-gradient(135deg, #f0d0d0, #e8b8b8)', inner: '#daa8a8', isDark: false },
    { id: 'sage', label: 'Sage', bg: 'linear-gradient(135deg, #d0dcc8, #b8c8a8)', inner: '#a8b898', isDark: false },
    { id: 'midnight', label: 'Midnight', bg: 'linear-gradient(135deg, #2a2a4e, #1a1a3a)', inner: '#3a3a5e', isDark: true },
];

type StickerData = {
    id: string;
    type: string;
    label: string;
    imageUrl?: string;
    emoji?: string;
};

type PlacedSticker = {
    id: string;
    stickerId: string;
    type: string;
    imageUrl?: string;
    emoji?: string;
    customText?: string;
    x: number;
    y: number;
    rotation: number;
    scale: number;
};

type ViewMode = 'letter' | 'chooseEnvelope' | 'chooseSeal' | 'sending' | 'sent';

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
    const [draggedSticker, setDraggedSticker] = useState<StickerData | null>(null);
    const [draggingPlacedId, setDraggingPlacedId] = useState<string | null>(null);
    const [sealPressed, setSealPressed] = useState(false);
    const [sendPhase, setSendPhase] = useState(0);
    const [stamperActive, setStamperActive] = useState(false);

    // Recipient contact
    const [recipientContact, setRecipientContact] = useState('');
    const [contactType, setContactType] = useState<'email' | 'phone'>('email');

    // Custom options
    const [customEnvelopeText, setCustomEnvelopeText] = useState('');
    const [customSealText, setCustomSealText] = useState('');
    const [showCustomStickerInput, setShowCustomStickerInput] = useState(false);
    const [customStickerText, setCustomStickerText] = useState('');

    const canvasRef = useRef<HTMLDivElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
    const handleStickerDragStart = useCallback((sticker: StickerData) => {
        if (sticker.id === 'upload') {
            fileInputRef.current?.click();
            return;
        }
        if (sticker.id === 'custom') {
            setShowCustomStickerInput(true);
            return;
        }
        setDraggedSticker(sticker);
    }, []);

    const handleCanvasDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Re-positioning an already placed sticker
        if (draggingPlacedId) {
            setPlacedStickers(prev => prev.map(s =>
                s.id === draggingPlacedId ? { ...s, x, y } : s
            ));
            setDraggingPlacedId(null);
            return;
        }

        if (!draggedSticker) return;

        setPlacedStickers(prev => [...prev, {
            id: `placed-${Date.now()}`,
            stickerId: draggedSticker.id,
            type: draggedSticker.type,
            imageUrl: draggedSticker.imageUrl,
            emoji: draggedSticker.emoji,
            x,
            y,
            rotation: -15 + Math.random() * 30,
            scale: 0.9 + Math.random() * 0.3,
        }]);
        setDraggedSticker(null);
    }, [draggedSticker, draggingPlacedId]);

    const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const handlePlacedStickerDragStart = useCallback((e: React.DragEvent, stickerId: string) => {
        setDraggingPlacedId(stickerId);
        // Make the drag preview transparent
        const img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(img, 0, 0);
    }, []);

    const removeSticker = useCallback((id: string) => {
        setPlacedStickers(prev => prev.filter(s => s.id !== id));
    }, []);

    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const url = ev.target?.result as string;
            setDraggedSticker({ id: 'uploaded-' + Date.now(), type: 'upload', label: 'Uploaded', imageUrl: url });
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    }, []);

    const handleCustomStickerAdd = useCallback(() => {
        if (!customStickerText.trim()) return;
        setDraggedSticker({ id: 'custom-' + Date.now(), type: 'custom', label: customStickerText, emoji: customStickerText });
        setShowCustomStickerInput(false);
        setCustomStickerText('');
    }, [customStickerText]);

    /* ── Send Flow ─── */
    const handleSend = useCallback(() => {
        if (!letterText.trim() || !recipientName.trim() || !recipientContact.trim()) return;
        setViewMode('sending');
        setSendPhase(0);

        setTimeout(() => setSendPhase(1), 1500);
        setTimeout(() => {
            setSealPressed(true);
            setSendPhase(2);
        }, 3000);
        setTimeout(() => setSendPhase(3), 4500);
        setTimeout(() => setViewMode('sent'), 6500);
    }, [letterText, recipientName, recipientContact]);

    const handleStampSeal = useCallback(() => {
        setStamperActive(true);
        setTimeout(() => {
            setSealPressed(true);
            setStamperActive(false);
        }, 1000);
    }, []);

    const isDarkEnvelope = useCallback(() => {
        return selectedEnvelope.isDark || (selectedEnvelope.id === 'custom' && customEnvelopeText.toLowerCase().match(/dark|midnight|navy|black|deep/));
    }, [selectedEnvelope, customEnvelopeText]);

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

    /* ── Render Sticker on Canvas ─── */
    const renderPlacedSticker = (s: PlacedSticker) => {
        if (s.type === 'image' || s.type === 'upload') {
            return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={s.imageUrl}
                    alt={s.stickerId}
                    className={`${styles.stickerImage} ${s.type === 'upload' ? styles.stickerImageUpload : ''}`}
                    draggable={false}
                />
            );
        }
        if (s.type === 'custom') {
            return <span className={styles.customStickerText}>{s.emoji}</span>;
        }
        return <span>{s.emoji || '✨'}</span>;
    };

    /* ══════════════════════════════════
       SENT SCREEN
       ══════════════════════════════════ */
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
                    <p className={styles.sentContact}>via {contactType}: {recipientContact}</p>
                    <p className={styles.sentTimer}>Arriving in 24 hours</p>
                    <button className={styles.sentButton} onClick={() => {
                        setViewMode('letter');
                        setLetterText('');
                        setRecipientName('');
                        setRecipientContact('');
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

                <div className={styles.teaCup}>
                    <div className={styles.teaSteam}>
                        <div className={styles.steamLine} style={{ animationDelay: '0s' }} />
                        <div className={styles.steamLine} style={{ animationDelay: '0.8s' }} />
                        <div className={styles.steamLine} style={{ animationDelay: '1.6s' }} />
                    </div>
                </div>

                <div className={`${styles.bird} ${birdVisible ? styles.birdVisible : ''}`}>
                    🐦
                </div>

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

                            {/* Placed stickers — now draggable */}
                            {placedStickers.map(s => (
                                <div
                                    key={s.id}
                                    className={styles.placedSticker}
                                    style={{
                                        left: `${s.x}%`,
                                        top: `${s.y}%`,
                                        transform: `translate(-50%, -50%) rotate(${s.rotation}deg) scale(${s.scale})`,
                                    }}
                                    draggable
                                    onDragStart={(e) => handlePlacedStickerDragStart(e, s.id)}
                                    title="Drag to move"
                                >
                                    {renderPlacedSticker(s)}
                                    <button
                                        className={styles.stickerRemoveBtn}
                                        onClick={(e) => { e.stopPropagation(); removeSticker(s.id); }}
                                        title="Remove sticker"
                                    >
                                        ✕
                                    </button>
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
                                onClick={() => setViewMode('chooseEnvelope')}
                                disabled={!letterText.trim() || !recipientName.trim()}
                            >
                                <span>✉</span> Design Your Envelope
                            </button>
                        </div>
                    </>
                )}

                {/* ══════════════════════════════════
                   STEP 1: CHOOSE ENVELOPE
                   ══════════════════════════════════ */}
                {viewMode === 'chooseEnvelope' && (
                    <div className={styles.envelopeView}>
                        <div className={styles.envelopeFlowSteps}>
                            <div className={`${styles.stepIndicator} ${styles.stepActive}`}>1. Envelope</div>
                            <div className={styles.stepIndicator}>2. Address</div>
                            <div className={styles.stepIndicator}>3. Seal</div>
                        </div>

                        {/* Envelope preview — OPEN */}
                        <div
                            className={`${styles.envelope} ${styles.envelopeOpen}`}
                            style={{
                                background: selectedEnvelope.id === 'custom' && customEnvelopeText
                                    ? `linear-gradient(135deg, #4a4a4a, #2a2a2a)`
                                    : selectedEnvelope.bg
                            }}
                        >
                            <div className={styles.envelopeFlap} style={{ borderBottomColor: selectedEnvelope.inner }} />
                            <div className={styles.envelopeFront}>
                                <p className={`${styles.envelopeTo} ${isDarkEnvelope() ? styles.envelopeToLight : ''}`}>{recipientName}</p>
                            </div>
                            <p className={`${styles.envelopeSubtext} ${isDarkEnvelope() ? styles.envelopeSubtextLight : ''}`}>
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
                                <button
                                    className={`${styles.envelopeOption} ${styles.envelopeOptionCustom} ${selectedEnvelope.id === 'custom' ? styles.envelopeOptionActive : ''}`}
                                    onClick={() => setSelectedEnvelope({ id: 'custom', label: 'Custom', bg: '#4a4a4a', inner: '#3a3a3a', isDark: true })}
                                    title="Custom"
                                >
                                    ?
                                </button>
                            </div>
                            {selectedEnvelope.id === 'custom' && (
                                <input
                                    className={styles.customTextInput}
                                    placeholder="Describe your envelope (e.g. 'Deep ocean blue')..."
                                    value={customEnvelopeText}
                                    onChange={e => setCustomEnvelopeText(e.target.value)}
                                />
                            )}
                        </div>

                        <div className={styles.envelopeActions}>
                            <button className={styles.backBtn} onClick={() => setViewMode('letter')}>
                                ← Back to letter
                            </button>
                            <button className={styles.sendBtn} onClick={() => setViewMode('chooseSeal')}>
                                Next: Address & Seal →
                            </button>
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════
                   STEP 2: CHOOSE SEAL (+ Address)
                   ══════════════════════════════════ */}
                {viewMode === 'chooseSeal' && (
                    <div className={styles.envelopeView}>
                        <div className={styles.envelopeFlowSteps}>
                            <div className={styles.stepIndicator}>1. Envelope</div>
                            <div className={`${styles.stepIndicator} ${!sealPressed ? styles.stepActive : ''}`}>2. Address</div>
                            <div className={`${styles.stepIndicator} ${sealPressed ? styles.stepActive : ''}`}>3. Seal</div>
                        </div>

                        {/* Envelope preview — CLOSED */}
                        <div
                            className={`${styles.envelope} ${styles.envelopeClosed}`}
                            style={{
                                background: selectedEnvelope.id === 'custom' && customEnvelopeText
                                    ? `linear-gradient(135deg, #4a4a4a, #2a2a2a)`
                                    : selectedEnvelope.bg
                            }}
                        >
                            <div className={styles.envelopeFlap} style={{ borderBottomColor: selectedEnvelope.inner }} />
                            <div className={styles.envelopeFront}>
                                <p className={`${styles.envelopeTo} ${isDarkEnvelope() ? styles.envelopeToLight : ''}`}>{recipientName}</p>

                                {/* Stamper animation container */}
                                <div className={styles.stamperContainer}>
                                    <div className={`${styles.stamper} ${stamperActive ? styles.stamperPressing : ''}`}>
                                        <div className={styles.stamperHandle} />
                                        <div className={styles.stamperHead} style={{ background: selectedStamp.color }}>
                                            <span>{selectedStamp.symbol}</span>
                                        </div>
                                    </div>
                                </div>

                                {sealPressed && (
                                    <div
                                        className={`${styles.envelopeSeal} ${styles.sealBloomed}`}
                                        style={{ background: selectedStamp.color }}
                                    >
                                        <span>{selectedStamp.symbol}</span>
                                    </div>
                                )}
                            </div>
                            <p className={`${styles.envelopeSubtext} ${isDarkEnvelope() ? styles.envelopeSubtextLight : ''}`}>
                                A letter from you • Arriving in 24 hours
                            </p>
                        </div>

                        {/* Recipient contact — like writing an address on the envelope */}
                        <div className={styles.addressSection}>
                            <p className={styles.pickerLabel}>Recipient&apos;s Contact</p>
                            <div className={styles.contactRow}>
                                <button
                                    className={`${styles.contactToggle} ${contactType === 'email' ? styles.contactToggleActive : ''}`}
                                    onClick={() => setContactType('email')}
                                >
                                    ✉ Email
                                </button>
                                <button
                                    className={`${styles.contactToggle} ${contactType === 'phone' ? styles.contactToggleActive : ''}`}
                                    onClick={() => setContactType('phone')}
                                >
                                    📱 Phone
                                </button>
                            </div>
                            <input
                                className={styles.contactInput}
                                placeholder={contactType === 'email' ? 'name@email.com' : '(555) 123-4567'}
                                value={recipientContact}
                                onChange={e => setRecipientContact(e.target.value)}
                                type={contactType === 'email' ? 'email' : 'tel'}
                            />
                        </div>

                        {/* Seal picker */}
                        <div className={styles.sealPicker}>
                            <p className={styles.pickerLabel}>Choose Your Wax Seal</p>
                            <div className={styles.sealRow}>
                                {STAMPS.map(st => (
                                    <button
                                        key={st.id}
                                        className={`${styles.sealOption} ${selectedStamp.id === st.id ? styles.sealOptionActive : ''}`}
                                        onClick={() => { setSelectedStamp(st); setSealPressed(false); setStamperActive(false); }}
                                        style={{ '--stamp-color': st.color } as React.CSSProperties}
                                    >
                                        <div className={styles.waxSealPreview} style={{ background: st.color }}>
                                            <span>{st.symbol}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            {selectedStamp.isCustom && (
                                <input
                                    className={styles.customTextInput}
                                    placeholder="Enter seal symbol or description..."
                                    value={customSealText}
                                    onChange={e => setCustomSealText(e.target.value)}
                                />
                            )}
                        </div>

                        <div className={styles.envelopeActions}>
                            <button className={styles.backBtn} onClick={() => { setViewMode('chooseEnvelope'); setSealPressed(false); setStamperActive(false); }}>
                                ← Back to envelope
                            </button>
                            {!sealPressed ? (
                                <button
                                    className={styles.sendBtn}
                                    onClick={handleStampSeal}
                                    disabled={!recipientContact.trim()}
                                >
                                    Press Seal ✧
                                </button>
                            ) : (
                                <button className={styles.sendBtn} onClick={handleSend}>
                                    Send this letter ✦
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Sending Animation ─── */}
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
                                    <p className={`${styles.sendingTo} ${isDarkEnvelope() ? styles.envelopeToLight : ''}`}>{recipientName}</p>
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
                                className={`${styles.stickerItem} ${s.type === 'image' ? styles.stickerItemImage : ''}`}
                                draggable={s.type === 'image'}
                                onDragStart={() => handleStickerDragStart(s)}
                                onClick={() => {
                                    if (s.type === 'custom' || s.type === 'upload') {
                                        handleStickerDragStart(s);
                                    }
                                }}
                                title={s.label}
                            >
                                {s.type === 'image' ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={s.imageUrl} alt={s.label} className={styles.stickerThumbnail} draggable={false} />
                                ) : (
                                    <span className={styles.stickerEmoji}>{s.emoji}</span>
                                )}
                                <span className={styles.stickerName}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Custom Sticker Modal ─── */}
            {showCustomStickerInput && (
                <div className={styles.customStickerModal} onClick={() => setShowCustomStickerInput(false)}>
                    <div className={styles.customStickerBox} onClick={e => e.stopPropagation()}>
                        <p className={styles.customStickerTitle}>Create Custom Sticker</p>
                        <input
                            className={styles.customStickerInput}
                            placeholder="Type your sticker text..."
                            value={customStickerText}
                            onChange={e => setCustomStickerText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCustomStickerAdd()}
                            autoFocus
                        />
                        <p className={styles.customStickerHint}>Press Enter or click Add, then drag it onto your letter</p>
                        <button className={styles.customStickerAddBtn} onClick={handleCustomStickerAdd}>
                            Add Sticker
                        </button>
                    </div>
                </div>
            )}

            {/* Hidden file input for image upload */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
            />

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

            {/* Drag hint when dragging a sticker */}
            {(draggedSticker && viewMode === 'letter') && (
                <div className={styles.dragHint}>
                    Drop on your letter ↗
                </div>
            )}
        </div>
    );
}
