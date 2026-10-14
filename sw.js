// Service worker: shows notices on the phone even when the site is closed.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) {}
  e.waitUntil((async () => {
    // If the student is looking at the site right now, the pop-up on the page already shows it
    const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    if (wins.some(w => w.visibilityState === "visible" && w.focused)) return;
    await self.registration.showNotification(d.title || "New notice", {
      body: d.body || "Tap to read the notice from the institute.",
      icon: "/logo.svg",
      badge: "/logo.svg",
      tag: "notice-" + (d.id || "new"),
      renotify: true,
      requireInteraction: true,
      vibrate: [200, 100, 200],
      data: { url: d.url || "/notices.html" }
    });
  })());
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "/notices.html";
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const w of wins) { if ("focus" in w) { await w.focus(); if ("navigate" in w) { try { await w.navigate(url); } catch (x) {} } return; } }
    await self.clients.openWindow(url);
  })());
});
