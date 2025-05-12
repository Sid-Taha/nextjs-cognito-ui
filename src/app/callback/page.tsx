// src\app\callback\page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Callback() {
  const router = useRouter();
  
  useEffect(() => {
    // Add immediate logging to debug
    console.log('Callback page loaded');
    console.log('URL search params:', window.location.search);
    
    // Get the authorization code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    // Log all relevant parameters
    console.log('Code present:', !!code);
    console.log('State from URL:', state);
    
    // Check for explicit error parameters
    if (error) {
      console.error('Authentication error:', error, errorDescription);
      router.push(`/sign-in?error=${error}&description=${encodeURIComponent(errorDescription || '')}`);
      return;
    }
    
    // Verify state to prevent CSRF
    const savedState = sessionStorage.getItem('oauth_state');
    console.log('Saved state from sessionStorage:', savedState);
    
    if (!savedState) {
      console.error('No state found in sessionStorage');
      router.push('/sign-in?error=missing_state');
      return;
    }
    
    if (state !== savedState) {
      console.error('State mismatch - possible CSRF attack');
      router.push('/sign-in?error=invalid_state');
      return;
    }
    
    if (code) {
      // Store the code or exchange it for tokens here
      console.log('Authentication successful, received authorization code');
      
      // After successful authentication, redirect to dashboard
      router.push('/dashboard');
    } else {
      // Handle error
      console.error('No authorization code received');
      router.push('/sign-in?error=no_code');
    }
    
    // Clear state
    sessionStorage.removeItem('oauth_state');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Logging you in...</h1>
        <p>Please wait while we complete the authentication process.</p>
      </div>
    </div>
  );
}