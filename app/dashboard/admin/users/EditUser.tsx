import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
import { useEffect, useState } from "react";

export default function EditUserModal({
  open,
  onClose,
  user,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  user: any | null;
  onSave: (data: Partial<any>) => void;
}) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    role: user?.role || "consumer",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        phone: user.phone || "",
        address: user.address || "",
        role: user.role,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
          />
          <Input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone"
          />
          <Input
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
          />
          <Select
            value={formData.role}
            onValueChange={(val) => setFormData({ ...formData, role: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="provider">Provider</SelectItem>
              <SelectItem value="consumer">Consumer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
