"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { updateUser, setSelected } from "../slices/usersSlice";
import type { User, UserRole } from "../services/usersApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { toast } from "react-toastify";

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserFormFieldsProps {
  selected: User;
  onClose: () => void;
}

function UserFormFields({ selected, onClose }: UserFormFieldsProps) {
  const dispatch = useAppDispatch();
  const [role, setRole] = useState<UserRole>(selected.role);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    dispatch(setSelected(null));
    onClose();
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await dispatch(
        updateUser({ id: selected._id, payload: { role } }),
      ).unwrap();
      toast.success("User role updated successfully");
      handleClose();
    } catch {
      toast.error("Failed to update user role");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-gray-900 text-xl font-bold">
          Edit User Role
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        <div>
          <Label htmlFor="name" className="text-gray-700 font-medium">
            Name
          </Label>
          <Input id="name" value={selected.name} readOnly className="bg-gray-50" />
        </div>

        <div>
          <Label htmlFor="email" className="text-gray-700 font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={selected.email}
            readOnly
            className="bg-gray-50"
          />
        </div>

        <div>
          <Label className="text-gray-700 font-medium">Role</Label>
          <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              className="z-[100] bg-white text-gray-900 border border-gray-200 shadow-lg"
            >
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Saving..." : "Update Role"}
          </Button>
        </div>
      </form>
    </>
  );
}

export default function UserForm({ isOpen, onClose }: UserFormProps) {
  const dispatch = useAppDispatch();
  const selected = useAppSelector((state) => state.users.selected);

  const handleClose = () => {
    dispatch(setSelected(null));
    onClose();
  };

  if (!selected) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px] bg-white border-0 shadow-2xl">
        <UserFormFields
          key={selected._id}
          selected={selected}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
