// // src/app/dashboard/page.tsx
// "use client";

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Loader2, User, LogOut } from 'lucide-react';
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
// } from "@/components/ui/card";
// import { cn } from "@/lib/utils";
// import { useToast } from "@/hooks/use-toast";

// export default function Dashboard() {
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();
//   const { toast } = useToast();

//   // Sample user data
//   const user = {
//     email: "user@example.com",
//     name: "John Doe",
//     given_name: "John",
//     family_name: "Doe"
//   };

//   const handleSignOut = () => {
//     setLoading(true);
    
//     // Simple timeout to simulate sign out process
//     setTimeout(() => {
//       toast({
//         title: "Signed out successfully",
//         description: "You have been signed out of your account."
//       });
//       router.push('/sign-in');
//     }, 500);
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     );
//   }

//   return (
//     <div className="container max-w-4xl mx-auto p-6">
//       <Card className="border-none shadow-none">
//         <CardHeader className="space-y-1 pb-8">
//           <div className="flex justify-center mb-2">
//             <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
//               <User className="h-6 w-6 text-primary" />
//             </div>
//           </div>
//           <h1 className="text-2xl font-bold text-center tracking-tight">
//             Your Dashboard
//           </h1>
//           <p className="text-center text-sm text-muted-foreground">
//             Welcome back to your account
//           </p>
//         </CardHeader>

//         <CardContent className="space-y-4">
//           <div className="space-y-4 border rounded-lg p-6 bg-card dark:bg-slate-900">
//             <h2 className="text-xl font-semibold mb-4">User Profile</h2>
//             <div className="space-y-3">
//               <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-200 dark:border-slate-800">
//                 <span className="text-sm font-medium">Email:</span>
//                 <span className="text-sm col-span-2">{user.email}</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-200 dark:border-slate-800">
//                 <span className="text-sm font-medium">Name:</span>
//                 <span className="text-sm col-span-2">{user.name}</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-200 dark:border-slate-800">
//                 <span className="text-sm font-medium">Given Name:</span>
//                 <span className="text-sm col-span-2">{user.given_name}</span>
//               </div>
//               <div className="grid grid-cols-3 gap-2 py-2">
//                 <span className="text-sm font-medium">Family Name:</span>
//                 <span className="text-sm col-span-2">{user.family_name}</span>
//               </div>
//             </div>
//           </div>
//         </CardContent>
        
//         <CardFooter className="flex flex-col space-y-4 pt-4">
//           <Button
//             className={cn(
//               "w-full h-11 font-medium transition-all",
//               "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
//             )}
//             onClick={() => router.push('/profile')}
//           >
//             Manage Profile
//           </Button>
          
//           <Button
//             variant="outline"
//             className="w-full h-11 border-red-200 hover:bg-red-50 hover:text-red-600 flex items-center justify-center gap-2"
//             onClick={handleSignOut}
//           >
//             <LogOut className="h-4 w-4" />
//             Sign Out
//           </Button>
//         </CardFooter>
//       </Card>
//     </div>
//   );
// }








// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { CognitoUserPool, CognitoUser } from "amazon-cognito-identity-js";

// AWS Cognito setup - Using the same User Pool details as in sign-in-form
const poolData = {
  UserPoolId: "us-east-1_iVomSPj8O",
  ClientId: "38f5ummg4pu7le5rsdegepsmd5",
};

const userPool = new CognitoUserPool(poolData);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const { toast } = useToast();

  // Fetch AWS user details on component mount
  useEffect(() => {
    function fetchUserData() {
      try {
        const cognitoUser = userPool.getCurrentUser();
        
        if (!cognitoUser) {
          console.error("No authenticated user found");
          toast({
            title: "Authentication Error",
            description: "Please sign in to access your dashboard.",
            variant: "destructive"
          });
          router.push('/sign-in');
          setLoading(false);
          return;
        }
        
        cognitoUser.getSession((err, session) => {
          if (err) {
            console.error("Session error:", err);
            toast({
              title: "Session Expired",
              description: "Your session has expired. Please sign in again.",
              variant: "destructive"
            });
            router.push('/sign-in');
            setLoading(false);
            return;
          }
          
          // Get user attributes
          cognitoUser.getUserAttributes((err, attributes) => {
            if (err) {
              console.error("Error getting user attributes:", err);
              toast({
                title: "Error",
                description: "Unable to fetch your profile details.",
                variant: "destructive"
              });
              setLoading(false);
              return;
            }
            
            // Convert the array of attributes to an object
            const userAttributes = {};
            if (attributes) {
              attributes.forEach(attr => {
                userAttributes[attr.getName()] = attr.getValue();
              });
            }
            
            console.log("User attributes:", userAttributes);
            
            // Set user data based on the attributes
            // Handle both standard attributes and custom attributes
            // including those from federated providers (Google/Microsoft)
            setUser({
              email: userAttributes.email || '',
              name: userAttributes.name || `${userAttributes.given_name || ''} ${userAttributes.family_name || ''}`.trim(),
              given_name: userAttributes.given_name || '',
              family_name: userAttributes.family_name || '',
              display_name: userAttributes['custom:display_name'] || userAttributes.name || ''
            });
            
            setLoading(false);
          });
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Authentication Error",
          description: "Unable to fetch your user details. Please sign in again.",
          variant: "destructive"
        });
        router.push('/sign-in');
        setLoading(false);
      }
    }

    fetchUserData();
  }, [router, toast]);

  const handleSignOut = () => {
    setLoading(true);
    
    try {
      const cognitoUser = userPool.getCurrentUser();
      if (cognitoUser) {
        cognitoUser.signOut();
        
        // Clear any session storage items
        sessionStorage.removeItem('oauth_state');
      }
      
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account."
      });
      router.push('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive"
      });
      setLoading(false);
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
          <div className="space-y-4 border rounded-lg p-6 bg-card dark:bg-slate-900">
            <h2 className="text-xl font-semibold mb-4">User Profile</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm col-span-2">{user?.email}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-sm font-medium">Display Name:</span>
                <span className="text-sm col-span-2">{user?.display_name || user?.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-sm font-medium">Full Name:</span>
                <span className="text-sm col-span-2">{user?.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-sm font-medium">Given Name:</span>
                <span className="text-sm col-span-2">{user?.given_name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-2">
                <span className="text-sm font-medium">Family Name:</span>
                <span className="text-sm col-span-2">{user?.family_name}</span>
              </div>
            </div>
          </div>
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