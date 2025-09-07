import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectSidebarOpen, setSidebarOpen } from '../../store/slices/uiSlice';

/**
 * Component to detect edge swipes for opening the sidebar on mobile
 */
const EdgeSwipeDetector: React.FC = () => {
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector(selectSidebarOpen);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isSwipingRef = useRef(false);

  useEffect(() => {
    // Only enable edge swipe detection on mobile when sidebar is closed
    if (window.innerWidth >= 768 || sidebarOpen) {
      return;
    }

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      
      const edgeThreshold = 20; // 20px from left edge
      
      // Only detect swipes starting from the left edge
      if (touch.clientX <= edgeThreshold) {
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now()
        };
        isSwipingRef.current = false;
      } else {
        touchStartRef.current = null;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.touches[0];
      if (!touch) return;
      
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
      const minSwipeDistance = 10;

      // Check if this is a horizontal swipe to the right
      if (deltaX > minSwipeDistance && deltaX > deltaY) {
        isSwipingRef.current = true;
        // Prevent default scrolling behavior during swipe
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || !isSwipingRef.current) {
        touchStartRef.current = null;
        isSwipingRef.current = false;
        return;
      }

      const touch = e.changedTouches[0];
      if (!touch) return;
      
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
      const deltaTime = Date.now() - touchStartRef.current.time;
      
      const minSwipeDistance = 50;
      const maxSwipeTime = 500; // 500ms max for a quick swipe
      const velocity = deltaX / deltaTime; // pixels per millisecond

      // Open sidebar if:
      // 1. Swipe distance is sufficient
      // 2. Swipe is primarily horizontal
      // 3. Swipe is quick enough (good velocity)
      if (
        deltaX > minSwipeDistance &&
        deltaX > deltaY &&
        (deltaTime < maxSwipeTime || velocity > 0.3)
      ) {
        dispatch(setSidebarOpen(true));
      }

      // Reset state
      touchStartRef.current = null;
      isSwipingRef.current = false;
    };

    // Add passive listeners for better performance
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dispatch, sidebarOpen]);

  // This component doesn't render anything visible
  return null;
};

export default EdgeSwipeDetector;