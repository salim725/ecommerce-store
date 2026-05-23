"use client";



import { useCallback, useEffect, useMemo, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/src/store/hook";

import { fetchUsers, removeUser, setSelected } from "../slices/usersSlice";

import { User } from "../services/usersApi";

import DataTable, { Column } from "@/src/shared/components/DataTable";

import ConfirmModal from "@/src/shared/components/ConfirmModal";

import UserForm from "./UserForm";

import { Badge } from "@/src/components/ui/badge";

import RowActionsMenu from "@/src/shared/components/RowActionsMenu";

import { toast } from "react-toastify";

import ContentPanel from "@/src/shared/components/ContentPanel";

import ListPageToolbar from "@/src/shared/components/ListPageToolbar";

import ListPagination from "@/src/shared/components/ListPagination";

import { paginateSlice } from "@/src/shared/utils/clientList";



export default function UsersList() {

  const dispatch = useAppDispatch();

  const { items, isLoading } = useAppSelector((state) => state.users);



  const [isFormOpen, setIsFormOpen] = useState(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [page, setPage] = useState(1);



  const handleSearchChange = useCallback((query: string) => {

    setSearchQuery(query);

    setPage(1);

  }, []);



  useEffect(() => {

    const load = async () => {

      try {

        await dispatch(fetchUsers()).unwrap();

      } catch {

        toast.error("Failed to load users");

      }

    };

    load();

  }, [dispatch]);



  const filteredItems = useMemo(() => {

    if (!searchQuery) return items;

    const q = searchQuery.toLowerCase();

    return items.filter(

      (u) =>

        u.name.toLowerCase().includes(q) ||

        u.email.toLowerCase().includes(q) ||

        u.role.toLowerCase().includes(q),

    );

  }, [items, searchQuery]);



  const paginatedItems = useMemo(

    () => paginateSlice(filteredItems, page),

    [filteredItems, page],

  );



  const handleEdit = (user: User) => {

    dispatch(setSelected(user));

    setIsFormOpen(true);

  };



  const handleDeleteClick = (id: string) => {

    setDeletingId(id);

    setIsConfirmOpen(true);

  };



  const handleDeleteConfirm = async () => {

    if (!deletingId) return;

    try {

      await dispatch(removeUser(deletingId)).unwrap();

      toast.success("User deleted successfully");

    } catch {

      toast.error("Failed to delete user");

    } finally {

      setIsConfirmOpen(false);

      setDeletingId(null);

    }

  };



  const columns: Column<User>[] = [

    { key: "name", label: "Name" },

    { key: "email", label: "Email" },

    { key: "role", label: "Role" },

    {

      key: "isVerified",

      label: "Verified",

      render: (row) => (

        <Badge variant={row.isVerified ? "default" : "secondary"}>

          {row.isVerified ? "Verified" : "Unverified"}

        </Badge>

      ),

    },

    {

      key: "actions",

      label: "Actions",

      render: (row) => (
        <RowActionsMenu
          itemName={row.name}
          onEdit={() => handleEdit(row)}
          onDelete={() => handleDeleteClick(row._id)}
        />
      ),

    },

  ];



  return (

    <div className="space-y-4">

      <ContentPanel className="space-y-4">

        <div>

          <h1 className="text-2xl font-bold text-gray-900">Users</h1>

          <p className="text-sm text-gray-500">
            View users and update roles (create via registration only)
          </p>

        </div>



        <ListPageToolbar

          onSearchChange={handleSearchChange}

          searchPlaceholder="Search by name, email, or role…"

        />



        <DataTable<User>

          columns={columns}

          data={paginatedItems}

          isLoading={isLoading}

          emptyMessage="No users found."

          getRowId={(row) => row._id}

        />



        <ListPagination

          page={page}

          totalItems={filteredItems.length}

          onPageChange={setPage}

        />

      </ContentPanel>



      <UserForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />



      <ConfirmModal

        isOpen={isConfirmOpen}

        onClose={() => setIsConfirmOpen(false)}

        onConfirm={handleDeleteConfirm}

        title="Delete User"

        description="Are you sure you want to delete this user? This action cannot be undone."

      />

    </div>

  );

}

