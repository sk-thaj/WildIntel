import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { AlertTriangle, Eye, MapPin, TrendingUp } from "lucide-react";
import { api } from "@/services/api";

export default function Dashboard() {
  const [species, setSpecies] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [speciesRes, reportsRes] = await Promise.all([
          api.get("/species"),
          api.get("/api/reports")
        ]);
        setSpecies(speciesRes.data);
        setReports(reportsRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="container mx-auto px-4 py-10">Loading analytics...</div>;

  const statusCounts = [
    { name: "Critically Endangered", value: species.filter(s => s.status === "Critically Endangered").length, color: "hsl(0, 72%, 50%)" },
    { name: "Endangered", value: species.filter(s => s.status === "Endangered").length, color: "hsl(25, 90%, 55%)" },
    { name: "Vulnerable", value: species.filter(s => s.status === "Vulnerable").length, color: "hsl(45, 90%, 50%)" },
    { name: "Near Threatened", value: species.filter(s => s.status === "Near Threatened").length, color: "hsl(152, 45%, 40%)" },
  ];

  const regionCounts = [...new Set(species.map(s => s.region || "Global"))].map(r => ({
    region: r,
    count: species.filter(s => (s.region || "Global") === r).length,
  }));

  // Aggregate population trend
  const trendYears = [2000, 2005, 2010, 2015, 2020, 2024];
  const trendData = trendYears.map(year => {
    const ce = species
      .filter(s => s.status === "Critically Endangered")
      .reduce((sum, s) => sum + (s.populationTrend?.find(p => p.year === year)?.count || 0), 0);
    const en = species
      .filter(s => s.status === "Endangered")
      .reduce((sum, s) => sum + (s.populationTrend?.find(p => p.year === year)?.count || 0), 0);
    return { year, "Critically Endangered": ce, Endangered: en };
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="font-display text-4xl font-bold mb-2">Analytics Dashboard</h1>
      <p className="text-muted-foreground mb-8">Conservation data at a glance</p>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { icon: AlertTriangle, label: "Critically Endangered", value: statusCounts[0].value, color: "text-status-critical" },
          { icon: Eye, label: "Total Species Tracked", value: species.length, color: "text-primary" },
          { icon: MapPin, label: "Verified Sightings", value: reports.filter(s => s.status === "approved" || s.status === "verified").length, color: "text-status-near-threatened" },
          { icon: TrendingUp, label: "Pending Reports", value: reports.filter(s => s.status === "pending").length, color: "text-status-endangered" },
        ].map((k, i) => (
          <div key={i} className="rounded-lg bg-card border p-5 space-y-2">
            <k.icon className={`h-6 w-6 ${k.color}`} />
            <p className="text-3xl font-display font-bold">{k.value}</p>
            <p className="text-sm text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Status pie */}
        <div className="rounded-lg bg-card border p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Species by Conservation Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                {statusCounts.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Region bar */}
        <div className="rounded-lg bg-card border p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Species by Region</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={regionCounts}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="region" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(152, 45%, 28%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Population trend */}
        <div className="rounded-lg bg-card border p-6 lg:col-span-2">
          <h3 className="font-display text-lg font-semibold mb-4">Population Trends Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Critically Endangered" stroke="hsl(0, 72%, 50%)" strokeWidth={2} />
              <Line type="monotone" dataKey="Endangered" stroke="hsl(25, 90%, 55%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
