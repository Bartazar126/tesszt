'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RichEditor } from '@/components/RichEditor';
import { useI18n, Locale } from '@/i18n/context';
import styles from '../../admin.module.css';

interface Closures {
  dates: string[];
  slots: Record<string, string[]>;
}

interface TicketData {
  id: string;
  slug: string;
  name: string | Record<string, string>;
  priceAdult: number;
  priceChild: number;
  stock: number;
  duration?: string | Record<string, string>;
  openingTime?: string;
  closingTime?: string;
  thumbnail?: string;
  images?: string[];
  longDescription?: string | Record<string, string>;
  included?: string | Record<string, string>;
  notIncluded?: string | Record<string, string>;
  important?: string | Record<string, string>;
  meetingPoint?: string | Record<string, string>;
  mapSrc?: string;
  closures?: Closures;
}

const SLOT_RANGES: Record<string, { start: string; end: string }> = {
  louvre: { start: '09:30', end: '16:00' },
  eiffel: { start: '09:00', end: '18:00' },
  seine: { start: '10:00', end: '20:00' },
};

function parseTimeToMinutes(time: string) {
  const [hh, mm] = time.split(':').map(Number);
  return hh * 60 + mm;
}

function minutesToTime(total: number) {
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function buildTimeSlots(start: string, end: string, step: number) {
  const slots: string[] = [];
  for (let c = parseTimeToMinutes(start), m = parseTimeToMinutes(end); c <= m; c += step) {
    slots.push(minutesToTime(c));
  }
  return slots;
}

function toIsoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function EditTicketPage() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<Partial<TicketData>>({});
  const [closures, setClosures] = useState<Closures>({ dates: [], slots: {} });
  const [editingLocale, setEditingLocale] = useState<Locale>('en');

  const [closureViewMonth, setClosureViewMonth] = useState(() => startOfMonth(new Date()));
  const [selectedClosureDate, setSelectedClosureDate] = useState<string | null>(null);

  const getLocalizedValue = (field: keyof TicketData): string => {
    const current = form[field];
    if (typeof current === 'object' && current !== null && !Array.isArray(current)) {
      return (current as Record<string, string>)[editingLocale] || '';
    }
    return editingLocale === 'en' ? (current as string) || '' : '';
  };

  const updateLocalizedField = (field: keyof TicketData, value: string) => {
    setForm((f) => {
      const current = f[field];
      if (typeof current === 'object' && current !== null && !Array.isArray(current)) {
        return { ...f, [field]: { ...current, [editingLocale]: value } };
      }
      return {
        ...f,
        [field]: { en: (current as string) || '', fr: '', de: '', es: '', it: '', [editingLocale]: value }
      };
    });
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/admin/tickets/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.ticket) {
          const t: TicketData = data.ticket;
          setTicket(t);
          setForm({ ...t, images: t.images || [] });
          setClosures(t.closures ?? { dates: [], slots: {} });
        } else {
          setTicket(null);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const saveEdit = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: form.slug,
          name: form.name,
          priceAdult: form.priceAdult != null ? Number(form.priceAdult) : undefined,
          priceChild: form.priceChild != null ? Number(form.priceChild) : undefined,
          stock: form.stock != null ? Number(form.stock) : undefined,
          duration: form.duration,
          openingTime: form.openingTime,
          closingTime: form.closingTime,
          longDescription: form.longDescription,
          thumbnail: form.thumbnail,
          images: form.images,
          included: form.included,
          notIncluded: form.notIncluded,
          important: form.important,
          meetingPoint: form.meetingPoint,
          mapSrc: form.mapSrc,
          closures,
        }),
      });
      if (res.ok) {
        router.push('/admin/tickets');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    setUploading(true);
    const newImages: string[] = [];

    try {
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) newImages.push(data.url);
        }
      }

      if (newImages.length > 0) {
        setForm(f => ({
          ...f,
          images: [...(f.images || []), ...newImages]
        }));
      }
    } catch (err) {
      console.error('Upload failed', err);
      alert('Képfeltöltés sikertelen!');
    } finally {
      setUploading(false);
      // Reset input
      if (e.target) e.target.value = '';
    }
  };

  const removeImage = (urlToRemove: string) => {
    setForm(f => {
      const newImages = (f.images || []).filter(url => url !== urlToRemove);
      let newThumbnail = f.thumbnail;
      if (newThumbnail === urlToRemove) {
        newThumbnail = newImages.length > 0 ? newImages[0] : '';
      }
      return { ...f, images: newImages, thumbnail: newThumbnail };
    });
  };

  const toggleClosureDate = (iso: string) => {
    setClosures((prev) => {
      const has = prev.dates.includes(iso);
      const dates = has ? prev.dates.filter((d) => d !== iso) : [...prev.dates, iso];
      const slots = { ...prev.slots };
      if (!has) delete slots[iso];
      return { dates, slots };
    });
  };

  const toggleClosureSlot = (date: string, slot: string) => {
    setClosures((prev) => {
      const current = prev.slots[date] ?? [];
      const has = current.includes(slot);
      const next = has ? current.filter((s) => s !== slot) : [...current, slot];
      const slots = { ...prev.slots };
      if (next.length === 0) {
        delete slots[date];
      } else {
        slots[date] = next;
      }
      return { ...prev, slots };
    });
  };

  const slugRange = SLOT_RANGES[ticket?.slug ?? 'louvre'] ?? SLOT_RANGES.louvre;
  const startT = form.openingTime || slugRange.start;
  const endT = form.closingTime || slugRange.end;
  const timeSlots = buildTimeSlots(startT, endT, 30);

  const firstOfMonth = startOfMonth(closureViewMonth);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7;
  const firstVisibleDay = new Date(firstOfMonth);
  firstVisibleDay.setDate(firstOfMonth.getDate() - startWeekday);
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = new Date(firstVisibleDay);
    day.setDate(firstVisibleDay.getDate() + i);
    return day;
  });

  const monthTitle = closureViewMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const today = startOfDay(new Date());
  const selectedDateSlots = selectedClosureDate ? (closures.slots[selectedClosureDate] ?? []) : [];
  const isFullDayClosed = selectedClosureDate ? closures.dates.includes(selectedClosureDate) : false;

  return (
    <main className={styles.main}>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTitle}>Admin</div>
          <nav className={styles.menu}>
            <Link href="/admin" className={styles.menuItem}>Dashboard</Link>
            <Link href="/admin/tickets" className={`${styles.menuItem} ${styles.menuItemActive}`}>Manage tickets</Link>
            <Link href="/admin/orders" className={styles.menuItem}>{t('admin.orders') || 'Orders'}</Link>
            <Link href="/admin/stripe" className={styles.menuItem}>Stripe API</Link>
            <Link href="/admin/reviews" className={styles.menuItem}>Reviews</Link>
            <Link href="/admin/terms" className={styles.menuItem}>{t('admin.terms') || 'Terms'}</Link>
            <Link href="/admin/about" className={styles.menuItem}>{t('admin.about') || 'About Us'}</Link>
            <Link href="/admin/privacy" className={styles.menuItem}>{t('admin.privacy') || 'Privacy'}</Link>
            <Link href="/admin/faq" className={styles.menuItem}>{t('admin.faq') || 'FAQ'}</Link>
            <Link href="/admin/disclaimer-site" className={styles.menuItem}>{t('admin.disclaimerSite') || 'Disclaimer Site'}</Link>
            <Link href="/admin/disclaimer" className={styles.menuItem}>{t('admin.disclaimer') || 'Disclaimer'}</Link>
            <Link href="/admin/company" className={styles.menuItem}>{t('admin.company') || 'Company'}</Link>
            <Link href="/admin/guide" className={styles.menuItem}>Guide</Link>
            <button onClick={handleLogout} className={styles.menuItem} style={{ textAlign: 'left', cursor: 'pointer', background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', width: '100%', padding: '10px 15px', marginTop: '10px' }}>Logout</button>
          </nav>
        </aside>

        <section className={styles.content}>
          <h1 className={styles.formTitle}>Jegy szerkesztése</h1>

          {loading && <p className={styles.loading}>Betöltés…</p>}
          {!loading && !ticket && <p className={styles.muted}>A jegy nem található.</p>}

          {!loading && ticket && (
            <>
              <label className={styles.label}>Slug</label>
              <input
                type="text"
                className={styles.input}
                value={form.slug ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              />

              <div className={styles.langTabs}>
                {(['en', 'fr', 'de', 'es', 'it'] as Locale[]).map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setEditingLocale(loc)}
                    className={editingLocale === loc ? styles.langTabActive : styles.langTab}
                    type="button"
                  >
                    {loc.toUpperCase()}
                  </button>
                ))}
              </div>

              <label className={styles.label}>Név</label>
              <input
                key={`name_${editingLocale}`}
                type="text"
                className={styles.input}
                value={getLocalizedValue('name')}
                onChange={(e) => updateLocalizedField('name', e.target.value)}
              />

              <label className={styles.label}>Felnőtt ár (€)</label>
              <input
                type="number"
                min={0}
                step={1}
                className={styles.input}
                value={form.priceAdult ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priceAdult: e.target.value === '' ? undefined : Number(e.target.value) }))
                }
              />

              <label className={styles.label}>Gyerek ár (€)</label>
              <input
                type="number"
                min={0}
                step={1}
                className={styles.input}
                value={form.priceChild ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priceChild: e.target.value === '' ? undefined : Number(e.target.value) }))
                }
              />

              <label className={styles.label}>Készlet</label>
              <input
                type="number"
                min={0}
                className={styles.input}
                value={form.stock ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, stock: e.target.value === '' ? undefined : Number(e.target.value) }))
                }
              />

              <label className={styles.label}>Időtartam</label>
              <input
                key={`duration_${editingLocale}`}
                type="text"
                className={styles.input}
                placeholder="pl. 2-4 hours"
                value={getLocalizedValue('duration')}
                onChange={(e) => updateLocalizedField('duration', e.target.value)}
              />

              <label className={styles.label}>Nyitvatartás kezdete (09:00)</label>
              <input
                type="time"
                className={styles.input}
                value={form.openingTime ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, openingTime: e.target.value }))}
              />

              <label className={styles.label}>Nyitvatartás vége (18:00)</label>
              <input
                type="time"
                className={styles.input}
                value={form.closingTime ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, closingTime: e.target.value }))}
              />

              <label className={styles.label}>Képek (Kiskép és Galéria)</label>
              <div className={styles.imageUploadGrid}>
                {form.images?.map((url, idx) => (
                  <div key={idx} className={styles.imageCard}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Upload ${idx}`} className={styles.imagePreview} />
                    <div className={styles.imageActions}>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, thumbnail: url }))}
                        className={form.thumbnail === url ? styles.thumbBtnActive : styles.thumbBtn}
                      >
                        {form.thumbnail === url ? '★ Kiskép' : 'Kisképnek'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className={styles.removeImgBtn}
                      >
                        Törlés
                      </button>
                    </div>
                  </div>
                ))}
                <label className={styles.imageUploadBox}>
                  {uploading ? 'Feltöltés...' : '+ Kép hozzáadása'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className={styles.hiddenFile}
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              </div>

              <label className={styles.label}>Részletes leírás</label>
              <RichEditor
                key={`shortDesc_${editingLocale}`}
                value={getLocalizedValue('longDescription')}
                onChange={(html) => updateLocalizedField('longDescription', html)}
              />

              <label className={styles.label}>What&apos;s included</label>
              <RichEditor
                key={`included_${editingLocale}`}
                value={getLocalizedValue('included')}
                onChange={(html) => updateLocalizedField('included', html)}
              />

              <label className={styles.label}>What&apos;s not included</label>
              <RichEditor
                key={`notIncluded_${editingLocale}`}
                value={getLocalizedValue('notIncluded')}
                onChange={(html) => updateLocalizedField('notIncluded', html)}
              />

              <label className={styles.label}>Important information</label>
              <RichEditor
                key={`important_${editingLocale}`}
                value={getLocalizedValue('important')}
                onChange={(html) => updateLocalizedField('important', html)}
              />

              <label className={styles.label}>Meeting point</label>
              <RichEditor
                key={`meetingPoint_${editingLocale}`}
                value={getLocalizedValue('meetingPoint')}
                onChange={(html) => updateLocalizedField('meetingPoint', html)}
              />

              <label className={styles.label}>Térkép embed URL</label>
              <input
                type="text"
                className={styles.input}
                placeholder="https://www.google.com/maps?q=..."
                value={form.mapSrc ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, mapSrc: e.target.value }))}
              />

              {/* ---- Availability management ---- */}
              <div className={styles.closuresSection}>
                <h2 className={styles.closuresTitle}>Availability management</h2>
                <p className={styles.muted}>
                  Click a date to close/open the full day. Select a date below the calendar to manage individual time slots.
                </p>

                <div className={styles.closuresLayout}>
                  <div className={styles.closuresCalendar}>
                    <div className={styles.closuresCalendarHeader}>
                      <button
                        type="button"
                        className={styles.closuresNavBtn}
                        onClick={() =>
                          setClosureViewMonth((p) => new Date(p.getFullYear(), p.getMonth() - 1, 1))
                        }
                      >
                        ‹
                      </button>
                      <div className={styles.closuresMonthTitle}>{monthTitle}</div>
                      <button
                        type="button"
                        className={styles.closuresNavBtn}
                        onClick={() =>
                          setClosureViewMonth((p) => new Date(p.getFullYear(), p.getMonth() + 1, 1))
                        }
                      >
                        ›
                      </button>
                    </div>

                    <div className={styles.closuresWeekRow}>
                      {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
                        <div key={d} className={styles.closuresWeekCell}>{d}</div>
                      ))}
                    </div>

                    <div className={styles.closuresGrid}>
                      {calendarDays.map((day) => {
                        const iso = toIsoDate(day);
                        const inMonth = day.getMonth() === closureViewMonth.getMonth();
                        const isPast = startOfDay(day).getTime() < today.getTime();
                        const isClosed = closures.dates.includes(iso);
                        const hasPartial = !isClosed && closures.slots[iso]?.length;
                        const isSelected = selectedClosureDate === iso;

                        return (
                          <button
                            key={iso}
                            type="button"
                            disabled={isPast}
                            className={[
                              styles.closuresDayCell,
                              !inMonth ? styles.closuresDayMuted : '',
                              isClosed ? styles.closuresDayClosed : '',
                              hasPartial ? styles.closuresDayPartial : '',
                              isSelected ? styles.closuresDaySelected : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            onClick={() => {
                              setSelectedClosureDate(iso);
                            }}
                            onDoubleClick={() => toggleClosureDate(iso)}
                          >
                            {day.getDate()}
                          </button>
                        );
                      })}
                    </div>
                    <p className={styles.closuresHint}>
                      Double-click = close/open full day. Single click = select for slot editing.
                    </p>
                  </div>

                  {selectedClosureDate && (
                    <div className={styles.closuresSlots}>
                      <h3 className={styles.closuresSlotsTitle}>
                        {selectedClosureDate}
                        {isFullDayClosed && (
                          <span className={styles.closedBadge}> CLOSED</span>
                        )}
                      </h3>
                      {isFullDayClosed ? (
                        <p className={styles.muted}>
                          This day is fully closed. Double-click the date to reopen it.
                        </p>
                      ) : (
                        <div className={styles.closuresSlotsGrid}>
                          {timeSlots.map((slot) => {
                            const isClosed = selectedDateSlots.includes(slot);
                            return (
                              <button
                                key={slot}
                                type="button"
                                className={`${styles.closuresSlotBtn} ${isClosed ? styles.closuresSlotClosed : ''}`}
                                onClick={() => toggleClosureSlot(selectedClosureDate, slot)}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => router.push('/admin/tickets')}>
                  Mégse
                </button>
                <button type="button" className={styles.saveBtn} onClick={saveEdit} disabled={saving}>
                  {saving ? 'Mentés…' : 'Mentés'}
                </button>
              </div>
            </>
          )}

          <Link href="/" className={styles.back}>
            Vissza a főoldalra
          </Link>
        </section>
      </div>
    </main>
  );
}
