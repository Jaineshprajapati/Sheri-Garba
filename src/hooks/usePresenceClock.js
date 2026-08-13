import { useState, useEffect } from "react";

export function usePresenceClock() {
  const [clock, setClock] = useState(new Date());
  const [online, setOnline] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Unique ID per open tab
    const tabId = Math.random().toString(36).substring(2, 9);
    const STORAGE_KEY = "sheri_garba_active_tabs";
    const CHANNEL_NAME = "sheri_garba_presence";

    let channel;
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel(CHANNEL_NAME);
    }

    const updateOnlineCount = () => {
      try {
        const now = Date.now();
        const rawTabs = localStorage.getItem(STORAGE_KEY);
        let tabsMap = rawTabs ? JSON.parse(rawTabs) : {};

        // Remove stale tabs (inactive for > 5 seconds)
        Object.keys(tabsMap).forEach((id) => {
          if (now - tabsMap[id] > 5000) {
            delete tabsMap[id];
          }
        });

        // Register / heartbeat this tab
        tabsMap[tabId] = now;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(tabsMap));
        const count = Object.keys(tabsMap).length;
        setOnline(count);

        if (channel) {
          channel.postMessage({ type: "PRESENCE_PING", count });
        }
      } catch (err) {
        console.error("Presence update error:", err);
      }
    };

    // Initial heartbeat
    updateOnlineCount();

    // Regular heartbeat every 2 seconds
    const heartbeatInterval = setInterval(updateOnlineCount, 2000);

    // Listen for changes from other tabs via BroadcastChannel or storage event
    const handleChannelMessage = () => {
      try {
        const rawTabs = localStorage.getItem(STORAGE_KEY);
        if (rawTabs) {
          const tabsMap = JSON.parse(rawTabs);
          const now = Date.now();
          const activeCount = Object.keys(tabsMap).filter(
            (id) => now - tabsMap[id] <= 5000
          ).length;
          setOnline(Math.max(1, activeCount));
        }
      } catch (e) {
        // Fallback ignore
      }
    };

    if (channel) {
      channel.onmessage = handleChannelMessage;
    }
    window.addEventListener("storage", handleChannelMessage);

    // Clean up when tab closes or unmounts
    const cleanupTab = () => {
      try {
        const rawTabs = localStorage.getItem(STORAGE_KEY);
        if (rawTabs) {
          let tabsMap = JSON.parse(rawTabs);
          delete tabsMap[tabId];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(tabsMap));
        }
      } catch (e) {
        // Ignore during unload
      }
    };

    window.addEventListener("beforeunload", cleanupTab);

    return () => {
      clearInterval(heartbeatInterval);
      cleanupTab();
      if (channel) {
        channel.close();
      }
      window.removeEventListener("storage", handleChannelMessage);
      window.removeEventListener("beforeunload", cleanupTab);
    };
  }, []);

  const timeStr = clock
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    .toLowerCase();

  return { timeStr, online };
}
