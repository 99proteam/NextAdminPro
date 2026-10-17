"use client";

import * as React from "react";
import { AlertTriangle, Bell, Check, ChevronDown, Info, Loader2, Mail, Plus, Settings, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/status-badge";
import { SponsorButton } from "@/components/sponsor-button";
import { ConfirmDialog } from "@/components/form-helpers";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip } from "@/components/ui/tooltip";

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">{children}</CardContent>
    </Card>
  );
}

export function ComponentsShowcase() {
  const [confirm, setConfirm] = React.useState(false);
  const [progress, setProgress] = React.useState(64);
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">UI Components</h1>
        <p className="mt-1 text-sm text-muted-foreground">The building blocks of NextAdminPro, all in <code className="rounded bg-muted px-1 text-xs">src/components/ui</code>. Every component supports dark mode and accent themes.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Buttons" description="Variants and sizes for every action.">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive"><Trash2 /> Delete</Button>
          <Button variant="link">Link</Button>
          <Button size="sm"><Plus /> Small</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Settings"><Settings /></Button>
          <Button disabled><Loader2 className="animate-spin" /> Loading</Button>
          <SponsorButton size="sm" />
        </Section>

        <Section title="Badges & status" description="Status always pairs color with an icon and a label.">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success"><Check /> Success</Badge>
          <Badge variant="warning"><AlertTriangle /> Warning</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <StatusBadge status="delivered" />
          <StatusBadge status="processing" />
          <StatusBadge status="overdue" />
          <StatusBadge status="low-stock" />
        </Section>

        <Section title="Form controls" description="Inputs, selects, toggles and checkboxes.">
          <div className="grid w-full gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sc-email">Email</Label>
              <Input id="sc-email" type="email" placeholder="you@company.com" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Plan</Label>
              <Select defaultValue="pro">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="sc-msg">Message</Label>
              <Textarea id="sc-msg" placeholder="Write something…" />
            </div>
            <label className="flex items-center gap-2 text-sm"><Checkbox defaultChecked /> Accept terms</label>
            <label className="flex items-center gap-2 text-sm"><Switch defaultChecked /> Email notifications</label>
          </div>
        </Section>

        <Section title="Overlays" description="Dialogs, dropdowns, popovers, tooltips and toasts.">
          <Dialog>
            <DialogTrigger asChild><Button variant="outline">Open dialog</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogDescription>Dialogs trap focus and close on Escape.</DialogDescription>
              </DialogHeader>
              <Input defaultValue="Alex Morgan" aria-label="Name" />
              <DialogFooter><Button>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => setConfirm(true)}>Confirm dialog</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline">Dropdown <ChevronDown /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>My account</DropdownMenuLabel>
              <DropdownMenuItem><Mail /> Messages</DropdownMenuItem>
              <DropdownMenuItem><Bell /> Notifications</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive><Trash2 /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Popover>
            <PopoverTrigger asChild><Button variant="outline">Popover</Button></PopoverTrigger>
            <PopoverContent align="start"><p className="text-sm">Popovers hold rich content like filters or mini forms.</p></PopoverContent>
          </Popover>
          <Tooltip content="Helpful hint"><Button variant="outline" size="icon" aria-label="Info"><Info /></Button></Tooltip>
          <Button variant="outline" onClick={() => toast.success("Saved!", { description: "Your changes are live." })}>Success toast</Button>
          <Button variant="outline" onClick={() => toast.error("Something went wrong")}>Error toast</Button>
          <ConfirmDialog open={confirm} onOpenChange={setConfirm} title="Delete this item?" description="This action cannot be undone." onConfirm={() => { setConfirm(false); toast.success("Deleted"); }} />
        </Section>

        <Section title="Tabs" description="Switch between related views.">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="text-sm text-muted-foreground">Overview content goes here.</TabsContent>
            <TabsContent value="activity" className="text-sm text-muted-foreground">Recent activity goes here.</TabsContent>
            <TabsContent value="settings" className="text-sm text-muted-foreground">Settings go here.</TabsContent>
          </Tabs>
        </Section>

        <Section title="Progress, avatars & skeletons" description="Feedback and identity.">
          <div className="flex w-full flex-col gap-4">
            <div className="flex items-center gap-3">
              <Progress value={progress} />
              <Button size="sm" variant="outline" onClick={() => setProgress((p) => (p >= 100 ? 0 : p + 12))}>+</Button>
            </div>
            <div className="flex -space-x-2">
              {["Alex Morgan", "Priya Mehta", "Jonas Hansen", "Yuki Tanaka", "Diego Reyes"].map((n) => <Avatar key={n} name={n} className="ring-2 ring-card" />)}
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-2"><Skeleton className="h-3 w-2/3" /><Skeleton className="h-3 w-1/3" /></div>
            </div>
          </div>
        </Section>

        <Section title="Alerts" description="Inline messages for important information.">
          <div className="flex w-full flex-col gap-3">
            <div className="flex gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm"><Info className="size-4 shrink-0 text-primary" /> A new version is available. Refresh to update.</div>
            <div className="flex gap-3 rounded-lg border border-warning/40 bg-warning/8 p-3 text-sm"><AlertTriangle className="size-4 shrink-0 text-warning" /> Your trial ends in 3 days.</div>
            <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm"><AlertTriangle className="size-4 shrink-0 text-destructive" /> Payment failed. Update your card to avoid interruption.</div>
            <div className="flex gap-3 rounded-lg border border-success/30 bg-success/5 p-3 text-sm"><Check className="size-4 shrink-0 text-success" /> All systems operational.</div>
          </div>
        </Section>

        <Section title="Empty state" description="Guide people when there’s nothing to show yet.">
          <div className="flex w-full flex-col items-center gap-3 rounded-xl border border-dashed py-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted"><Mail className="size-5 text-muted-foreground" /></span>
            <div>
              <p className="font-medium">No messages yet</p>
              <p className="text-sm text-muted-foreground">When customers write in, their messages appear here.</p>
            </div>
            <Button size="sm"><Plus /> Compose</Button>
          </div>
        </Section>
      </div>
    </>
  );
}
