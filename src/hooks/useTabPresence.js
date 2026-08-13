import { useEffect, useState } from "react";

const STORAGE_KEY = "garba-open-tabs";
const CHANNEL_NAME = "garba-circle";

export function useTabPresence() {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME);

    // Keep same ID during page refresh
    let tabId = sessionStorage.getItem("garba-tab-id");
    if (!tabId) {
      tabId = crypto.randomUUID();
      sessionStorage.setItem("garba-tab-id", tabId);
    }

    const readTabs = () =>
      JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

    const writeTabs = (tabs) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
      setCount(Math.max(1, tabs.length));
      channel.postMessage("update");
    };

    const register = () => {
      const tabs = readTabs();

      if (!tabs.includes(tabId)) {
        writeTabs([...tabs, tabId]);
      } else {
        setCount(Math.max(1, tabs.length));
      }
    };

    const unregister = () => {
      const tabs = readTabs().filter((id) => id !== tabId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
      channel.postMessage("update");
    };

    const sync = () => {
      setCount(Math.max(1, readTabs().length));
    };

    register();

    channel.onmessage = sync;
    window.addEventListener("storage", sync);
    window.addEventListener("beforeunload", unregister);

    return () => {
      unregister();
      channel.close();
      window.removeEventListener("storage", sync);
      window.removeEventListener("beforeunload", unregister);
    };
  }, []);

  return count;
}