import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Search, AlertTriangle, Users, FileText } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";

type Report = {
  id: number;
  report_type: string;
  species_name: string;
  reporter: string;
  timestamp: string;
  description: string;
  issue_type: string;
  status: string;
};

type UserRecord = {
  id: number;
  username: string;
  role: string;
  created_at: string;
};

export default function AdminPanel() {
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"reports" | "users">("reports");

  const fetchData = async () => {
    setLoading(true);

    // Fetch reports (SQLite)
    try {
      const reportsRes = await api.get("/api/reports");
      setReports(reportsRes.data);
    } catch (err) {
      toast.error("Failed to load reports");
    }

    // Fetch users (MySQL)
    try {
      const usersRes = await api.get("/api/auth/users");
      setUsers(usersRes.data);
    } catch (err) {
      console.error("Users load error", err);
      // We don't toast error here to avoid double toast if reports also fail, 
      // or if the user simply hasn't setup MySQL yet.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/api/reports/${id}/status`, { status });
      setReports(d => d.map(s => s.id === id ? { ...s, status } : s));
      toast.success(`Report marked as ${status}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage reports and registered users</p>
        </div>

        <div className="flex bg-muted p-1 rounded-lg">
          <Button
            variant={activeTab === "reports" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("reports")}
            className="rounded-md"
          >
            <FileText className="h-4 w-4 mr-2" /> Reports
          </Button>
          <Button
            variant={activeTab === "users" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("users")}
            className="rounded-md"
          >
            <Users className="h-4 w-4 mr-2" /> Users
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : activeTab === "reports" ? (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Species</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Details</th>
                  <th className="px-4 py-3 font-semibold">Reporter</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No reports found.</td></tr>
                ) : (
                  reports.map(s => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        {s.report_type === "sighting" ? (
                          <Badge variant="outline" className="text-blue-500 border-blue-500 bg-blue-50">
                            <Search className="w-3 h-3 mr-1" /> Sighting
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-orange-500 border-orange-500 bg-orange-50">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Issue
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium">{s.species_name || "Unknown"}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{new Date(s.timestamp).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[250px]">
                        {s.report_type === "issue" && s.issue_type && (
                          <div className="font-semibold text-xs mb-1 uppercase tracking-wider text-primary">{s.issue_type.replace('_', ' ')}</div>
                        )}
                        <span className="line-clamp-2 truncate">{s.description || "N/A"}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{s.reporter}</td>
                      <td className="px-4 py-3">
                        <Badge variant={s.status === "approved" ? "default" : s.status === "rejected" ? "destructive" : "secondary"} className="capitalize">
                          {s.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                          {s.status === "approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {s.status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
                          {s.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {s.status === "pending" && (
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" onClick={() => updateStatus(s.id, "approved")}>Approve</Button>
                            <Button size="sm" variant="destructive" onClick={() => updateStatus(s.id, "rejected")}>Reject</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 font-semibold">User ID</th>
                  <th className="px-4 py-3 font-semibold">Username</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Registered At</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No users registered yet.</td></tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">#{u.id}</td>
                      <td className="px-4 py-3 font-medium">{u.username}</td>
                      <td className="px-4 py-3 capitalize">
                        <Badge variant={u.role === "admin" ? "default" : "outline"}>{u.role}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {u.created_at === "System"
                          ? "System"
                          : new Date(u.created_at).toLocaleString() !== "Invalid Date"
                            ? new Date(u.created_at).toLocaleString()
                            : u.created_at}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
