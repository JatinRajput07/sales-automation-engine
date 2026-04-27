import { useState } from 'react';
import { Lock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export function UnauthorizedState({ page }: { page?: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [urgency, setUrgency] = useState('Normal');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!reason) return toast({ title: "Reason required", variant: "destructive" });
    toast({ title: "Access Request Sent", description: "Notified Module Admin and HR." });
    setModalOpen(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
      <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center mb-4 text-muted-foreground border border-border">
        <Lock className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">Access Restricted</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        You don't have permission to view {page ? `the ${page} page` : 'this page'}. 
        If you need access to this resource to complete your work, please request it below.
      </p>
      
      <Button onClick={() => setModalOpen(true)} className="gap-2">
        <Send className="w-4 h-4" /> Request Access
      </Button>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Access</DialogTitle>
            <DialogDescription>Request access to the {page || 'current'} page/module.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">Resource Requested</label>
              <div className="h-9 px-3 py-2 bg-surface-hover rounded-sm text-xs border border-border">
                {page || 'Current Page'}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Reason for Access *</label>
              <Textarea 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
                placeholder="Explain why you need access to this page..."
                className="text-xs"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Urgency</label>
              <Select value={urgency} onValueChange={setUrgency}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSubmit}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
