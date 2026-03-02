'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/context';
import { getLocalizedText } from '@/i18n/utils';
import Image from 'next/image';
import styles from './TicketDetail.module.css';

interface TicketDetailProps {
  title: string | Record<string, string>;
  description: string | Record<string, string>;
  duration: string | Record<string, string>;
  priceAdult: number;
  priceChild: number;
  slug: string;
  averageRating?: string;
  reviewCount?: number;
}

interface Closures {
  dates: string[];
  slots: Record<string, string[]>;
}

const SLOT_RANGES: Record<string, { start: string; end: string }> = {
  louvre: { start: '09:30', end: '16:00' },
  eiffel: { start: '09:00', end: '18:00' },
  seine: { start: '10:00', end: '20:00' },
};

const LOCALE_MAP = {
  en: 'en-US',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
  it: 'it-IT',
} as const;

function toIsoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function parseTimeToMinutes(time: string) {
  const [hh, mm] = time.split(':').map(Number);
  return hh * 60 + mm;
}

function minutesToTime(total: number) {
  const hh = String(Math.floor(total / 60)).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

function buildTimeSlots(start: string, end: string, stepMinutes: number) {
  const slots: string[] = [];
  for (
    let current = parseTimeToMinutes(start), max = parseTimeToMinutes(end);
    current <= max;
    current += stepMinutes
  ) {
    slots.push(minutesToTime(current));
  }
  return slots;
}

const FALLBACK: Record<
  string,
  {
    longDescription: string;
    included: string;
    notIncluded: string;
    important: string;
    meetingPoint: string;
    mapSrc: string;
  }
> = {
  louvre: {
    longDescription:
      '<p>Explore the Louvre at your own pace with an easy e‑ticket and optional audio guide.</p>',
    included:
      '<ul><li>Entrance ticket to the Louvre Museum</li><li>Access to permanent collections</li><li>Digital confirmation and mobile ticket</li></ul>',
    notIncluded:
      '<ul><li>Guided tour with a live guide</li><li>Hotel pickup and drop‑off</li><li>Food and drinks</li></ul>',
    important:
      '<ul><li>Security checks are mandatory – allow extra time.</li><li>Large bags are not allowed.</li></ul>',
    meetingPoint:
      '<p>Louvre Museum, main entrance under the glass pyramid.</p>',
    mapSrc: 'https://www.google.com/maps?q=Louvre%20Museum%20Paris&output=embed',
  },
  eiffel: {
    longDescription:
      '<p>Visit the Eiffel Tower and enjoy unforgettable views over Paris.</p>',
    included:
      '<ul><li>Access to the Eiffel Tower</li><li>Elevator access</li><li>Digital confirmation</li></ul>',
    notIncluded:
      '<ul><li>Guided tour</li><li>Hotel transfers</li><li>Food and drinks</li></ul>',
    important:
      '<ul><li>Security checks at entrance.</li><li>Summit may close in bad weather.</li></ul>',
    meetingPoint:
      '<p>Eiffel Tower, Champ de Mars, 75007 Paris.</p>',
    mapSrc: 'https://www.google.com/maps?q=Eiffel%20Tower%20Paris&output=embed',
  },
  seine: {
    longDescription:
      '<p>Enjoy a relaxing cruise on the Seine River.</p>',
    included:
      '<ul><li>Seine River cruise ticket</li><li>Covered boat</li><li>Audio commentary</li></ul>',
    notIncluded:
      '<ul><li>Hotel pickup</li><li>Drinks on board</li><li>Reserved seating</li></ul>',
    important:
      '<ul><li>Arrive 15–20 minutes early.</li><li>Cruises operate in most weather.</li></ul>',
    meetingPoint:
      '<p>Central Seine River pier (details in confirmation).</p>',
    mapSrc: 'https://www.google.com/maps?q=Seine%20River%20Cruise%20Paris&output=embed',
  },
};

export function TicketDetail({
  title,
  description,
  duration,
  priceAdult,
  priceChild,
  slug,
  averageRating,
  reviewCount,
}: TicketDetailProps) {
  const { t, locale } = useI18n();
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [visitDate, setVisitDate] = useState(() => toIsoDate(new Date()));
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
  const [visitTime, setVisitTime] = useState(SLOT_RANGES[slug]?.start || '09:00');

  const bookingRef = useRef<HTMLDivElement>(null);
  const [showStickyCta, setShowStickyCta] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isBookingVisible, setIsBookingVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsBookingVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    if (bookingRef.current) {
      observer.observe(bookingRef.current);
    }
    return () => observer.disconnect();
  }, [bookingRef]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY - 5) {
        setShowStickyCta(true);
      } else if (currentScrollY > lastScrollY + 5) {
        setShowStickyCta(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{
    fullName?: boolean;
    email?: boolean;
    confirmEmail?: boolean;
    phone?: boolean;
    emailMismatch?: boolean;
  }>({});

  const [fetchedDetail, setFetchedDetail] = useState<{
    longDescription?: string | Record<string, string>;
    included?: string | Record<string, string>;
    notIncluded?: string | Record<string, string>;
    important?: string | Record<string, string>;
    meetingPoint?: string | Record<string, string>;
    mapSrc?: string;
    images?: string[];
    thumbnail?: string;
    closures?: Closures;
    openingTime?: string;
    closingTime?: string;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/tickets/${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setFetchedDetail(data ?? null))
      .catch(() => setFetchedDetail(null));
  }, [slug]);

  const fb = FALLBACK[slug] || {
    longDescription: '',
    included: '',
    notIncluded: '',
    important: '',
    meetingPoint: '',
    mapSrc: '',
  };
  const detail = {
    longDescription: getLocalizedText(fetchedDetail?.longDescription, locale) || fb.longDescription,
    included: getLocalizedText(fetchedDetail?.included, locale) || fb.included,
    notIncluded: getLocalizedText(fetchedDetail?.notIncluded, locale) || fb.notIncluded,
    important: getLocalizedText(fetchedDetail?.important, locale) || fb.important,
    meetingPoint: getLocalizedText(fetchedDetail?.meetingPoint, locale) || fb.meetingPoint,
    mapSrc: fetchedDetail?.mapSrc || fb.mapSrc,
  };

  const allImages = fetchedDetail?.images || [];
  const thumbnail = fetchedDetail?.thumbnail;
  const images = Array.from(new Set(thumbnail ? [thumbnail, ...allImages] : allImages));
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  useEffect(() => {
    setActiveImageIdx(0);
  }, [slug]);

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.targetTouches[0].clientX;
    setTouchEndX(currentX);
    setSwipeOffset(currentX - touchStartX);
  };

  const onTouchEnd = () => {
    setIsSwiping(false);
    if (!touchStartX || !touchEndX) {
      setSwipeOffset(0);
      return;
    }
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) handleNextImage();
    else if (distance < -minSwipeDistance) handlePrevImage();

    setSwipeOffset(0);
  };

  const closures: Closures = fetchedDetail?.closures ?? { dates: [], slots: {} };

  const total = adults * priceAdult + children * priceChild;
  const startT = fetchedDetail?.openingTime || SLOT_RANGES[slug]?.start || '09:00';
  const endT = fetchedDetail?.closingTime || SLOT_RANGES[slug]?.end || '18:00';
  const timeSlots = buildTimeSlots(startT, endT, 30);
  const today = startOfDay(new Date());
  const selectedDate = startOfDay(new Date(visitDate));
  const monthTitle = new Intl.DateTimeFormat(LOCALE_MAP[locale], {
    month: 'long',
    year: 'numeric',
  }).format(viewMonth);
  const dayFormatter = new Intl.DateTimeFormat(LOCALE_MAP[locale], {
    weekday: 'short',
  });
  const weekdayHeaders = Array.from({ length: 7 }, (_, idx) => {
    const date = new Date(2024, 0, 1 + idx);
    return dayFormatter.format(date);
  });

  const firstOfMonth = startOfMonth(viewMonth);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7;
  const firstVisibleDay = new Date(firstOfMonth);
  firstVisibleDay.setDate(firstOfMonth.getDate() - startWeekday);
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const day = new Date(firstVisibleDay);
    day.setDate(firstVisibleDay.getDate() + index);
    return day;
  });

  const isDateClosed = (iso: string) => closures.dates.includes(iso);
  const isSlotClosed = (iso: string, slot: string) =>
    isDateClosed(iso) || (closures.slots[iso]?.includes(slot) ?? false);

  useEffect(() => {
    setViewMonth(startOfMonth(selectedDate));
  }, [visitDate]);

  useEffect(() => {
    if (!timeSlots.includes(visitTime)) {
      setVisitTime(timeSlots[0]);
    }
  }, [slug, visitTime, timeSlots]);

  const increment = (setter: (n: number) => void, current: number) => {
    if (current < 10) setter(current + 1);
  };
  const decrement = (setter: (n: number) => void, current: number, min: number = 0) => {
    if (current > min) setter(current - 1);
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const handleBuy = async () => {
    const newErrors = {
      fullName: !fullName.trim(),
      email: !email.trim(),
      confirmEmail: !confirmEmail.trim(),
      phone: !phone.trim(),
      emailMismatch: email.trim() !== confirmEmail.trim() && !!email.trim() && !!confirmEmail.trim(),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug,
          title: getLocalizedText(title, 'en'),
          date: visitDate,
          time: visitTime,
          adults,
          children,
          priceAdult,
          priceChild,
          total,
          customer: {
            fullName,
            email,
            phone,
          },
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Something went wrong during checkout.');
      }
    } catch (err) {
      alert('Failed to initialize checkout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const scrollToBooking = () => {
    setShowStickyCta(false);
    bookingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={styles.wrap}>
      <Link href="/" className={styles.back}>
        ← {t('nav.home')}
      </Link>

      <div className={styles.layout}>
        <div className={styles.leftCol}>
          <div className={styles.media}>
            {images.length > 0 ? (
              <div className={styles.mediaGallery}>
                <div
                  className={styles.heroImageWrap}
                  onClick={() => setIsLightboxOpen(true)}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  <div
                    className={styles.heroSliderTrack}
                    style={{
                      transform: `translateX(calc(-${activeImageIdx * 100}% + ${swipeOffset}px))`,
                      transition: isSwiping ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
                    }}
                  >
                    {images.map((src, idx) => (
                      <div key={idx} className={styles.heroSlide}>
                        <Image src={src} alt={`${getLocalizedText(title, locale)} ${idx + 1}`} fill className={styles.heroImage} priority={idx === 0} />
                      </div>
                    ))}
                  </div>
                  {images.length > 1 && (
                    <>
                      <button className={`${styles.sliderBtn} ${styles.sliderBtnLeft}`} onClick={handlePrevImage} aria-label="Previous image">
                        ‹
                      </button>
                      <button className={`${styles.sliderBtn} ${styles.sliderBtnRight}`} onClick={handleNextImage} aria-label="Next image">
                        ›
                      </button>
                    </>
                  )}
                </div>
                {images.length > 1 && (
                  <div className={styles.thumbnailStrip}>
                    {images.map((src, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`${styles.miniThumbBtn} ${idx === activeImageIdx ? styles.miniThumbBtnActive : ''}`}
                        onClick={() => setActiveImageIdx(idx)}
                      >
                        <Image src={src} alt={`${getLocalizedText(title, locale)} image ${idx + 1}`} fill className={styles.miniThumbImg} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.placeholder} data-slug={slug} />
            )}
          </div>

          <section className={styles.details}>
            <div className={styles.detailsIntro}>
              <h2>{getLocalizedText(title, locale)}</h2>
              {averageRating && Number(averageRating) > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '15px', fontSize: '1rem', color: '#64748b' }}>
                  <span style={{ color: '#fbbf24', fontSize: '1.2rem' }}>★</span>
                  <strong style={{ color: '#0f172a' }}>{averageRating}/5</strong>
                  <span>({reviewCount} {t('reviews.count') || 'értékelés'})</span>
                </div>
              )}
              <div
                className={styles.richContent}
                dangerouslySetInnerHTML={{ __html: getLocalizedText(detail.longDescription, locale) }}
              />
            </div>

            <div className={styles.detailsGrid}>
              <section className={styles.detailSection}>
                <h3>{t('tickets.included')}</h3>
                <div
                  className={styles.richContent}
                  dangerouslySetInnerHTML={{ __html: getLocalizedText(detail.included, locale) }}
                />
              </section>

              <section className={styles.detailSection}>
                <h3>{t('tickets.notIncluded')}</h3>
                <div
                  className={styles.richContent}
                  dangerouslySetInnerHTML={{ __html: getLocalizedText(detail.notIncluded, locale) }}
                />
              </section>

              <section className={styles.detailSection}>
                <h3>{t('tickets.important')}</h3>
                <div
                  className={styles.richContent}
                  dangerouslySetInnerHTML={{ __html: getLocalizedText(detail.important, locale) }}
                />
              </section>

              <section className={styles.detailSection}>
                <h3>{t('tickets.meetingPoint')}</h3>
                <div
                  className={styles.richContent}
                  dangerouslySetInnerHTML={{ __html: getLocalizedText(detail.meetingPoint, locale) }}
                />
                <div className={styles.mapWrap}>
                  <iframe
                    src={detail.mapSrc}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    aria-label={`${getLocalizedText(title, locale)} location on map`}
                  />
                </div>
              </section>
            </div>
          </section>
        </div>

        <div className={styles.content} ref={bookingRef}>
          <h1 className={styles.title}>{getLocalizedText(title, locale)}</h1>
          <p className={styles.duration}>
            {t('tickets.duration')}: {getLocalizedText(duration, locale)}
          </p>

          <div className={styles.bookingExtras}>
            <div className={styles.fieldLabel}>{t('tickets.date')}</div>
            <div className={styles.calendarWrap}>
              <div className={styles.calendarHeader}>
                <button
                  type="button"
                  className={styles.calendarNav}
                  onClick={() =>
                    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                  }
                  aria-label={t('tickets.previousMonth')}
                >
                  ‹
                </button>
                <div className={styles.calendarTitle}>{monthTitle}</div>
                <button
                  type="button"
                  className={styles.calendarNav}
                  onClick={() =>
                    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                  }
                  aria-label={t('tickets.nextMonth')}
                >
                  ›
                </button>
              </div>
              <div className={styles.weekdayRow}>
                {weekdayHeaders.map((day, idx) => (
                  <div key={`${day}-${idx}`} className={styles.weekdayCell}>
                    {day}
                  </div>
                ))}
              </div>
              <div className={styles.calendarGrid}>
                {calendarDays.map((day) => {
                  const iso = toIsoDate(day);
                  const inCurrentMonth = day.getMonth() === viewMonth.getMonth();
                  const isPast = startOfDay(day).getTime() < today.getTime();
                  const closed = isDateClosed(iso);
                  const isSelected = iso === visitDate;
                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={isPast || closed}
                      className={[
                        styles.calendarCell,
                        !inCurrentMonth ? styles.calendarCellMuted : '',
                        isSelected ? styles.calendarCellActive : '',
                        closed && !isPast ? styles.calendarCellClosed : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => setVisitDate(iso)}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.fieldLabel}>{t('tickets.time')}</div>
            <div className={styles.timeGrid}>
              {timeSlots.map((slot) => {
                const closed = isSlotClosed(visitDate, slot);
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={closed}
                    className={[
                      styles.timeButton,
                      visitTime === slot && !closed ? styles.timeButtonActive : '',
                      closed ? styles.timeButtonClosed : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => setVisitTime(slot)}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.selector}>
            <div className={styles.row}>
              <span>{t('tickets.adult')}</span>
              <div className={styles.stepper}>
                <button
                  type="button"
                  className={styles.stepperBtn}
                  onClick={() => decrement(setAdults, adults, 1)}
                  aria-label={t('tickets.decrease')}
                >
                  −
                </button>
                <span className={styles.count}>{adults}</span>
                <button
                  type="button"
                  className={styles.stepperBtn}
                  onClick={() => increment(setAdults, adults)}
                  aria-label={t('tickets.increase')}
                >
                  +
                </button>
              </div>
              <span className={styles.price}>€{priceAdult}</span>
            </div>
            <div className={styles.row}>
              <span>{t('tickets.child')}</span>
              <div className={styles.stepper}>
                <button
                  type="button"
                  className={styles.stepperBtn}
                  onClick={() => decrement(setChildren, children)}
                  aria-label={t('tickets.decrease')}
                >
                  −
                </button>
                <span className={styles.count}>{children}</span>
                <button
                  type="button"
                  className={styles.stepperBtn}
                  onClick={() => increment(setChildren, children)}
                  aria-label={t('tickets.increase')}
                >
                  +
                </button>
              </div>
              <span className={styles.price}>€{priceChild}</span>
            </div>
          </div>

          <div className={styles.customerForm}>
            <div className={styles.formGroup}>
              <label htmlFor="fullName">{t('tickets.fullName')}</label>
              <input
                id="fullName"
                type="text"
                className={errors.fullName ? styles.inputError : ''}
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors({ ...errors, fullName: false });
                }}
                placeholder="John Doe"
              />
              {errors.fullName && <span className={styles.errorText}>{t('tickets.fillAllFields')}</span>}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">{t('tickets.email')}</label>
              <input
                id="email"
                type="email"
                className={errors.email || errors.emailMismatch ? styles.inputError : ''}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email || errors.emailMismatch) setErrors({ ...errors, email: false, emailMismatch: false });
                }}
                placeholder="john@example.com"
              />
              {errors.email && <span className={styles.errorText}>{t('tickets.fillAllFields')}</span>}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="confirmEmail">{t('tickets.confirmEmail')}</label>
              <input
                id="confirmEmail"
                type="email"
                className={errors.confirmEmail || errors.emailMismatch ? styles.inputError : ''}
                value={confirmEmail}
                onChange={(e) => {
                  setConfirmEmail(e.target.value);
                  if (errors.confirmEmail || errors.emailMismatch) setErrors({ ...errors, confirmEmail: false, emailMismatch: false });
                }}
                placeholder="john@example.com"
              />
              {errors.confirmEmail && <span className={styles.errorText}>{t('tickets.fillAllFields')}</span>}
              {!errors.confirmEmail && errors.emailMismatch && <span className={styles.errorText}>{t('tickets.emailMismatch')}</span>}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="phone">{t('tickets.phone')}</label>
              <input
                id="phone"
                type="tel"
                className={errors.phone ? styles.inputError : ''}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors({ ...errors, phone: false });
                }}
                placeholder="+1 234 567 890"
              />
              {errors.phone && <span className={styles.errorText}>{t('tickets.fillAllFields')}</span>}
            </div>
          </div>

          <div className={styles.total}>
            <span>{t('tickets.total')}</span>
            <span className={styles.totalPrice}>€{total}</span>
          </div>

          <button
            type="button"
            className={styles.cta}
            onClick={handleBuy}
            disabled={isDateClosed(visitDate) || isSlotClosed(visitDate, visitTime) || total === 0}
          >
            {t('tickets.buy')}
          </button>
        </div>
      </div>

      {isLightboxOpen && images.length > 0 && (
        <div className={styles.lightbox} onClick={() => setIsLightboxOpen(false)}>
          <button className={styles.lightboxClose} onClick={() => setIsLightboxOpen(false)} aria-label="Close fullscreen">
            ×
          </button>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <Image src={images[activeImageIdx]} alt={getLocalizedText(title, locale)} fill className={styles.lightboxImage} />
            {images.length > 1 && (
              <>
                <button className={`${styles.lightboxNavBtn} ${styles.lightboxNavLeft}`} onClick={handlePrevImage} aria-label="Previous image">
                  ‹
                </button>
                <button className={`${styles.lightboxNavBtn} ${styles.lightboxNavRight}`} onClick={handleNextImage} aria-label="Next image">
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Sticky mobile CTA */}
      <div className={`${styles.mobileStickyCta} ${showStickyCta && !isBookingVisible ? '' : styles.mobileStickyCtaHidden}`}>
        <button
          type="button"
          className={styles.mobileCtaBtn}
          onClick={scrollToBooking}
        >
          {t('tickets.checkAvailability') !== 'tickets.checkAvailability' ? t('tickets.checkAvailability') : 'Check Availability'}
        </button>
      </div>
    </div>
  );
}
