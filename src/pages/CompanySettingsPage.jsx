import { useEffect, useState } from 'react';
import { MapPin, Navigation, Clock, ShieldAlert, Save } from 'lucide-react';
import useFetch from '../hooks/useFetch.js';
import { settingsApi } from '../services/hcmServices.js';
import { PageHeader, Card, Button, ErrorBanner, Spinner } from '../components/ui/Common.jsx';
import { Input } from '../components/ui/Field.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function CompanySettingsPage() {
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  // Form State
  const [officeStartTime, setOfficeStartTime] = useState('09:00');
  const [officeEndTime, setOfficeEndTime] = useState('18:00');
  const [graceMinutes, setGraceMinutes] = useState(15);
  const [halfDayThresholdHours, setHalfDayThresholdHours] = useState(5);
  const [weekendDays, setWeekendDays] = useState([0, 6]); // 0=Sunday, 6=Saturday
  const [latitude, setLatitude] = useState(24.8607);
  const [longitude, setLongitude] = useState(67.0011);
  const [radiusMeters, setRadiusMeters] = useState(150);

  // Late penalty rules
  const [latePenaltyEnabled, setLatePenaltyEnabled] = useState(true);
  const [latesThreshold, setLatesThreshold] = useState(3);
  const [deductionDays, setDeductionDays] = useState(0.5);

  const { data: settingsData, loading, error, reload } = useFetch(
    () => settingsApi.get(),
    []
  );

  useEffect(() => {
    if (settingsData) {
      const s = settingsData.settings || settingsData;
      if (s.officeStartTime) setOfficeStartTime(s.officeStartTime);
      if (s.officeEndTime) setOfficeEndTime(s.officeEndTime);
      if (s.graceMinutes !== undefined) setGraceMinutes(s.graceMinutes);
      if (s.halfDayThresholdHours !== undefined) setHalfDayThresholdHours(s.halfDayThresholdHours);
      if (s.weekendDays) setWeekendDays(s.weekendDays);
      if (s.officeLocation) {
        setLatitude(s.officeLocation.latitude ?? 24.8607);
        setLongitude(s.officeLocation.longitude ?? 67.0011);
        setRadiusMeters(s.officeLocation.radiusMeters ?? 150);
      }
      if (s.latePenaltyRule) {
        setLatePenaltyEnabled(s.latePenaltyRule.enabled ?? true);
        setLatesThreshold(s.latePenaltyRule.latesThreshold ?? 3);
        setDeductionDays(s.latePenaltyRule.deductionDays ?? 0.5);
      }
    }
  }, [settingsData]);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(6)));
          setLongitude(Number(pos.coords.longitude.toFixed(6)));
          toast.success('Current location detected and applied!');
        },
        (err) => {
          toast.error('Unable to fetch current location: ' + err.message);
        },
        { enableHighAccuracy: true }
      );
    } else {
      toast.error('Geolocation not supported by this browser');
    }
  };

  const toggleWeekendDay = (day) => {
    setWeekendDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        officeStartTime,
        officeEndTime,
        graceMinutes: Number(graceMinutes),
        halfDayThresholdHours: Number(halfDayThresholdHours),
        weekendDays,
        officeLocation: {
          latitude: Number(latitude),
          longitude: Number(longitude),
          radiusMeters: Number(radiusMeters),
        },
        latePenaltyRule: {
          enabled: latePenaltyEnabled,
          latesThreshold: Number(latesThreshold),
          deductionDays: Number(deductionDays),
        },
      };

      await settingsApi.update(payload);
      toast.success('Company settings & geofence perimeters updated!');
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update company settings');
    } finally {
      setSaving(false);
    }
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Settings & Geofence"
        description="Office timings, grace rules, weekend schedules, and GPS perimeter parameters for camera attendance."
      />

      <ErrorBanner message={error} onRetry={reload} />

      {loading && !settingsData ? (
        <Spinner size="lg" />
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Office Timings & Attendance Rules */}
          <Card title="Working Hours & Attendance Rules" description="Define workday start, grace threshold and weekend schedules">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Input
                type="time"
                label="Office Start Time *"
                value={officeStartTime}
                onChange={(e) => setOfficeStartTime(e.target.value)}
                required
              />
              <Input
                type="time"
                label="Office End Time *"
                value={officeEndTime}
                onChange={(e) => setOfficeEndTime(e.target.value)}
                required
              />
              <Input
                type="number"
                label="Grace Period (Minutes) *"
                value={graceMinutes}
                onChange={(e) => setGraceMinutes(e.target.value)}
                min="0"
                max="60"
                required
              />
              <Input
                type="number"
                label="Half Day Min Hours *"
                value={halfDayThresholdHours}
                onChange={(e) => setHalfDayThresholdHours(e.target.value)}
                min="1"
                max="12"
                required
              />
            </div>

            {/* Weekend Picker */}
            <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Designated Weekend Days
              </label>
              <div className="flex flex-wrap gap-2">
                {dayNames.map((name, idx) => {
                  const isSelected = weekendDays.includes(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleWeekendDay(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Late Penalty Formula */}
          <Card title="Late Arrival Penalty Rules" description="Automated payroll deductions for frequent late punches">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="lateEnabled"
                checked={latePenaltyEnabled}
                onChange={(e) => setLatePenaltyEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="lateEnabled" className="text-xs font-semibold text-slate-900 dark:text-white cursor-pointer">
                Enable automated late penalty deduction
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                type="number"
                label="Consecutive Lates Threshold"
                value={latesThreshold}
                onChange={(e) => setLatesThreshold(e.target.value)}
                helperText="e.g. 3 lates in a month triggers deduction"
                disabled={!latePenaltyEnabled}
              />
              <Input
                type="number"
                step="0.5"
                label="Deduction Days (Per Threshold)"
                value={deductionDays}
                onChange={(e) => setDeductionDays(e.target.value)}
                helperText="e.g. 0.5 day wage deduction"
                disabled={!latePenaltyEnabled}
              />
            </div>
          </Card>

          {/* Office Geofence & Location */}
          <Card
            title="Office Location & Geofence Perimeter"
            description="Geographical coordinates and allowed radius for mobile/camera check-in"
            actions={
              <Button type="button" variant="secondary" onClick={handleUseCurrentLocation} className="text-xs">
                <Navigation className="h-3.5 w-3.5 text-indigo-600" />
                <span>Use My Current Location</span>
              </Button>
            }
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                type="number"
                step="0.000001"
                label="Office Latitude *"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                required
              />
              <Input
                type="number"
                step="0.000001"
                label="Office Longitude *"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                required
              />
              <Input
                type="number"
                label="Allowed Geofence Radius (Meters) *"
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(e.target.value)}
                min="20"
                max="5000"
                required
              />
            </div>

            {/* Visual Geofence Map / Radar Preview */}
            <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-6 flex flex-col items-center justify-center text-center">
              <div className="relative flex items-center justify-center h-44 w-44 rounded-full border-2 border-dashed border-teal-500/50 bg-teal-500/5 animate-pulse">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="absolute top-2 right-2 text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded-full">
                  {radiusMeters}m Geofence
                </div>
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                Coordinates: {latitude}, {longitude}
              </p>
              <p className="text-[11px] text-slate-400 max-w-sm mt-0.5">
                Check-in calls outside this {radiusMeters}m perimeter will be logged or rejected automatically.
              </p>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" loading={saving} className="px-6">
              <Save className="h-4 w-4" />
              <span>Save Company Settings</span>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
