"use client"
import React, { useState, useEffect } from "react"
import { Edit, Lock, Mail, Phone, Globe } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Switch } from "../ui/switch"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Skeleton } from "../ui/skeleton"
import { UpdateProfileForm } from "./UpdateProfileForm"
import { ChangePasswordDialog } from "./ChangePasswordDialog"
import { useUser } from "@/lib/stores/user"

// Default values for notification preferences
const defaultPreferences = {
  email: true,
  sms: false
};

export function ProfilePage(): React.ReactElement {
  const { userData, setUserData, userLoading } = useUser();
  
  const [notifPrefs, setNotifPrefs] = useState(defaultPreferences);
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState<boolean>(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    setUserData()
  }, []);

  // If still loading or no user data, show skeleton loading
  if (userLoading || !userData) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
        {/* Profile Header Skeleton */}
        <Card className="overflow-hidden border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
              <div className="relative">
                <Skeleton className="w-24 h-24 rounded-full" />
              </div>
              
              <div className="flex-1 space-y-3">
                <div>
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-5 w-48" />
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <Skeleton className="h-8 w-32 rounded-full" />
                  <Skeleton className="h-8 w-28 rounded-full" />
                  <Skeleton className="h-8 w-24 rounded-full" />
                </div>
              </div>
              
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notification Preferences Skeleton */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
                <Skeleton className="w-10 h-6 rounded-full" />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-28 mb-1" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
                <Skeleton className="w-10 h-6 rounded-full" />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings Skeleton */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <Skeleton className="h-6 w-36" />
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-3 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>

          {/* Quick Access Skeleton */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Profile Header Card */}
      <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            <div className="relative">
              <Avatar className="w-24 h-24 ring-4 ring-primary/20 shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-2xl font-bold">
                  {userData.organisation_name ? userData.organisation_name[0].toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white dark:border-slate-900"></div>
            </div>
            
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  {userData.organisation_name || "Unnamed Organization"}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg">{userData.email}</p>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 rounded-full text-blue-700 dark:text-blue-300">
                  <Globe className="h-4 w-4" />
                  <span>{userData.industry || "No industry"} - {userData.sub_industry || "No sub-industry"}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-full text-emerald-700 dark:text-emerald-300">
                  <span>📍 {userData.location || "Location not specified"}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-950/30 rounded-full text-purple-700 dark:text-purple-300">
                  <span>👥 {userData.employee_count || "N/A"} employees</span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => setIsUpdateFormOpen(true)}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200 gap-2"
            >
              <Edit className="h-4 w-4" />
              Update Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Notification Preferences */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-blue-500" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">Email Notifications</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">Receive updates via email</p>
                </div>
              </div>
              <Switch
                checked={notifPrefs.email}
                onCheckedChange={(v: boolean) => setNotifPrefs(p => ({ ...p, email: v }))}
                className="flex-shrink-0 ml-3"
              />
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">SMS Notifications</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">Receive alerts via SMS</p>
                </div>
              </div>
              <Switch
                checked={notifPrefs.sms}
                onCheckedChange={(v: boolean) => setNotifPrefs(p => ({ ...p, sms: v }))}
                className="flex-shrink-0 ml-3"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="h-5 w-5 text-red-500" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <h4 className="font-medium mb-2">Password</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Keep your account secure with a strong password
                </p>
                <Button 
                  onClick={() => setIsPasswordDialogOpen(true)}
                  variant="outline" 
                  className="w-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Quick Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <Button variant="outline" asChild className="justify-start h-12 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700">
                <a href="/digital-twin" className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    🔗
                  </div>
                  Digital Twin
                </a>
              </Button>
              <Button variant="outline" asChild className="justify-start h-12 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700">
                <a href="/simulation" className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    ⚡
                  </div>
                  Simulations
                </a>
              </Button>
              <Button variant="outline" asChild className="justify-start h-12 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700">
                <a href="/strategy" className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    📊
                  </div>
                  Strategies
                </a>
              </Button>
              <Button variant="outline" asChild className="justify-start h-12 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700">
                <a href="/analytics" className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    📈
                  </div>
                  Analytics
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Update Form Modal */}
      <UpdateProfileForm 
        isOpen={isUpdateFormOpen} 
        onClose={() => setIsUpdateFormOpen(false)}
        currentProfile={userData}
      />

      {/* Password Change Dialog */}
      <ChangePasswordDialog 
        isOpen={isPasswordDialogOpen} 
        onClose={() => setIsPasswordDialogOpen(false)}
      />
    </div>
  )
}