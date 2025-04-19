"use client"
import React, { useState, useEffect } from "react"
import { Edit } from "lucide-react"
import { Card } from "../ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"
import { Table } from "../ui/table"
import { Switch } from "../ui/switch"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Separator } from "../ui/separator"
import { UpdateProfileForm } from "./UpdateProfileForm"
import { useUser } from "@/lib/stores/user"

// Define TypeScript interfaces based on the provided schema

interface Notification {
  id: number;
  message: string;
  date: string;
  read: boolean;
}

interface AuditLog {
  id: number;
  action: string;
  date: string;
}

const notifications: Notification[] = [
  { id: 1, message: "Simulation completed: Port Strike Scenario", date: "2025-04-15", read: false },
  { id: 2, message: "New risk alert: Supplier X at 80% risk", date: "2025-04-14", read: true },
]

const auditLogs: AuditLog[] = [
  { id: 1, action: "Ran simulation: Earthquake in Japan", date: "2025-04-13" },
  { id: 2, action: "Changed theme to dark", date: "2025-04-12" },
]

// Default values for properties not in schema
const defaultPreferences = {
  email: true,
  sms: false,
  dashboard: true
};

const defaultTheme = "light";
const defaultLayout = "default";

export function ProfilePage(): React.ReactElement {

  const { userData,setUserData, userLoading } = useUser();
  
  // Declare all hooks at the top level, before any conditional logic
  const [theme, setTheme] = useState<string>(defaultTheme);
  const [notifPrefs, setNotifPrefs] = useState(defaultPreferences);
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState<boolean>(false);

  useEffect(() => {
    setUserData()
  }, []);

  // If still loading or no user data, show loading state
  if (userLoading || !userData) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <Card className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6">
        <Avatar className="w-20 h-20">
          {/* Using Avatar Fallback to display first letter of organization name */}
          <AvatarFallback className="bg-primary text-primary-foreground">
            {userData.organisation_name ? userData.organisation_name[0].toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="text-2xl font-bold">{userData.organisation_name || "Unnamed Organization"}</div>
          <div className="text-muted-foreground">{userData.email}</div>
          <div className="mt-1 text-sm text-primary/80">
            {userData.industry || "No industry specified"} - {userData.sub_industry || "No sub-industry specified"}
          </div>
          
          <div className="mt-2 text-sm">
            <span className="font-medium">Location:</span> {userData.location || "Not specified"}
          </div>
          <div className="mt-1 text-sm">
            <span className="font-medium">Employees:</span> {userData.employee_count || "Not specified"}
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => setIsUpdateFormOpen(true)}
        >
          <Edit className="h-4 w-4" />
          Update Profile
        </Button>
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
                    onCheckedChange={(v: boolean) => setNotifPrefs(p => ({ ...p, email: v }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>SMS Notifications</span>
                  <Switch
                    checked={notifPrefs.sms}
                    onCheckedChange={(v: boolean) => setNotifPrefs(p => ({ ...p, sms: v }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Dashboard Alerts</span>
                  <Switch
                    checked={notifPrefs.dashboard}
                    onCheckedChange={(v: boolean) => setNotifPrefs(p => ({ ...p, dashboard: v }))}
                  />
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="font-semibold">Dashboard Layout</div>
                <label htmlFor="layout-select" className="sr-only">Dashboard Layout</label>
                <select 
                  id="layout-select" 
                  aria-label="Dashboard Layout" 
                  className="border rounded px-2 py-1 w-full" 
                  defaultValue={defaultLayout}
                >
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

      {/* Profile Update Form Modal */}
      <UpdateProfileForm 
        isOpen={isUpdateFormOpen} 
        onClose={() => setIsUpdateFormOpen(false)}
        currentProfile={userData}
      />
    </div>
  )
}