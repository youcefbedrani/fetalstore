'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface VisitorTrackerProps {
  enabled?: boolean;
}

export default function VisitorTracker({ enabled = true }: VisitorTrackerProps) {
  const pathname = usePathname();
  const sessionIdRef = useRef<string | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef<boolean>(true);

  // Generate or retrieve session ID
  useEffect(() => {
    if (!enabled) return;

    let sessionId = sessionStorage.getItem('visitor_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('visitor_session_id', sessionId);
    }
    sessionIdRef.current = sessionId;

    // Track page view
    trackPageView(sessionId, pathname);
    
    // Start heartbeat system
    startHeartbeat(sessionId);
  }, [pathname, enabled]);

  // Track user activity and manage heartbeat
  useEffect(() => {
    if (!enabled) return;

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      isActiveRef.current = true;
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click', 'focus'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Heartbeat every 10 seconds to keep session alive (more frequent for better tracking)
    heartbeatIntervalRef.current = setInterval(() => {
      if (isActiveRef.current && sessionIdRef.current) {
        sendHeartbeat(sessionIdRef.current);
      }
    }, 10000);

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched tabs or minimized browser
        isActiveRef.current = false;
      } else {
        // User came back to tab
        isActiveRef.current = true;
        lastActivityRef.current = Date.now();
        if (sessionIdRef.current) {
          sendHeartbeat(sessionIdRef.current);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle beforeunload to mark session as inactive
    const handleBeforeUnload = () => {
      if (sessionIdRef.current) {
        // Send final heartbeat to mark as offline
        navigator.sendBeacon('/api/visitor-tracking', JSON.stringify({
          action: 'session_end',
          session_id: sessionIdRef.current,
          timestamp: new Date().toISOString()
        }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [enabled]);

  // Track clicks
  useEffect(() => {
    if (!enabled) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      const elementId = target.id || '';
      const elementClass = target.className || '';
      const elementText = target.textContent?.substring(0, 100) || '';
      
      trackClick(sessionIdRef.current, {
        elementId,
        elementClass,
        elementText,
        pageUrl: pathname,
        clickX: event.clientX,
        clickY: event.clientY
      });
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [pathname, enabled]);

  return null; // This component doesn't render anything
}

// API functions

// Start heartbeat system for session management
function startHeartbeat(sessionId: string) {
  // Send initial heartbeat
  sendHeartbeat(sessionId);
}

// Send heartbeat to keep session alive
async function sendHeartbeat(sessionId: string) {
  try {
    await fetch('/api/visitor-tracking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'heartbeat',
        session_id: sessionId,
        timestamp: new Date().toISOString(),
        is_active: true
      }),
    });
  } catch (error) {
    console.error('Error sending heartbeat:', error);
  }
}

// Update session activity
async function updateSessionActivity(sessionId: string | null) {
  if (!sessionId) return;
  
  try {
    await fetch('/api/visitor-tracking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'activity_update',
        session_id: sessionId,
        timestamp: new Date().toISOString(),
        is_active: true
      }),
    });
  } catch (error) {
    console.error('Error updating session activity:', error);
  }
}

async function trackPageView(sessionId: string | null, pageUrl: string) {
  if (!sessionId) return;

  try {
    await fetch('/api/visitor-tracking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'page_view',
        sessionId,
        pageUrl,
        pageTitle: document.title,
        referrer: document.referrer
      }),
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
}

async function trackClick(sessionId: string | null, clickData: {
  elementId: string;
  elementClass: string;
  elementText: string;
  pageUrl: string;
  clickX: number;
  clickY: number;
}) {
  if (!sessionId) return;

  try {
    await fetch('/api/visitor-tracking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'click',
        sessionId,
        ...clickData
      }),
    });
  } catch (error) {
    console.error('Error tracking click:', error);
  }
}

