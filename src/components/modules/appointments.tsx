"use client";

import { CalendarCheck, CalendarClock, CalendarX, Check, Clock, MapPin, UserX, Video } from "lucide-react";
import { appointments, type Appointment } from "@/lib/data/modules";
import { NOW } from "@/lib/data/seed";
import { formatDate } from "@/lib/utils";
import { CrudPage } from "@/components/crud/crud-page";
import { StatusBadge } from "@/components/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const services: Appointment["service"][] = ["Product demo", "Onboarding call", "Consultation", "Quarterly review", "Support session"];
const locations: Appointment["location"][] = ["Zoom", "Google Meet", "Phone", "In person"];
const today = new Date(NOW).toISOString().slice(0, 10);
const staffList = [...new Set(appointments.map((a) => a.staff))];

export function AppointmentsModule() {
  return (
    <CrudPage<Appointment>
      title="Appointments"
      description="Bookings for demos, onboarding calls and consultations."
      entity="appointment"
      initial={appointments}
      exportName="appointments"
      initialSort={{ id: "when", desc: false }}
      searchText={(a) => `${a.client} ${a.email} ${a.service} ${a.staff}`}
      stats={[
        { label: "Today", icon: CalendarClock, value: (r) => String(r.filter((a) => a.date === today && a.status !== "cancelled").length) },
        { label: "Upcoming", icon: CalendarCheck, value: (r) => String(r.filter((a) => a.date >= today && (a.status === "confirmed" || a.status === "pending")).length) },
        { label: "Completed", icon: Check, tone: () => "success", value: (r) => String(r.filter((a) => a.status === "completed").length) },
        { label: "No-show rate", icon: UserX, value: (r) => { const past = r.filter((a) => a.status === "completed" || a.status === "no-show"); return past.length ? `${Math.round((r.filter((a) => a.status === "no-show").length / past.length) * 100)}%` : "—"; } },
      ]}
      filters={[
        { id: "status", label: "Status", value: (a) => a.status, options: ["confirmed", "pending", "completed", "cancelled", "no-show"].map((s) => ({ label: s.replace("-", " "), value: s })) },
        { id: "service", label: "Service", value: (a) => a.service, options: services.map((s) => ({ label: s, value: s })) },
        { id: "staff", label: "Staff", value: (a) => a.staff, options: staffList.map((s) => ({ label: s, value: s })) },
      ]}
      columns={[
        { id: "client", header: "Client", hideable: false, sortValue: (a) => a.client, cell: (a) => <div className="flex items-center gap-3"><Avatar name={a.client} /><div><p className="font-medium">{a.client}</p><p className="text-xs text-muted-foreground">{a.email}</p></div></div> },
        { id: "service", header: "Service", sortValue: (a) => a.service, cell: (a) => <Badge variant="outline">{a.service}</Badge> },
        { id: "when", header: "When", sortValue: (a) => `${a.date} ${a.time}`, exportValue: (a) => `${a.date} ${a.time}`, cell: (a) => <div className="text-sm"><p>{formatDate(a.date + "T00:00:00Z", { weekday: "short", month: "short", day: "numeric" })}</p><p className="text-xs text-muted-foreground"><Clock className="mr-1 inline size-3" />{a.time} · {a.duration} min</p></div> },
        { id: "location", header: "Location", sortValue: (a) => a.location, cell: (a) => <span className="inline-flex items-center gap-1.5 text-muted-foreground">{a.location === "In person" ? <MapPin className="size-3.5" /> : <Video className="size-3.5" />}{a.location}</span> },
        { id: "staff", header: "Host", sortValue: (a) => a.staff, cell: (a) => <span className="flex items-center gap-2"><Avatar name={a.staff} className="size-6 text-[10px]" />{a.staff}</span> },
        { id: "status", header: "Status", sortValue: (a) => a.status, cell: (a) => <StatusBadge status={a.status} /> },
      ]}
      rowActions={[
        { label: "Confirm", icon: Check, hidden: (a) => a.status !== "pending", onSelect: (a, api) => api.update(a.id, { status: "confirmed" }, `Confirmation sent to ${a.client}`) },
        { label: "Mark completed", icon: CalendarCheck, hidden: (a) => a.status !== "confirmed", onSelect: (a, api) => api.update(a.id, { status: "completed" }, "Marked completed") },
        { label: "Cancel", icon: CalendarX, destructive: true, hidden: (a) => a.status === "cancelled" || a.status === "completed", onSelect: (a, api) => api.update(a.id, { status: "cancelled" }, "Appointment cancelled") },
      ]}
      fields={[
        { name: "client", label: "Client name", required: true },
        { name: "email", label: "Client email", type: "email" },
        { name: "service", label: "Service", type: "select", options: services },
        { name: "staff", label: "Host", type: "select", options: staffList },
        { name: "date", label: "Date", type: "date", required: true },
        { name: "time", label: "Time", type: "time", required: true },
        { name: "duration", label: "Duration (min)", type: "select", options: ["15", "30", "45", "60"] },
        { name: "location", label: "Location", type: "select", options: locations },
      ]}
      toForm={(a) => ({ ...a, duration: String(a.duration) })}
      fromForm={(v, e) => ({ id: e?.id ?? `apt_${Date.now()}`, client: String(v.client), email: String(v.email), service: v.service as Appointment["service"], staff: String(v.staff), date: String(v.date), time: String(v.time), duration: Number(v.duration), location: v.location as Appointment["location"], status: e?.status ?? "confirmed" })}
    >
      {(api) => {
        const todays = api.rows.filter((a) => a.date === today && a.status !== "cancelled").sort((a, b) => a.time.localeCompare(b.time));
        return (
          <Card className="mb-4">
            <CardHeader><CardTitle>Today’s schedule</CardTitle></CardHeader>
            <CardContent>
              {todays.length === 0 ? (
                <p className="text-sm text-muted-foreground">No appointments today.</p>
              ) : (
                <ol className="flex gap-3 overflow-x-auto pb-1">
                  {todays.map((a) => (
                    <li key={a.id} className="w-56 shrink-0 rounded-lg border-l-4 border-primary bg-muted/40 p-3">
                      <p className="text-xs font-semibold text-primary">{a.time} · {a.duration} min</p>
                      <p className="mt-1 text-sm font-medium">{a.service}</p>
                      <p className="text-xs text-muted-foreground">{a.client} with {a.staff}</p>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        );
      }}
    </CrudPage>
  );
}
