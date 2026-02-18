'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function CottageEntrance() {
  const router = useRouter();
  const [hasKnocked, setHasKnocked] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [entering, setEntering] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [snowflakes, setSnowflakes] = useState<Array<{ id: number; left: number; delay: number; duration: number; size: number }>>([]);

  // Generate snowflakes on mount
  useEffect(() => {
    const flakes = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 4 + Math.random() * 6,
      size: 2 + Math.random() * 4,
    }));
    setSnowflakes(flakes);
    // Show title after a brief moment
    const t = setTimeout(() => setShowTitle(true), 600);
    return () => clearTimeout(t);
  }, []);

  const handleKnock = useCallback(() => {
    if (hasKnocked) return;
    setHasKnocked(true);

    // Door opens after knock
    setTimeout(() => setDoorOpen(true), 800);

    // Start entering animation
    setTimeout(() => setEntering(true), 1800);

    // Navigate to writing room
    setTimeout(() => router.push('/create'), 3000);
  }, [hasKnocked, router]);

  return (
    <div className={styles.scene}>
      {/* Sky gradient */}
      <div className={styles.sky}>
        <div className={styles.stars}>
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className={styles.star}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 50}%`,
                animationDelay: `${Math.random() * 3}s`,
                width: `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Snowfall */}
      <div className={styles.snowContainer}>
        {snowflakes.map((f) => (
          <div
            key={f.id}
            className={styles.snowflake}
            style={{
              left: `${f.left}%`,
              animationDelay: `${f.delay}s`,
              animationDuration: `${f.duration}s`,
              width: `${f.size}px`,
              height: `${f.size}px`,
            }}
          />
        ))}
      </div>

      {/* Ground / snow */}
      <div className={styles.ground} />

      {/* Cottage */}
      <div className={`${styles.cottage} ${entering ? styles.cottageEntering : ''}`}>
        {/* Chimney */}
        <div className={styles.chimney}>
          <div className={styles.smoke}>
            <div className={styles.smokeParticle} style={{ animationDelay: '0s' }} />
            <div className={styles.smokeParticle} style={{ animationDelay: '1.5s' }} />
            <div className={styles.smokeParticle} style={{ animationDelay: '3s' }} />
          </div>
        </div>

        {/* Roof */}
        <div className={styles.roof}>
          <div className={styles.roofSnow} />
        </div>

        {/* House body */}
        <div className={styles.houseBody}>
          {/* Windows */}
          <div className={styles.windowLeft}>
            <div className={`${styles.windowGlow} ${hasKnocked ? styles.windowGlowBright : ''}`} />
            <div className={styles.windowFrame}>
              <div className={styles.windowPane} />
              <div className={styles.windowPane} />
              <div className={styles.windowPane} />
              <div className={styles.windowPane} />
            </div>
            <div className={styles.windowBox}>
              <div className={styles.snowOnBox} />
            </div>
          </div>

          <div className={styles.windowRight}>
            <div className={`${styles.windowGlow} ${hasKnocked ? styles.windowGlowBright : ''}`} />
            <div className={styles.windowFrame}>
              <div className={styles.windowPane} />
              <div className={styles.windowPane} />
              <div className={styles.windowPane} />
              <div className={styles.windowPane} />
            </div>
            <div className={styles.windowBox}>
              <div className={styles.snowOnBox} />
            </div>
          </div>

          {/* Door */}
          <div className={styles.doorFrame}>
            <div className={styles.doorWarmLight} style={{ opacity: doorOpen ? 1 : 0 }} />
            <div
              className={`${styles.door} ${doorOpen ? styles.doorOpen : ''}`}
              onClick={handleKnock}
              role="button"
              tabIndex={0}
              aria-label="Knock on the door"
            >
              <div className={styles.doorPanel} />
              <div className={styles.doorPanel} />
              <div className={styles.doorKnob} />
            </div>
          </div>

          {/* Porch */}
          <div className={styles.porch}>
            <div className={styles.porchLight}>
              <div className={`${styles.porchLightGlow} ${hasKnocked ? styles.porchLightBright : ''}`} />
            </div>
          </div>
        </div>

        {/* Garden path */}
        <div className={styles.path} />
      </div>

      {/* Title overlay */}
      <div className={`${styles.titleOverlay} ${showTitle ? styles.titleVisible : ''} ${entering ? styles.titleHiding : ''}`}>
        <h1 className={styles.title}>Postable</h1>
        <p className={styles.subtitle}>Letters worth waiting for</p>
        {!hasKnocked && (
          <p className={styles.prompt}>
            <span className={styles.promptIcon}>✦</span>
            Knock on the door to come inside
            <span className={styles.promptIcon}>✦</span>
          </p>
        )}
        {hasKnocked && !doorOpen && (
          <p className={styles.knockFeedback}>
            <em>knock knock…</em>
          </p>
        )}
      </div>

      {/* Warm light flash on entering */}
      <div className={`${styles.warmFlash} ${entering ? styles.warmFlashActive : ''}`} />
    </div>
  );
}
