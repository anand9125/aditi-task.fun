'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useRBACStore } from '../store/rbacStore';
import { Key, Users, Link as LinkIcon, TrendingUp, Shield, Activity } from 'lucide-react';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  color 
}: { 
  title: string; 
  value: number; 
  icon: React.ElementType; 
  trend?: string;
  color: string;
}) => (
  <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-success text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const router = useRouter();
  const { permissions, roles } = useRBACStore();
  
  const totalAssignments = roles.reduce((acc, role) => acc + role.permissions.length, 0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/signin');
    }
  }, [router]);

  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  if (!token) {
    return null; 
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your RBAC configuration</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Permissions"
            value={permissions.length}
            icon={Key}
            trend="+12% this week"
            color="bg-primary/10 text-primary"
          />
          <StatCard
            title="Total Roles"
            value={roles.length}
            icon={Users}
            trend="+3 new"
            color="bg-success/10 text-success"
          />
          <StatCard
            title="Role-Permission Links"
            value={totalAssignments}
            icon={LinkIcon}
            color="bg-warning/10 text-warning"
          />
          <StatCard
            title="Active Policies"
            value={roles.filter(r => r.permissions.length > 0).length}
            icon={Shield}
            color="bg-destructive/10 text-destructive"
          />
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Roles */}
          <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Recent Roles</h2>
              <Activity className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {roles.slice(0, 4).map((role) => (
                <div 
                  key={role.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{role.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {role.permissions.length} permissions
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(role.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Permissions */}
          <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Recent Permissions</h2>
              <Key className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {permissions.slice(0, 4).map((permission) => (
                <div 
                  key={permission.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Key className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium font-mono text-sm">{permission.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {permission.description || 'No description'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Permission Distribution */}
        <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-lg font-semibold mb-6">Permission Distribution by Role</h2>
          <div className="space-y-4">
            {roles.map((role) => {
              const percentage = permissions.length > 0 
                ? Math.round((role.permissions.length / permissions.length) * 100) 
                : 0;
              return (
                <div key={role.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{role.name}</span>
                    <span className="text-muted-foreground">
                      {role.permissions.length} / {permissions.length} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;