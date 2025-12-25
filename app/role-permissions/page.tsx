"use client";

import { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useRBACStore } from '../store/rbacStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Search, Link as LinkIcon, Users, Key, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { cn } from '../lib/utils';
import { useRouter } from 'next/navigation';

const RolePermissions = () => {
  const { roles, permissions, assignPermissionToRole, removePermissionFromRole,fetchPermissions,fetchRoles } = useRBACStore();
  const [search, setSearch] = useState('');
  const [expandedRole, setExpandedRole] = useState<string | null>(roles[0]?.id || null);
  const { toast } = useToast();
  const router = useRouter();
  const filteredPermissions = permissions.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
  );
    useEffect(() => {
        const token = localStorage.getItem('token');
        fetchPermissions();
        fetchRoles();
        
        if (!token) {
          router.push('/signin');
        }
      }, [router]);
    
      
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (!token) {
        return null; 
      }

  const handleTogglePermission = (roleId: string, permissionId: string, isAssigned: boolean) => {
    if (isAssigned) {
      removePermissionFromRole(roleId, permissionId);
      toast({
        title: "Permission removed",
        description: "The permission has been removed from the role.",
      });
    } else {
      assignPermissionToRole(roleId, permissionId);
      toast({
        title: "Permission assigned",
        description: "The permission has been assigned to the role.",
      });
    }assignPermissionToRole
  };

  const getPermissionName = (permissionId: string) => {
    return permissions.find((p) => p.id === permissionId)?.name || permissionId;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 bg-background text-foreground">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Role-Permission Management</h1>
          <p className="text-muted-foreground">
            Assign and manage permissions for each role
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roles Panel */}
          <div className="lg:col-span-1 space-y-4 animate-slide-up">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              Roles
            </h2>
            <div className="space-y-2">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={cn(
                    "glass-card rounded-xl overflow-hidden transition-all duration-200",
                    expandedRole === role.id && "ring-2 ring-primary/50"
                  )}
                >
                  <button
                    onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center border border-border">
                        <Users className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{role.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {role.permissions.length} permissions
                        </p>
                      </div>
                    </div>
                    {expandedRole === role.id ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  
                  {expandedRole === role.id && (
                    <div className="px-4 pb-4 space-y-2 border-t border-border/50 pt-3">
                      <p className="text-xs text-muted-foreground mb-2">Assigned permissions:</p>
                      {role.permissions.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {role.permissions.map((pId) => (
                            <Badge key={pId} variant="secondary" className="text-xs font-mono">
                              {getPermissionName(pId)}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No permissions assigned</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Permissions Assignment Panel */}
          <div className="lg:col-span-2 space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Key className="w-5 h-5 text-success" />
                Permissions
              </h2>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search permissions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-secondary"
              />
            </div>

            {expandedRole ? (
              <div className="glass-card rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">
                      Assign permissions to:{' '}
                      <span className="text-foreground">
                        {roles.find((r) => r.id === expandedRole)?.name}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                  {filteredPermissions.map((permission) => {
                    const role = roles.find((r) => r.id === expandedRole);
                    const isAssigned = role?.permissions.includes(permission.id) || false;

                    return (
                      <div
                        key={permission.id}
                        className={cn(
                          "flex items-center gap-4 p-4 border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer",
                          isAssigned && "bg-primary/5"
                        )}
                        onClick={() => handleTogglePermission(expandedRole, permission.id, isAssigned)}
                      >
                        <Checkbox
                          checked={isAssigned}
                          onCheckedChange={() => handleTogglePermission(expandedRole, permission.id, isAssigned)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-sm font-medium">{permission.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {permission.description || 'No description'}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {isAssigned ? (
                            <Badge className="bg-success/10 text-success border-success/20">
                              <Check className="w-3 h-3 mr-1" />
                              Assigned
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              <X className="w-3 h-3 mr-1" />
                              Not assigned
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-xl p-12 text-center">
                <LinkIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Role</h3>
                <p className="text-muted-foreground">
                  Click on a role from the left panel to manage its permissions
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Total Roles</span>
            </div>
            <p className="text-2xl font-bold">{roles.length}</p>
          </div>
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-success/10">
                <Key className="w-5 h-5 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">Total Permissions</span>
            </div>
            <p className="text-2xl font-bold">{permissions.length}</p>
          </div>
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-warning/10">
                <LinkIcon className="w-5 h-5 text-warning" />
              </div>
              <span className="text-sm text-muted-foreground">Total Assignments</span>
            </div>
            <p className="text-2xl font-bold">
              {roles.reduce((acc, r) => acc + r.permissions.length, 0)}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RolePermissions;
