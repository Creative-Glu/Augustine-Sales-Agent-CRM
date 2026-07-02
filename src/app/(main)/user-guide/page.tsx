'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import {
  BookOpen,
  LayoutDashboard,
  Megaphone,
  Package,
  Tag,
  Target,
  Users,
  GitBranch,
  CalendarClock,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface GuideSection {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SECTIONS: GuideSection[] = [
  { id: 'getting-started', label: 'Getting started', icon: BookOpen },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'icp', label: 'ICP', icon: Target },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'offers', label: 'Offers', icon: Tag },
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { id: 'journey', label: 'Journey', icon: GitBranch },
  { id: 'meetings', label: 'Meetings', icon: CalendarClock },
];

export default function UserGuidePage() {
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      <Header
        title="User Guide"
        subtitle="A step-by-step walkthrough of every feature in the Others tab."
        icon={<BookOpen className="w-6 h-6 text-white" />}
        showLive={false}
      />

      <div className="px-6 py-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
          {/* ── Sticky table of contents ── */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-1">
              <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                On this page
              </p>
              {SECTIONS.map((s) => {
                const isActive = active === s.id;
                return (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <s.icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{s.label}</span>
                  </a>
                );
              })}
            </nav>
          </aside>

          {/* ── Main content ── */}
          <main className="space-y-12">
            <GettingStarted />
            <DashboardGuide />
            <IcpGuide />
            <ProductsGuide />
            <OffersGuide />
            <ContactsGuide />
            <CampaignsGuide />
            <JourneyGuide />
            <MeetingsGuide />
          </main>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Reusable building blocks
 * ────────────────────────────────────────────────────────────────────────── */

function SectionShell({
  id,
  title,
  description,
  icon: Icon,
  children,
}: {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{title}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm p-6 shadow-sm space-y-6">
        {children}
      </div>
    </section>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-xs font-bold text-blue-700 dark:text-blue-300">
        {n}
      </div>
      <div className="flex-1 pt-0.5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
          {title}
        </h3>
        <div className="text-sm text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 px-4 py-3">
      <Info className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
      <div className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">{children}</div>
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3">
      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
      <div className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function Warn({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 px-4 py-3">
      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
      <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">{children}</div>
    </div>
  );
}

/** Placeholder block — marks content the user will provide later. */
function Todo({ note }: { note: string }) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 px-3 py-2 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
      <span className="font-bold text-amber-600 dark:text-amber-400">TODO · </span>
      {note}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Section content
 * ────────────────────────────────────────────────────────────────────────── */

function GettingStarted() {
  return (
    <SectionShell
      id="getting-started"
      title="Getting started"
      description="The big picture — what each feature is for and the order to use them in."
      icon={BookOpen}
    >
      <p className="text-sm text-slate-700 dark:text-slate-300">
        This guide walks through every feature in the <strong>Others</strong> tab in the order
        you&apos;ll actually use them. The CRM follows a simple flow:
      </p>

      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
        {[
          { n: 1, label: 'Define your audience (ICP)', href: '#icp' },
          { n: 2, label: 'Create Products & Offers', href: '#products' },
          { n: 3, label: 'Upload Contacts', href: '#contacts' },
          { n: 4, label: 'Launch a Campaign', href: '#campaigns' },
        ].map((s) => (
          <Link
            key={s.n}
            href={s.href}
            className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all"
          >
            <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Step {s.n}
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-medium text-slate-800 dark:text-slate-100">{s.label}</span>
              <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors" />
            </div>
          </Link>
        ))}
      </ol>

      <Note>
        Once a campaign is launched, the system takes over automatically — sending outreach,
        tracking replies, and recording every lead&apos;s journey. You can watch progress live in
        the <strong>Dashboard</strong> and <strong>Journey</strong> pages.
      </Note>

      <Todo note="Add a short paragraph here introducing the product / who the CRM is for in your own words." />
    </SectionShell>
  );
}

function DashboardGuide() {
  return (
    <SectionShell
      id="dashboard"
      title="Dashboard"
      description="Your home screen — a live snapshot of how every campaign is performing right now."
      icon={LayoutDashboard}
    >
      <Step n={1} title="Open the Dashboard">
        Click <strong>Dashboard</strong> in the sidebar under the <em>Others</em> group. This is
        the page that loads by default when you sign in.
      </Step>

      <Step n={2} title="Read the KPI tiles at the top">
        The top row shows headline numbers — total leads, contacted, replied, meetings booked,
        and conversion rate. These update in real time as the system works.
        <Todo note="Confirm the exact KPI tiles you want documented (names + what each one means)." />
      </Step>

      <Step n={3} title="Use the charts to spot trends">
        The middle of the page shows trend charts — daily outreach volume, reply rate over time,
        and pipeline stage distribution.
        <Todo note="List the charts you want highlighted and any gotchas (e.g. timezone, what 'today' means)." />
      </Step>

      <Step n={4} title="Drill into a specific campaign or lead">
        Click any row or chart segment to jump straight into the underlying data — usually the
        Journey page filtered to that campaign or lead.
      </Step>

      <Tip>
        The Dashboard is read-only. To <em>change</em> anything (status, settings, leads) you
        head into the dedicated feature page.
      </Tip>
    </SectionShell>
  );
}

function IcpGuide() {
  return (
    <SectionShell
      id="icp"
      title="ICP — Ideal Customer Profile"
      description="Define WHO you're selling to. Every campaign needs at least one ICP."
      icon={Target}
    >
      <Step n={1} title="Open the ICP page">
        Sidebar → <strong>Others</strong> → <strong>ICP</strong>.
      </Step>

      <Step n={2} title="Click ‘New ICP’">
        Top right of the page. A modal opens with the fields you need to fill in.
      </Step>

      <Step n={3} title="Fill in the ICP details">
        Give it a clear name (e.g. <em>“Mid-sized parishes in the US”</em>) and a description
        explaining who fits this profile.
        <Todo note="List every ICP field you want documented and what 'good' looks like for each." />
      </Step>

      <Step n={4} title="Save the ICP">
        Hit <strong>Save</strong>. The ICP appears in the table and is immediately available to
        attach to an Offer.
      </Step>

      <Note>
        Think of an ICP as a <em>label for an audience</em>. You can have many ICPs and reuse
        them across Offers.
      </Note>
    </SectionShell>
  );
}

function ProductsGuide() {
  return (
    <SectionShell
      id="products"
      title="Products"
      description="Catalogue of what you actually sell. Products feed into Offers."
      icon={Package}
    >
      <Step n={1} title="Open the Products page">
        Sidebar → <strong>Others</strong> → <strong>Products</strong>.
      </Step>

      <Step n={2} title="Click ‘New Product’">
        A modal opens for product details.
      </Step>

      <Step n={3} title="Fill in the product info">
        Enter a name, pricing type (e.g. one-time, subscription) and price.
        <Todo note="Document every product field, pricing types you support, and what each one means." />
      </Step>

      <Step n={4} title="Save and reuse">
        Saved products appear in the catalogue. The same product can be attached to multiple
        offers.
      </Step>

      <Tip>
        Keep product names short and consistent — they show up in lots of other screens.
      </Tip>
    </SectionShell>
  );
}

function OffersGuide() {
  return (
    <SectionShell
      id="offers"
      title="Offers"
      description="An Offer ties a Product to an ICP — it's the ‘pitch’ a campaign uses."
      icon={Tag}
    >
      <Step n={1} title="Open the Offers page">
        Sidebar → <strong>Others</strong> → <strong>Offers</strong>.
      </Step>

      <Step n={2} title="Click ‘New Offer’">
        Top right.
      </Step>

      <Step n={3} title="Choose the ICP and Products">
        Pick the ICP this offer is aimed at, then attach one or more products.
        <Todo note="Spell out the offer fields users need to set, and any required-vs-optional rules." />
      </Step>

      <Step n={4} title="Save the Offer">
        Once saved, the offer becomes selectable when creating a Campaign.
      </Step>

      <Note>
        You can&apos;t launch a campaign without an Offer. So the natural order is always:
        ICP → Product → Offer → Campaign.
      </Note>
    </SectionShell>
  );
}

function ContactsGuide() {
  return (
    <SectionShell
      id="contacts"
      title="Contacts"
      description="The leads you'll be reaching out to — imported once, used by every campaign."
      icon={Users}
    >
      <Step n={1} title="Open the Contacts page">
        Sidebar → <strong>Others</strong> → <strong>Contacts</strong>.
      </Step>

      <Step n={2} title="Import or add contacts">
        Use the upload / new-contact button to bring leads in.
        <Todo note="Describe the supported import methods (CSV format? Manual entry? Required fields?)." />
      </Step>

      <Step n={3} title="Tag each contact with the right ICP">
        Make sure every contact has the correct ICP — campaigns target by ICP, so untagged
        contacts won&apos;t be reached.
        <Todo note="Confirm exactly how ICP gets attached to contacts in the UI." />
      </Step>

      <Step n={4} title="Spot-check before launching">
        Quickly scan the table — verify names, emails, institution, and ICP are filled in
        correctly.
      </Step>

      <Warn>
        Bad data in = bad outreach out. A typo in an email address means a wasted send and a
        bounce. Take 30 seconds to spot-check before you launch.
      </Warn>
    </SectionShell>
  );
}

function CampaignsGuide() {
  return (
    <SectionShell
      id="campaigns"
      title="Campaigns"
      description="Where everything comes together. A campaign automates outreach to your contacts."
      icon={Megaphone}
    >
      <Step n={1} title="Open the Campaigns page">
        Sidebar → <strong>Others</strong> → <strong>Campaigns</strong>.
      </Step>

      <Step n={2} title="Click ‘New Campaign’">
        Top right.
      </Step>

      <Step n={3} title="Configure the campaign">
        Give it a name, attach the Offer, set the template / tone / send limits, and add any
        instructions for the outreach agent.
        <Todo note="List every campaign field — name, offer, template, tone, send limit, instructions, etc. Include guidance on what to write for tone/instructions." />
      </Step>

      <Step n={4} title="Save as Draft">
        New campaigns start in <strong>Draft</strong> status. Nothing is sent yet — this gives
        you a chance to review.
      </Step>

      <Step n={5} title="Flip status to ‘Active’ when you&apos;re ready to go live">
        On the campaign row, change the status dropdown from <strong>Draft</strong> to
        <strong> Active</strong>. Confirm the prompt.
      </Step>

      <Step n={6} title="Wait for the campaign to auto-run">
        Once you set status to <strong>Active</strong>, the system queues it. Within roughly
        <strong> 10 minutes</strong> the outreach agent picks it up and starts sending. The
        status will flip from <strong>Active</strong> to <strong>Running</strong>{' '}
        <em>automatically</em> as soon as the first email goes out.
      </Step>

      <Step n={7} title="Pause or stop a campaign">
        Change the status to <strong>Stopped</strong> at any time to halt all further sends for
        that campaign.
      </Step>

      <Note>
        <p className="font-medium mb-1">Status lifecycle:</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>
            <strong>Draft</strong> — created but inactive, nothing is sent.
          </li>
          <li>
            <strong>Active</strong> — queued; the system will pick it up within ~10 minutes.
          </li>
          <li>
            <strong>Running</strong> — set automatically once the first outreach has gone out.
          </li>
          <li>
            <strong>Stopped</strong> — paused; no further outreach.
          </li>
        </ul>
      </Note>

      <Tip>
        Use the <strong>Status filter</strong> at the top of the Campaigns table to quickly see
        only Active or Running campaigns when you have many in flight.
      </Tip>

      <Todo note="Anything else campaign-related you want covered? (Editing, deleting, what happens to journeys when a campaign is deleted, etc.)" />
    </SectionShell>
  );
}

function JourneyGuide() {
  return (
    <SectionShell
      id="journey"
      title="Journey"
      description="The story of every individual lead — what was sent, when, and how they replied."
      icon={GitBranch}
    >
      <Step n={1} title="Open the Journey page">
        Sidebar → <strong>Others</strong> → <strong>Journey</strong>.
      </Step>

      <Step n={2} title="Use the filters to narrow down">
        Filter by campaign, stage, institution type, date range, or search by name / email to
        zero in on the leads you care about.
      </Step>

      <Step n={3} title="Read the stages">
        Each lead moves through stages — new, contacted, replied, meeting booked, won, etc.
        <Todo note="List the exact stages and what triggers each transition, in plain English." />
      </Step>

      <Step n={4} title="Click a lead to see their full timeline">
        Opens a detail view showing every email sent, every reply, and every status change for
        that lead.
        <Todo note="Confirm what info is shown in the per-lead detail view and any actions a user can take." />
      </Step>

      <Note>
        Journeys are <strong>read-only history</strong>. The outreach agent writes to them
        automatically — you don&apos;t edit a journey by hand.
      </Note>
    </SectionShell>
  );
}

function MeetingsGuide() {
  return (
    <SectionShell
      id="meetings"
      title="Meetings"
      description="Calendar slots that leads have booked through the outreach flow."
      icon={CalendarClock}
    >
      <Step n={1} title="Open the Meetings page">
        Sidebar → <strong>Others</strong> → <strong>Meetings</strong>.
      </Step>

      <Step n={2} title="Browse upcoming bookings">
        See every meeting that&apos;s been scheduled, with the lead&apos;s name, time, and which
        campaign drove the booking.
        <Todo note="Document the columns / filters you want covered on this page." />
      </Step>

      <Step n={3} title="Follow up before the meeting">
        Click a meeting to see the lead&apos;s full journey, then prep talking points based on
        what they&apos;ve already engaged with.
      </Step>

      <Tip>
        Bookings come in automatically from Calendly — no manual entry needed. If a meeting
        is missing here, check that the lead actually booked via the link in the outreach
        email.
      </Tip>

      <Todo note="Add any special workflow you want documented for handling no-shows, reschedules, or post-meeting status changes." />
    </SectionShell>
  );
}
