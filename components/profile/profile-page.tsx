"use client"
import { User } from "lucide-react"
import { Card } from "../ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"
import { Table } from "../ui/table"
import { Switch } from "../ui/switch"
import { Button } from "../ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar"
import { Separator } from "../ui/separator"
import { useState } from "react"

// Dummy user data
const user = {
  name: "Alex Morgan",
  email: "alex.morgan@acme.com",
  role: "Supply Chain Analyst",
  avatar: "/placeholder-user.jpg",
  theme: "light",
  notificationPreferences: {
    email: true,
    sms: false,
    dashboard: true,
  },
  dashboardLayout: "default",
}

const notifications = [
  { id: 1, message: "Simulation completed: Port Strike Scenario", date: "2025-04-15", read: false },
  { id: 2, message: "New risk alert: Supplier X at 80% risk", date: "2025-04-14", read: true },
]

const auditLogs = [
  { id: 1, action: "Ran simulation: Earthquake in Japan", date: "2025-04-13" },
  { id: 2, action: "Changed theme to dark", date: "2025-04-12" },
]

export function ProfilePage() {
  const [theme, setTheme] = useState(user.theme)
  const [notifPrefs, setNotifPrefs] = useState(user.notificationPreferences)

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <Card className="flex items-center gap-6 p-6">
        <Avatar className="w-20 h-20">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <div className="text-2xl font-bold">{user.name}</div>
          <div className="text-muted-foreground">{user.email}</div>
          <div className="mt-1 text-sm text-primary/80">{user.role}</div>
        </div>
      </Card>
      <Tabs defaultValue="settings" className="w-full">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>
        <TabsContent value="settings">
          <Card className="p-6 space-y-6">
            <div className="font-semibold text-lg">Preferences</div>
            <Separator />
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="theme-select" className="mr-2">Theme</label>
                  <select
                    id="theme-select"
                    aria-label="Theme"
                    className="border rounded px-2 py-1"
                    value={theme}
                    onChange={e => setTheme(e.target.value)}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span>Email Notifications</span>
                  <Switch
                    checked={notifPrefs.email}
                    onCheckedChange={v => setNotifPrefs(p => ({ ...p, email: v }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>SMS Notifications</span>
                  <Switch
                    checked={notifPrefs.sms}
                    onCheckedChange={v => setNotifPrefs(p => ({ ...p, sms: v }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Dashboard Alerts</span>
                  <Switch
                    checked={notifPrefs.dashboard}
                    onCheckedChange={v => setNotifPrefs(p => ({ ...p, dashboard: v }))}
                  />
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="font-semibold">Dashboard Layout</div>
                <label htmlFor="layout-select" className="sr-only">Dashboard Layout</label>
                <select id="layout-select" aria-label="Dashboard Layout" className="border rounded px-2 py-1 w-full" defaultValue={user.dashboardLayout}>
                  <option value="default">Default</option>
                  <option value="compact">Compact</option>
                  <option value="analytics">Analytics Focus</option>
                </select>
                <div className="font-semibold mt-6">Change Password</div>
                <input type="password" placeholder="New password" className="border rounded px-2 py-1 w-full" />
                <Button className="mt-2 w-full">Update Password</Button>
              </div>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card className="p-6">
            <div className="font-semibold text-lg mb-4">Recent Notifications</div>
            <Table>
              <thead>
                <tr>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map(n => (
                  <tr key={n.id} className={n.read ? "opacity-60" : "font-semibold"}>
                    <td>{n.message}</td>
                    <td>{n.date}</td>
                    <td>{n.read ? "Read" : "Unread"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </TabsContent>
        <TabsContent value="audit">
          <Card className="p-6">
            <div className="font-semibold text-lg mb-4">Recent Activity</div>
            <Table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id}>
                    <td>{log.action}</td>
                    <td>{log.date}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
      <Card className="p-6 flex flex-wrap gap-4 justify-between">
        <div>
          <div className="font-semibold mb-1">Quick Links</div>
          <div className="flex gap-3 flex-wrap">
            <Button variant="outline" asChild><a href="/digital-twin">Digital Twin</a></Button>
            <Button variant="outline" asChild><a href="/simulation">Simulations</a></Button>
            <Button variant="outline" asChild><a href="/strategy">Strategies</a></Button>
            <Button variant="outline" asChild><a href="/analytics">KPI Dashboard</a></Button>
            <Button variant="outline" asChild><a href="/advanced-tools">Advanced Tools</a></Button>
          </div>
        </div>
      </Card>
    </div>
  )
}