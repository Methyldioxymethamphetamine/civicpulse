'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, MapPin, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { useSubmitReport } from '@/lib/queries';
import { CATEGORIES } from '@/lib/types';
import Image from 'next/image';

export default function ReportForm() {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; long: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { mutateAsync, isPending } = useSubmitReport();

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      // Fallback for non-HTTPS local mobile testing (HTTP network IPs block geolocation)
      toast.error('Secure context required. Falling back to default test coords.');
      setCoords({ lat: 20.01234, long: 73.81983 });
      return;
    }

    setGeoLoading(true);
    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, long: pos.coords.longitude });
          setGeoLoading(false);
          toast.success('Location captured!');
        },
        (err) => {
          setGeoLoading(false);
          toast.error('Location denied. Falling back to test coords.');
          setCoords({ lat: 20.12345, long: 73.54321 }); // fallback
        },
        { enableHighAccuracy: true, timeout: 10_000 }
      );
    } catch (err) {
      setGeoLoading(false);
      toast.error('Error opening GPS locator.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) { toast.error('Please add a description.'); return; }
    if (!coords) { toast.error('Please capture your location first.'); return; }

    try {
      await mutateAsync({ description, category, lat: coords.lat, long: coords.long, imageFile });
      setSubmitted(true);
      toast.success('Report submitted successfully!');
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      console.error('Submission Catch Error:', errorMessage, err);
      toast.error(`Submission failed: ${errorMessage}`);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-12 slide-up">
        <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-green-400" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-1">Report Submitted!</h2>
          <p className="text-sm text-slate-400">Authorities have been notified. Thank you for making your community better.</p>
        </div>
        <button className="btn-primary" onClick={() => { setSubmitted(false); setDescription(''); setCategory('Other'); setImageFile(null); setPreview(null); setCoords(null); }}>
          Submit Another Report
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Photo Upload */}
      <div>
        <label className="civic-label">Photo Evidence</label>
        <input id="photo-upload" type="file" accept="image/*" onChange={handleImage} className="hidden" />
        {preview ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10">
            <Image src={preview} alt="Preview" fill className="object-cover" />
            <button
              type="button"
              onClick={() => { setPreview(null); setImageFile(null); }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center border border-white/20"
            >
              <X size={14} className="text-white" />
            </button>
          </div>
        ) : (
          <label
            htmlFor="photo-upload"
            className="cursor-pointer w-full aspect-video rounded-xl border-2 border-dashed border-white/15 flex flex-col items-center justify-center gap-3 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-blue-500/15 flex items-center justify-center">
              <Camera size={22} className="text-blue-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-300">Tap to take / upload photo</p>
              <p className="text-xs text-slate-500 mt-0.5">JPEG, PNG, HEIC supported</p>
            </div>
          </label>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="civic-label">Issue Type</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="civic-input"
          style={{ appearance: 'none' }}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat} className="bg-[#0f172a] text-slate-200 py-2">
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="civic-label">Description</label>
        <textarea
          className="civic-input resize-none"
          rows={3}
          placeholder="Describe the issue briefly… (e.g., 'Deep pothole near bus stop, causing traffic')"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
        />
        <p className="text-xs text-slate-500 mt-1 text-right">{description.length}/500</p>
      </div>

      {/* Location */}
      <div>
        <label className="civic-label">Location</label>
        {coords ? (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/25">
            <MapPin size={16} className="text-green-400 shrink-0" />
            <span className="text-sm text-green-300 font-mono">
              {coords.lat.toFixed(5)}, {coords.long.toFixed(5)}
            </span>
            <button type="button" onClick={() => setCoords(null)} className="ml-auto">
              <X size={14} className="text-green-400/60 hover:text-green-400" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={getLocation}
            disabled={geoLoading}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-blue-500/8 hover:border-blue-500/40 transition-all"
          >
            {geoLoading
              ? <Loader2 size={18} className="text-blue-400 animate-spin" />
              : <MapPin size={18} className="text-blue-400" />
            }
            <span className="text-sm font-medium text-slate-300">
              {geoLoading ? 'Getting location…' : 'Tap to capture GPS location'}
            </span>
          </button>
        )}
      </div>

      {/* Warning if no location */}
      {!coords && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-500/8 border border-amber-500/20">
          <AlertCircle size={14} className="text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-300/80">Location is required to pin your report on the map.</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending || !coords || !description.trim()}
        className="btn-primary w-full py-4 text-base mt-2"
        style={{ fontSize: '1rem', padding: '16px' }}
      >
        {isPending ? (
          <><Loader2 size={18} className="animate-spin" /> Submitting…</>
        ) : (
          'Submit Report'
        )}
      </button>
    </form>
  );
}
