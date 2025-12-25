'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useRBACStore } from '../store/rbacStore';
import { Shield, Mail, Lock, ArrowRight } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const login = useRBACStore((state) => state.login);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Updated API path - calls your Next.js API route
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      
      if (response.data) {
        toast({
          title: "Welcome back!",
          description: "You've been successfully logged in.",
        });
        // Navigate to dashboard using Next.js router
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.response?.data?.message || "Invalid credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-secondary border border-border">
              <Shield className="w-8 h-8 text-muted-foreground" />
            </div>
            <span className="text-2xl font-bold">RBAC Config</span>
          </div>
          
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
            Manage Access
            <span className="block">With Confidence</span>
          </h1>
          
          <p className="text-muted-foreground text-lg max-w-md">
            A powerful tool to configure roles and permissions for your application. 
            Secure, intuitive, and built for modern teams.
          </p>
          
          <div className="mt-12 grid grid-cols-2 gap-6">
            <div className="glass-card rounded-xl p-4">
              <div className="text-3xl font-bold text-foreground">256+</div>
              <div className="text-sm text-muted-foreground">Active Permissions</div>
            </div>
            <div className="glass-card rounded-xl p-4">
              <div className="text-3xl font-bold text-foreground">24</div>
              <div className="text-sm text-muted-foreground">Custom Roles</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="p-2 rounded-lg bg-secondary border border-border">
              <Shield className="w-6 h-6 text-muted-foreground" />
            </div>
            <span className="text-xl font-bold">RBAC Config</span>
          </div>
          
           <div className="text-center lg:text-left mb-8">
             <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
             <p className="text-muted-foreground">Enter your credentials to access your account</p>
           </div>
          
           <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-secondary border-border focus:border-primary"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 bg-secondary border-border focus:border-primary"
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              variant="glow"
              className="w-full h-12"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </>
              )}
            </Button>
           </form>
           
           <p className="mt-6 text-center text-sm text-muted-foreground">
             Don't have an account?{' '}
             <Link href="/signup" className="text-primary hover:underline font-medium">
               Sign up
             </Link>
           </p>
         </div>
       </div>
     </div>
   );
 };
 
 export default Login;