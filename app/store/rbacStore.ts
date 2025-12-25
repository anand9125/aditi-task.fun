"use client";

import axios from "axios";
import { create } from "zustand";

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
}

export interface Role {
  id: string;
  name: string;
  createdAt: Date;
  permissions: string[];
}

export interface User {
  id: string;
  email: string;
  createdAt: Date;
  roles: string[];
}

interface RBACState {
  permissions: Permission[];
  roles: Role[];
  users: User[];
  currentUser: { id: string; email: string } | null;
  isAuthenticated: boolean;

  fetchPermissions: () => Promise<void>;
  fetchRoles: () => Promise<void>;

  login: (email: string) => Promise<void>;
  logout: () => void;

  addPermission: (data: { name: string; description?: string }) => Promise<void>;
  updatePermission: (id: string, updates: Partial<Permission>) => Promise<void>;
  deletePermission: (id: string) => Promise<void>;

  addRole: (data: { name: string }) => Promise<void>;
  updateRole: (id: string, updates: Partial<Role>) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;

  assignPermissionToRole: (roleId: string, permissionId: string) => Promise<void>;
  removePermissionFromRole: (roleId: string, permissionId: string) => Promise<void>;
}

/* ---------------- NORMALIZER ---------------- */

const normalizeRole = (role: any): Role => ({
  ...role,
  permissions: role.permissions ?? [],
});

export const useRBACStore = create<RBACState>((set) => ({
  permissions: [],
  roles: [],
  users: [],
  currentUser: null,
  isAuthenticated: false,

  /* ---------------- LOADERS ---------------- */

  fetchPermissions: async () => {
    const res = await axios.get<Permission[]>("/api/permissions");
    set({ permissions: res.data });
  },

  fetchRoles: async () => {
    const res = await axios.get<Role[]>("/api/roles");
    set({
      roles: res.data.map(normalizeRole), // ✅ FIX
    });
  },

  /* ---------------- AUTH ---------------- */

  login: async (email) => {
    set({
      isAuthenticated: true,
      currentUser: { id: "me", email },
    });
  },

  logout: () => {
    set({
      isAuthenticated: false,
      currentUser: null,
    });
  },

  /* ---------------- PERMISSIONS ---------------- */

  addPermission: async (data) => {
    const res = await axios.post<Permission>("/api/permissions", data);
    set((state) => ({
      permissions: [...state.permissions, res.data],
    }));
  },

  updatePermission: async (id, updates) => {
    const res = await axios.put<Permission>(`/api/permissions/${id}`, updates);
    set((state) => ({
      permissions: state.permissions.map((p) =>
        p.id === id ? res.data : p
      ),
    }));
  },

  deletePermission: async (id) => {
    await axios.delete(`/api/permissions/${id}`);
    set((state) => ({
      permissions: state.permissions.filter((p) => p.id !== id),
      roles: state.roles.map((r) => ({
        ...r,
        permissions: r.permissions.filter((pid) => pid !== id),
      })),
    }));
  },

  /* ---------------- ROLES ---------------- */

  addRole: async (data) => {
    const res = await axios.post<Role>("/api/roles", data);
    set((state) => ({
      roles: [...state.roles, normalizeRole(res.data)], // ✅ FIX
    }));
  },

  updateRole: async (id, updates) => {
    const res = await axios.put<Role>(`/api/roles/${id}`, updates);
    set((state) => ({
      roles: state.roles.map((r) =>
        r.id === id ? normalizeRole(res.data) : r // ✅ FIX
      ),
    }));
  },

  deleteRole: async (id) => {
    await axios.delete(`/api/roles/${id}`);
    set((state) => ({
      roles: state.roles.filter((r) => r.id !== id),
    }));
  },

  /* ---------------- ROLE ↔ PERMISSION ---------------- */

  assignPermissionToRole: async (roleId, permissionId) => {
    await axios.post(`/api/roles/${roleId}/permissions`, {
    permissionIds: [permissionId], 
  });

    set((state) => ({
      roles: state.roles.map((r) =>
        r.id === roleId
          ? { ...r, permissions: [...r.permissions, permissionId] }
          : r
      ),
    }));
  },

  removePermissionFromRole: async (roleId, permissionId) => {
    await axios.delete(
      `/api/roles/${roleId}/permissions/${permissionId}`
    );

    set((state) => ({
      roles: state.roles.map((r) =>
        r.id === roleId
          ? {
              ...r,
              permissions: r.permissions.filter((p) => p !== permissionId),
            }
          : r
      ),
    }));
  },
}));
