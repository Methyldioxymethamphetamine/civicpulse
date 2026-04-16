'use client';

import { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Camera, MapPin, Loader2, CheckCircle2, AlertCircle, X, ChevronDown, Sparkles, Map } from 'lucide-react';
import { toast } from 'sonner';
import { useSubmitReport } from '@/lib/queries';
import { CATEGORIES } from '@/lib/types';
import Image from 'next/image';

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

export default function ReportForm() {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; long: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const geoIgnoredRef = useRef(false);

  const { mutateAsync, isPending } = useSubmitReport();

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Secure context required. Falling back to default test coords.');
      setCoords({ lat: 20.01234, long: 73.81983 });
      return;
    }

    geoIgnoredRef.current = false;
    setGeoLoading(true);
    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (geoIgnoredRef.current) return; // User picked via map, ignore GPS result
          setCoords({ lat: pos.coords.latitude, long: pos.coords.longitude });
          setGeoLoading(false);
          toast.success('Location captured!');
        },
        (err) => {
          if (geoIgnoredRef.current) return;
          setGeoLoading(false);
          toast.error('Location denied. Falling back to test coords.');
          setCoords({ lat: 20.12345, long: 73.54321 });
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
      <div className="flex flex-col items-center justify-center gap-5 py-8 slide-up">
        <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center animate-bounce">
          <CheckCircle2 size={40} className="text-green-400" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Report Submitted!</h2>
          <p className="text-sm text-slate-400">Authorities have been notified. Thank you for making your community better.</p>
        </div>
        <button className="btn-primary" onClick={() => { setSubmitted(false); setDescription(''); setCategory('Other'); setImageFile(null); setPreview(null); setCoords(null); }}>
          Submit Another Report
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 xl:gap-6">
      {/* Photo Upload — compact */}
      <div>
        <label className="civic-label">Photo Evidence</label>
        <input id="photo-upload" type="file" accept="image/*" onChange={handleImage} className="hidden" />
        {preview ? (
          <div className="relative w-full h-36 lg:h-40 xl:h-48 2xl:h-56 rounded-2xl overflow-hidden border border-white/10 transition-all duration-300">
            <Image src={preview} alt="Preview" fill className="object-cover" />
            <button
              type="button"
              onClick={() => { setPreview(null); setImageFile(null); }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center border border-white/20 hover:bg-black/80 transition-colors"
            >
              <X size={14} className="text-white" />
            </button>
            <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-green-600/80 text-white text-[10px] font-bold backdrop-blur-sm">
              ✓ PHOTO ATTACHED
            </div>
          </div>
        ) : (
          <label
            htmlFor="photo-upload"
            className="cursor-pointer w-full h-28 lg:h-32 xl:h-48 2xl:h-56 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center gap-4 hover:border-blue-500/40 hover:bg-blue-500/[0.03] transition-all duration-300 group"
          >
            <div className="w-11 h-11 xl:w-12 xl:h-12 rounded-2xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <Camera size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300 group-hover:text-blue-300 transition-colors">Tap to upload photo</p>
              <p className="text-[10px] text-slate-500 mt-0.5">JPEG, PNG, HEIC &middot; Max 10MB</p>
            </div>
          </label>
        )}
      </div>

      {/* Two-column row: Category + Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xl:gap-5">
        {/* Category */}
        <div>
          <label className="civic-label">Issue Type</label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="civic-input pr-8"
              style={{ appearance: 'none' }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#0f172a] text-slate-200 py-2">
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="civic-label">Location</label>
          {coords ? (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-green-500/10 border border-green-500/25 h-[42px]">
              <MapPin size={14} className="text-green-400 shrink-0" />
              <span className="text-xs text-green-300 font-mono truncate">
                {coords.lat.toFixed(5)}, {coords.long.toFixed(5)}
              </span>
              <button type="button" onClick={() => setCoords(null)} className="ml-auto shrink-0">
                <X size={12} className="text-green-400/60 hover:text-green-400" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={getLocation}
                disabled={geoLoading}
                className="flex-1 flex items-center justify-center gap-2 h-[42px] rounded-xl border border-white/10 bg-white/[0.03] hover:bg-blue-500/8 hover:border-blue-500/40 transition-all"
              >
                {geoLoading
                  ? <Loader2 size={14} className="text-blue-400 animate-spin" />
                  : <MapPin size={14} className="text-blue-400" />
                }
                <span className="text-xs font-medium text-slate-300">
                  {geoLoading ? 'Getting…' : 'Auto GPS'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  geoIgnoredRef.current = true; // Cancel any pending GPS result
                  setGeoLoading(false);
                  setShowMapPicker(true);
                }}
                className="flex items-center justify-center gap-2 h-[42px] px-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-violet-500/8 hover:border-violet-500/40 transition-all"
              >
                <Map size={14} className="text-violet-400" />
                <span className="text-xs font-medium text-slate-300">Map</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Warning if no location — inline compact */}
      {!coords && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/[0.06] border border-amber-500/15">
          <AlertCircle size={12} className="text-amber-400 shrink-0" />
          <p className="text-[11px] text-amber-300/70">Location is required to pin your report on the map.</p>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="civic-label">Description</label>
        <textarea
          className="civic-input resize-none"
          rows={2}
          placeholder="Describe the issue briefly… (e.g., 'Deep pothole near bus stop, causing traffic')"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
        />
        <p className="text-[10px] text-slate-500 mt-1 text-right">{description.length}/500</p>
      </div>

      {/* Submit — M3 Extended FAB style */}
      <button
        type="submit"
        disabled={isPending || !coords || !description.trim()}
        className="btn-primary w-full py-3.5 xl:py-4 xl:text-base font-bold rounded-2xl mt-1 xl:mt-3 flex items-center justify-center gap-2 shadow-xl shadow-blue-900/20 hover:shadow-blue-900/40 transition-all group disabled:opacity-40"
      >
        {isPending ? (
          <><Loader2 size={16} className="animate-spin" /> Submitting…</>
        ) : (
          <>
            <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
            Submit Report
          </>
        )}
      </button>

      {/* Map Picker Modal */}
      {showMapPicker && (
        <MapPicker
          onConfirm={(lat, long) => {
            geoIgnoredRef.current = true; // Ensure late GPS can't overwrite
            setCoords({ lat, long });
            setShowMapPicker(false);
            setGeoLoading(false);
            toast.success('Location selected from map!');
          }}
          onClose={() => setShowMapPicker(false)}
        />
      )}
    </form>
  );
}
