// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { Loader2, User, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// AWS Cognito setup
const poolData = {
  UserPoolId: "us-east-1_iVomSPj8O", 
  ClientId: "38f5ummg4pu7le5rsdegepsmd5",
};

const userPool = new CognitoUserPool(poolData);

export default function Dashboard() {
  const [user, setUser] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is authenticated
    const currentUser = userPool.getCurrentUser();

    if (!currentUser) {
      // No user found, redirect to sign-in
      router.push('/sign-in');
      return;
    }

    // Get user session
    // @ts-ignore - Cognito callback types are handled internally
    currentUser.getSession((err, session) => {
      if (err) {
        console.error('Error getting session:', err);
        router.push('/sign-in');
        return;
      }

      if (!session.isValid()) {
        console.log('Session not valid');
        router.push('/sign-in');
        return;
      }

      // Get user attributes
      // @ts-ignore - Cognito callback types are handled internally
      currentUser.getUserAttributes((err, attributes) => {
        if (err) {
          console.error('Error getting user attributes:', err);
          setLoading(false);
          return;
        }

        const userInfo: Record<string, string> = {};
        if (attributes) {
          attributes.forEach(attr => {
            userInfo[attr.getName()] = attr.getValue();
          });
        }

        setUser(userInfo);
        setLoading(false);
      });
    });
  }, [router]);

  const handleSignOut = () => {
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
      currentUser.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account."
      });
      router.push('/sign-in');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <Card className="border-none shadow-none">
        <CardHeader className="space-y-1 pb-8">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center tracking-tight">
            Your Dashboard
          </h1>
          <p className="text-center text-sm text-muted-foreground">
            Welcome back to your account
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {user ? (
            <div className="space-y-4 border rounded-lg p-6 bg-card dark:bg-slate-900">
              <h2 className="text-xl font-semibold mb-4">User Profile</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm col-span-2">{user.email || 'Not available'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-2 border-b border:slate-200 dark:border-slate-800">
                  <span className="text-sm font-medium">Name:</span>
                  <span className="text-sm col-span-2">{user['custom:display_name'] || user.name || 'Not available'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-sm font-medium">Given Name:</span>
                  <span className="text-sm col-span-2">{user.given_name || 'Not available'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-2">
                  <span className="text-sm font-medium">Family Name:</span>
                  <span className="text-sm col-span-2">{user.family_name || 'Not available'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center p-6 text-muted-foreground">
              No user information available
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4 pt-4">
          <Button
            className={cn(
              "w-full h-11 font-medium transition-all",
              "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
            )}
            onClick={() => router.push('/profile')}
          >
            Manage Profile
          </Button>
          
          <Button
            variant="outline"
            className="w-full h-11 border-red-200 hover:bg-red-50 hover:text-red-600 flex items-center justify-center gap-2"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}