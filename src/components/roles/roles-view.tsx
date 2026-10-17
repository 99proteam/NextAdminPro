"use client";

import * as React from "react";
import { Lock, MailPlus, MoreHorizontal, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Role, TeamMember } from "@/lib/data";
import { actions, defaultPermissions, resources, roles, type PermissionMatrix } from "@/lib/permissions";
import { formatRelative } from "@/lib/time";
import { StatusBadge } from "@/components/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function RolesView({ initialTeam }: { initialTeam: TeamMember[] }) {
  const [team, setTeam] = React.useState(initialTeam);
  const [matrix, setMatrix] = React.useState<PermissionMatrix>(defaultPermissions);
  const [role, setRole] = React.useState<Role>("Manager");
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);

  const toggle = (resource: (typeof resources)[number], action: (typeof actions)[number], value: boolean) => {
    setMatrix((m) => ({ ...m, [role]: { ...m[role], [resource]: { ...m[role][resource], [action]: value } } }));
    setDirty(true);
  };

  const patchMember = (id: string, p: Partial<TeamMember>, msg: string) => {
    setTeam((t) => t.map((m) => (m.id === id ? { ...m, ...p } : m)));
    toast.success(msg);
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Roles &amp; Permissions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Control who can see and change what across your workspace.</p>
        </div>
        <Button onClick={() => setInviteOpen(true)}><MailPlus /> Invite member</Button>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {roles.map((r) => (
          <Card key={r.name} className="p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{r.name}</p>
              <Badge variant="secondary">{team.filter((m) => m.role === r.name).length} members</Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{r.description}</p>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="team">
        <TabsList>
          <TabsTrigger value="team">Team members</TabsTrigger>
          <TabsTrigger value="permissions">Permission matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="team">
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5">Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>2FA</TableHead>
                  <TableHead>Last active</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3">
                        <Avatar name={m.name} />
                        <div>
                          <p className="font-medium">{m.name}</p>
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {m.role === "Owner" ? (
                        <Badge variant="outline"><Lock /> Owner</Badge>
                      ) : (
                        <Select value={m.role} onValueChange={(v) => patchMember(m.id, { role: v as Role }, `${m.name} is now ${v}`)}>
                          <SelectTrigger className="h-8 w-32" aria-label={`Role for ${m.name}`}><SelectValue /></SelectTrigger>
                          <SelectContent>{roles.filter((r) => r.name !== "Owner").map((r) => <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}</SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell><StatusBadge status={m.status} /></TableCell>
                    <TableCell>
                      {m.twoFactor ? <Badge variant="success"><ShieldCheck /> Enabled</Badge> : <Badge variant="secondary"><ShieldOff /> Off</Badge>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatRelative(m.lastActiveAt)}</TableCell>
                    <TableCell>
                      {m.role !== "Owner" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${m.name}`}><MoreHorizontal /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {m.status === "invited" && <DropdownMenuItem onSelect={() => toast.success(`Invite resent to ${m.email}`)}><MailPlus /> Resend invite</DropdownMenuItem>}
                            <DropdownMenuItem onSelect={() => patchMember(m.id, { status: m.status === "suspended" ? "active" : "suspended" }, m.status === "suspended" ? "Member reactivated" : "Member suspended")}>
                              <ShieldOff /> {m.status === "suspended" ? "Reactivate" : "Suspend"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem destructive onSelect={() => { setTeam((t) => t.filter((x) => x.id !== m.id)); toast.success(`${m.name} removed`); }}><Trash2 /> Remove</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <CardTitle>Permissions for {role}</CardTitle>
                <CardDescription>{roles.find((r) => r.name === role)?.description}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger className="w-36" aria-label="Role"><SelectValue /></SelectTrigger>
                  <SelectContent>{roles.map((r) => <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}</SelectContent>
                </Select>
                <Button disabled={!dirty} onClick={() => { setDirty(false); toast.success("Permissions saved"); }}>Save</Button>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-5">Resource</TableHead>
                    {actions.map((a) => <TableHead key={a} className="text-center capitalize">{a}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map((res) => (
                    <TableRow key={res}>
                      <TableCell className="pl-5 font-medium">{res}</TableCell>
                      {actions.map((a) => (
                        <TableCell key={a} className="text-center">
                          <Checkbox
                            aria-label={`${role} can ${a} ${res}`}
                            checked={matrix[role][res][a]}
                            disabled={role === "Owner"}
                            onCheckedChange={(v) => toggle(res, a, v === true)}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {role === "Owner" && <p className="px-5 pt-3 text-xs text-muted-foreground"><Lock className="mr-1 inline size-3" />Owner permissions can’t be changed.</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a team member</DialogTitle>
            <DialogDescription>They’ll get an email with a link to join your workspace.</DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
              if (!/^\S+@\S+\.\S+$/.test(f.email)) return toast.error("Enter a valid email");
              const name = f.email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
              setTeam((t) => [...t, { id: `usr_${t.length + 10}`, name, email: f.email, role: f.role as Role, status: "invited", lastActiveAt: new Date().toISOString(), twoFactor: false }]);
              setInviteOpen(false);
              toast.success(`Invitation sent to ${f.email}`);
            }}
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-email">Email address</Label>
              <Input id="invite-email" name="email" type="email" placeholder="teammate@company.com" autoFocus />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Role</Label>
              <Select name="role" defaultValue="Editor">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{roles.filter((r) => r.name !== "Owner").map((r) => <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
              <Button type="submit"><MailPlus /> Send invite</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
