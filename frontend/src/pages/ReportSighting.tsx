import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MapPin, Upload, CheckCircle } from "lucide-react";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function ReportSighting() {
  const [form, setForm] = useState({ speciesName: "", notes: "", date: new Date().toISOString().split("T")[0], lat: "", lng: "", photoPreview: "" });
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setForm(f => ({ ...f, lat: pos.coords.latitude.toFixed(4), lng: pos.coords.longitude.toFixed(4) })),
      () => { }
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to report a sighting", { id: "report-auth-error" });
      navigate("/login");
      return;
    }

    if (!form.speciesName.trim()) { toast.error("Please enter a species name"); return; }

    try {
      await api.post("/api/reports/sighting", {
        species_name: form.speciesName,
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null,
        description: form.notes,
        image_data: form.photoPreview,
        reporter: user?.username || "Anonymous"
      });
      setSubmitted(true);
      toast.success("Sighting submitted! It will appear on the map after admin verification.");
    } catch (err) {
      toast.error("Failed to submit sighting. Please try again.");
      console.error(err);
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">Thank You!</h2>
        <Button onClick={() => { setSubmitted(false); setForm({ speciesName: "", notes: "", date: new Date().toISOString().split("T")[0], lat: form.lat, lng: form.lng, photoPreview: "" }); }}>Submit Another</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-lg">
      <h1 className="font-display text-4xl font-bold mb-2">Report a Sighting</h1>
      <p className="text-muted-foreground mb-8">Help conservation efforts by reporting wildlife you've observed</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="species">Species Name *</Label>
          <Input id="species" placeholder="e.g. Snow Leopard" value={form.speciesName} onChange={e => setForm(f => ({ ...f, speciesName: e.target.value }))} />
        </div>

        <div>
          <Label htmlFor="photo">Photo</Label>
          <div
            onClick={() => document.getElementById('photo-upload')?.click()}
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
          >
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {form.photoPreview ? "Photo selected (click to change)" : "Click to upload a photo"}
            </p>
            <input
              id="photo-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setForm(f => ({ ...f, photoPreview: ev.target?.result as string }));
                  };
                  reader.readAsDataURL(e.target.files[0]);
                }
              }}
            />
          </div>
          {form.photoPreview && (
            <div className="mt-2 w-full h-40 rounded-lg overflow-hidden border">
              <img src={form.photoPreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="lat">Latitude</Label>
            <Input id="lat" type="number" step="any" placeholder="Auto-detected" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="lng">Longitude</Label>
            <Input id="lng" type="number" step="any" placeholder="Auto-detected" value={form.lng} onChange={e => setForm(f => ({ ...f, lng: e.target.value }))} />
          </div>
        </div>
        {form.lat && form.lng && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" /> Location auto-detected. Adjust if needed.
          </p>
        )}

        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" placeholder="Describe what you observed..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={4} />
        </div>

        <Button type="submit" className="w-full" size="lg">Submit Sighting</Button>
      </form>
    </div>
  );
}
