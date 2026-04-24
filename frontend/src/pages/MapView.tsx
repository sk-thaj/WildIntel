import { useState, useMemo, useEffect } from "react";
import SpeciesMap from "@/components/SpeciesMap";
import { type ConservationStatus } from "@/data/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { api } from "@/services/api";


export default function MapView() {
  const [species, setSpecies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const statuses: ConservationStatus[] = ["Critically Endangered", "Endangered", "Vulnerable", "Near Threatened"];

  useEffect(() => {
    api.get("/species")
      .then(res => {
        setSpecies(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch species:", err);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return species.filter(s => {
      const matchSearch = search ? s.scientificName?.toLowerCase().includes(search.toLowerCase()) || s.name?.toLowerCase().includes(search.toLowerCase()) : true;
      const matchStatus = statusFilter !== "all" ? s.status === statusFilter : true;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter, species]);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="font-display text-4xl font-bold mb-2">Species Map</h1>
      <p className="text-muted-foreground mb-6">View endangered species habitats and verified sightings worldwide</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative w-full sm:flex-1 lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search common or scientific name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 text-[10px] md:text-sm">
        {[
          { color: "bg-status-critical", label: "Critically Endangered" },
          { color: "bg-status-endangered", label: "Endangered" },
          { color: "bg-status-vulnerable", label: "Vulnerable" },
          { color: "bg-status-near-threatened", label: "Near Threatened" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2">
            <span className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${l.color}`} />
            <span className="text-muted-foreground whitespace-nowrap">{l.label}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="h-[50vh] md:h-[70vh] w-full rounded-xl border flex items-center justify-center bg-muted/20">
          <div className="animate-spin md:w-8 md:h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <SpeciesMap species={filtered} className="h-[50vh] md:h-[70vh] w-full rounded-xl border shadow-sm relative z-0" />
      )}
    </div>
  );
}