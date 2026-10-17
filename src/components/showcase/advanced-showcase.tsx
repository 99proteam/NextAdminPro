"use client";

import * as React from "react";
import { CheckCircle2, Copy, Download, FolderOpen, Inbox, LayoutGrid, List, MessageSquare, Package, Pencil, Share2, ShoppingCart, Trash2, Truck, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuTrigger } from "@/components/ui/context-menu";
import { CodeBlock, CopyButton } from "@/components/ui/copy-button";
import { Dropzone } from "@/components/ui/dropzone";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { AvatarGroup, EmptyState, Kbd, MiniSparkline, Spinner } from "@/components/ui/misc";
import { OtpInput } from "@/components/ui/otp-input";
import { Pagination } from "@/components/ui/pagination";
import { RadioCard, RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Rating } from "@/components/ui/rating";
import { Slider } from "@/components/ui/slider";
import { Stepper } from "@/components/ui/stepper";
import { TagInput } from "@/components/ui/tag-input";
import { Timeline } from "@/components/ui/timeline";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";

function Section({ title, description, children, className }: { title: string; description: string; children: React.ReactNode; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

const countries = ["Australia", "Brazil", "Canada", "France", "Germany", "India", "Japan", "Netherlands", "Singapore", "Spain", "United Arab Emirates", "United Kingdom", "United States"].map((c) => ({ value: c.toLowerCase(), label: c }));
const people = ["Alex Morgan", "Priya Mehta", "Jonas Hansen", "Yuki Tanaka", "Diego Reyes", "Fatima Khan", "Leo Dubois"];

export function AdvancedShowcase() {
  const [step, setStep] = React.useState(1);
  const [page, setPage] = React.useState(4);
  const [price, setPrice] = React.useState([40, 260]);
  const [volume, setVolume] = React.useState([65]);
  const [rating, setRating] = React.useState(4);
  const [tags, setTags] = React.useState(["nextjs", "dashboard"]);
  const [country, setCountry] = React.useState<string | null>("india");
  const [plan, setPlan] = React.useState("pro");
  const [view, setView] = React.useState("grid");

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 [&>*]:min-w-0">
      <Section title="Stepper" description="Guide people through multi-step flows like checkout or onboarding.">
        <Stepper current={step} steps={[{ title: "Cart", description: "Review items" }, { title: "Shipping", description: "Address" }, { title: "Payment", description: "Card details" }, { title: "Done", description: "Confirmation" }]} />
        <div className="mt-6 flex justify-between">
          <Button variant="outline" size="sm" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
          <Button size="sm" disabled={step === 4} onClick={() => setStep((s) => s + 1)}>{step >= 3 ? "Finish" : "Continue"}</Button>
        </div>
      </Section>

      <Section title="Accordion" description="Collapsible sections for FAQs, settings and details.">
        <Accordion type="single" collapsible defaultValue="a">
          <AccordionItem value="a">
            <AccordionTrigger>Is NextAdminPro free for commercial use?</AccordionTrigger>
            <AccordionContent>Yes, it’s MIT licensed, so you can use it for client work and SaaS products.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>Can I connect my own database?</AccordionTrigger>
            <AccordionContent>Swap the mock data in src/lib/data for Prisma, Drizzle, Supabase or any API.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="c">
            <AccordionTrigger>Does it support dark mode?</AccordionTrigger>
            <AccordionContent>Light, dark and system modes plus six accent colors.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </Section>

      <Section title="Alerts" description="Status messages with optional titles and actions.">
        <div className="flex flex-col gap-3">
          <Alert title="New version available">Refresh to get the latest features.</Alert>
          <Alert variant="success" title="Payment received">$1,240.00 from Globex was deposited.</Alert>
          <Alert variant="warning" title="Trial ends in 3 days" action={<Button size="sm" variant="outline">Upgrade</Button>}>Add a card to keep your data.</Alert>
          <Alert variant="destructive" title="Sync failed">We couldn’t reach Stripe. Retrying in 30s.</Alert>
        </div>
      </Section>

      <Section title="Sliders & radio groups" description="Range pickers and single-choice options.">
        <div className="flex flex-col gap-6">
          <div>
            <div className="mb-2 flex justify-between text-sm"><Label>Price range</Label><span className="tabular text-muted-foreground">${price[0]} – ${price[1]}</span></div>
            <Slider value={price} onValueChange={setPrice} min={0} max={500} step={10} aria-label="Price range" />
          </div>
          <div>
            <div className="mb-2 flex justify-between text-sm"><Label>Volume</Label><span className="tabular text-muted-foreground">{volume[0]}%</span></div>
            <Slider value={volume} onValueChange={setVolume} max={100} aria-label="Volume" />
          </div>
          <RadioGroup value={plan} onValueChange={setPlan} className="sm:grid-cols-3">
            <RadioCard value="starter" title="Starter" description="$0 / month" />
            <RadioCard value="pro" title="Pro" description="$29 / month" />
            <RadioCard value="team" title="Team" description="$99 / month" />
          </RadioGroup>
          <RadioGroup defaultValue="email" className="flex flex-wrap gap-4">
            {[["email", "Email"], ["sms", "SMS"], ["push", "Push"]].map(([v, label]) => (
              <label key={v} className="flex items-center gap-2 text-sm"><RadioGroupItem value={v} /> {label}</label>
            ))}
          </RadioGroup>
        </div>
      </Section>

      <Section title="Advanced inputs" description="Combobox, tag input, one-time code and star rating.">
        <div className="grid gap-5">
          <div className="flex flex-col gap-1.5"><Label>Country (searchable)</Label><Combobox options={countries} value={country} onChange={setCountry} placeholder="Select a country" /></div>
          <div className="flex flex-col gap-1.5"><Label>Tags</Label><TagInput value={tags} onChange={setTags} /><p className="text-xs text-muted-foreground">Press Enter or comma to add, Backspace to remove.</p></div>
          <div className="flex flex-col gap-1.5"><Label>Verification code</Label><OtpInput onComplete={(c) => toast.success(`Code ${c} verified`)} /></div>
          <div className="flex items-center gap-3"><Label>Your rating</Label><Rating value={rating} onChange={setRating} /><span className="text-sm text-muted-foreground tabular">{rating}/5</span></div>
        </div>
      </Section>

      <Section title="File upload" description="Drag-and-drop dropzone with a file list.">
        <Dropzone />
      </Section>

      <Section title="Timeline" description="Order history, audit trails and activity feeds.">
        <Timeline
          items={[
            { title: "Order placed", description: "Order #5140 for $578.88", time: "Oct 15, 9:12 AM", icon: ShoppingCart, tone: "primary" },
            { title: "Payment confirmed", description: "Visa •••• 4242", time: "Oct 15, 9:13 AM", icon: CheckCircle2, tone: "success" },
            { title: "Packed", description: "Austin DC", time: "Oct 15, 2:40 PM", icon: Package },
            { title: "Shipped with UPS", description: "1Z999AA10123456784", time: "Oct 16, 8:05 AM", icon: Truck, tone: "warning" },
          ]}
        />
      </Section>

      <Section title="Navigation" description="Breadcrumbs, pagination and segmented controls.">
        <div className="flex flex-col gap-6">
          <Breadcrumb items={[{ label: "Home", href: "/dashboard" }, { label: "Products", href: "/dashboard/products" }, { label: "Aurora Wireless Headphones" }]} />
          <Pagination page={page} total={20} onChange={setPage} className="flex-wrap" />
          <div className="flex flex-wrap gap-3">
            <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v)} aria-label="View">
              <ToggleGroupItem value="grid" aria-label="Grid"><LayoutGrid /> Grid</ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List"><List /> List</ToggleGroupItem>
            </ToggleGroup>
            <ToggleGroup type="multiple" defaultValue={["bold"]} aria-label="Text style">
              <ToggleGroupItem value="bold" aria-label="Bold"><Bold /></ToggleGroupItem>
              <ToggleGroupItem value="italic" aria-label="Italic"><Italic /></ToggleGroupItem>
              <ToggleGroupItem value="underline" aria-label="Underline"><Underline /></ToggleGroupItem>
            </ToggleGroup>
            <ToggleGroup type="single" defaultValue="left" aria-label="Alignment">
              <ToggleGroupItem value="left" aria-label="Align left"><AlignLeft /></ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Align center"><AlignCenter /></ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Align right"><AlignRight /></ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </Section>

      <Section title="Hover card & context menu" description="Rich previews on hover and right-click menus.">
        <div className="flex flex-col gap-5">
          <p className="text-sm">
            Assigned to{" "}
            <HoverCard openDelay={150}>
              <HoverCardTrigger asChild>
                <a href="#" onClick={(e) => e.preventDefault()} className="font-medium text-primary underline-offset-4 hover:underline">@priya</a>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="flex gap-3">
                  <Avatar name="Priya Mehta" className="size-10" />
                  <div>
                    <p className="font-semibold">Priya Mehta</p>
                    <p className="text-sm text-muted-foreground">Admin · Finance</p>
                    <p className="mt-2 text-xs text-muted-foreground">Joined March 2024 · 214 tasks completed</p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>{" "}
            (hover the name)
          </p>
          <ContextMenu>
            <ContextMenuTrigger className="flex h-28 items-center justify-center rounded-xl border-2 border-dashed text-sm text-muted-foreground">
              Right-click (or long-press) here
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onSelect={() => toast("Opened")}><FolderOpen /> Open <ContextMenuShortcut>⌘O</ContextMenuShortcut></ContextMenuItem>
              <ContextMenuItem onSelect={() => toast("Renamed")}><Pencil /> Rename <ContextMenuShortcut>F2</ContextMenuShortcut></ContextMenuItem>
              <ContextMenuItem onSelect={() => toast("Link copied")}><Share2 /> Share</ContextMenuItem>
              <ContextMenuItem onSelect={() => toast("Downloading")}><Download /> Download</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem destructive onSelect={() => toast("Deleted")}><Trash2 /> Delete <ContextMenuShortcut>⌫</ContextMenuShortcut></ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
      </Section>

      <Section title="Code & copy" description="Copy-to-clipboard buttons and code blocks for API keys and snippets.">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
            <code className="flex-1 truncate font-mono text-xs">nap_live_8f2c1a9b7e4d3f6a0b1c2d3e</code>
            <CopyButton value="nap_live_8f2c1a9b7e4d3f6a0b1c2d3e" label="Copy API key" />
          </div>
          <CodeBlock code={`curl https://api.yourapp.com/v1/orders \\\n  -H "Authorization: Bearer $API_KEY"`} />
        </div>
      </Section>

      <Section title="Feedback & misc" description="Spinners, keyboard keys, sparklines and avatar groups.">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-4">
            <Spinner />
            <Spinner className="size-7" />
            <Button disabled><Spinner className="size-4 text-current" /> Saving…</Button>
            <span className="text-sm text-muted-foreground">Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search</span>
          </div>
          <div className="flex items-center gap-6">
            <div><p className="text-xs text-muted-foreground">Revenue</p><p className="text-lg font-semibold">$84.8K</p></div>
            <MiniSparkline data={[12, 18, 14, 22, 19, 27, 25, 33, 31, 38]} />
            <AvatarGroup max={4}>{people.map((p) => <Avatar key={p} name={p} />)}</AvatarGroup>
          </div>
        </div>
      </Section>

      <Section title="Empty states" description="Helpful placeholders when there’s nothing to show.">
        <div className="grid gap-3 sm:grid-cols-2">
          <EmptyState icon={Inbox} title="Inbox zero" description="No new messages. Enjoy the quiet!" />
          <EmptyState icon={MessageSquare} title="No comments yet" description="Start the conversation." action={<Button size="sm" variant="outline"><Copy /> Invite</Button>} />
        </div>
      </Section>
    </div>
  );
}

