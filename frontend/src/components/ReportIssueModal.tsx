import { useState, FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { api } from "@/services/api";

interface ReportIssueModalProps {
    isOpen: boolean;
    onClose: () => void;
    speciesName: string;
}

export function ReportIssueModal({ isOpen, onClose, speciesName }: ReportIssueModalProps) {
    const [issueType, setIssueType] = useState<string>("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!issueType) {
            toast.error("Please select an issue type");
            return;
        }

        setLoading(true);
        try {
            await api.post("/api/reports/issue", {
                species_name: speciesName,
                issue_type: issueType,
                description: description
            });
            toast.success("Thank you! Your report has been submitted.");
            setIssueType("");
            setDescription("");
            onClose();
        } catch (err) {
            toast.error("Failed to submit report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Report Data Issue</DialogTitle>
                    <DialogDescription>
                        Help us improve our database by reporting issues with {speciesName}.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="issueType">Issue Type</Label>
                        <Select value={issueType} onValueChange={setIssueType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select the type of issue" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="wrong_image">Incorrect Image</SelectItem>
                                <SelectItem value="inaccurate_description">Inaccurate Description</SelectItem>
                                <SelectItem value="wrong_status">Wrong Conservation Status</SelectItem>
                                <SelectItem value="broken_link">Broken Wikipedia Link</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Details (Optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="Tell us what's wrong so we can fix it..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !issueType}>
                            {loading ? "Submitting..." : "Submit Report"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
