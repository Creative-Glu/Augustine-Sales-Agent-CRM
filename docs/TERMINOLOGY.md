Campaign System Terminology — Simple Definitions with Examples
Let me break down all the key terms you'll encounter in this Augustine project (and most B2B sales/marketing systems in general). I'll keep each one short, plain, and with a real example.
Core Terms
ICP (Ideal Customer Profile)
The type of person or business you want to sell to — your dream customer described on paper.

Example: "School Principals in Tier-2 Indian cities, managing schools with 500-2000 students, CBSE board." That's an ICP. Not a specific person — a profile that many real people could match.

Lead
An actual real person/company that matches an ICP and could potentially buy from you.

Example: "Mr. Rajesh Sharma, Principal of DAV Public School, Indore" — he's a lead because he fits the principal ICP above.

Product
The actual thing you sell.

Example: "VidyaPro Smart Classroom Software" or "Augustine Bible Study Toolkit."

Offer
A specific pitch of your product to a specific ICP. The same product can have multiple offers for different audiences.

Example: Same software can be offered as "Affordable Suite for Government Schools" to one ICP and "Premium Suite for International Schools" to another. Different angle, different price, same underlying product.

Campaign
A planned outreach effort — when, how, and to whom you'll push an offer.

Example: "Q1 2026 Indore Schools Outreach" — a 6-week campaign emailing 200 principals about the affordable suite offer.

Outreach
The actual act of reaching out to leads — sending the emails, messages, or calls.

Example: When N8N sends 200 personalized emails to those principals on Day 1 of the campaign, that's outreach.

Lead Lifecycle Terms (Stages a Lead Moves Through)
Cold Lead
Hasn't been contacted yet, or contacted but hasn't responded. They don't know you exist.

Example: A principal whose email is in your database but hasn't received any message yet.

Engaged
The lead has replied or shown interest (clicked a link, asked a question, opened multiple emails).

Example: A principal who replied "Tell me more about pricing" — now they're engaged.

MQL (Marketing Qualified Lead)
A lead who has shown enough interest that the marketing system thinks they're worth a sales conversation. Usually based on behavior — opened emails, clicked Calendly, downloaded a brochure.

Example: A principal who clicked the demo link AND replied AND visited your pricing page — automation flags them as MQL.

SQL (Sales Qualified Lead)
A step beyond MQL — a salesperson has personally verified the lead is ready to buy (right budget, right timing, decision-maker).

Example: After a discovery call, sales confirms the principal has budget approval and wants to roll out next semester. Now they're SQL.

Disqualified
The lead said no, isn't a fit, or asked to be removed.

Example: A principal who replied "We already use a competitor, please remove us."

Closed-Won
The deal is done — they paid, they signed, they're a customer now. 🎉

Example: The school signed a 1-year contract for ₹3 lakh.

Closed-Lost
The deal didn't happen — they chose a competitor or dropped off.

Example: The principal went silent for 3 months after pricing discussion.

System & Automation Terms
Automation / Workflow
A pre-set series of actions that runs without humans pressing buttons each time.

Example: "When a lead replies positively → send Calendly link → tag as Engaged → ping Slack." That whole sequence is an automation.

Trigger
The event that starts an automation.

Example: Campaign status changing to "Active" is a trigger that makes N8N start sending emails.

Webhook
A way for two software tools to talk to each other automatically — when something happens in App A, App A "calls" App B with the info.

Example: When a lead clicks Calendly, Calendly fires a webhook to Slack so the team sees the alert instantly.

Integration
When two tools are connected so they can share data.

Example: Gmail integrated with N8N so N8N can send emails through your Gmail account.

Database
The organized storage where all your data lives (in this project, that's Supabase).

Example: All your products, offers, campaigns, and leads are stored as rows in tables inside the Supabase database.

Table
A spreadsheet-like collection inside a database, holding one type of data.

Example: The leads table holds all lead records. The campaigns table holds all campaigns.

Foreign Key
A field in one table that points to another table — it's how tables stay connected.

Example: The campaigns table has an offer_id field that points to a row in the offers table. That's a foreign key linking them.

Row / Record
One single entry in a table.

Example: One specific principal's contact info is one row in the leads table.

Email & Marketing Terms
Open Rate
% of people who opened your email.

Example: You sent 100 emails, 35 opened → 35% open rate.

Click Rate (CTR)
% of people who clicked a link inside your email.

Example: 10 out of 100 clicked the Calendly link → 10% CTR.

Bounce
Email couldn't be delivered (wrong address, full inbox).

Example: You sent to principal@oldschool.in but the domain doesn't exist anymore → bounce.

Opt-out / Unsubscribe
The lead asks not to receive emails anymore.

Example: Principal clicks "Unsubscribe" link in your email — system marks them as opted out.

Drip Campaign / Sequence
A series of emails sent over time, not all at once.

Example: Day 1 intro email → Day 4 case study email → Day 8 final follow-up. That's a 3-email drip.

Cold Email
First email to someone who has never heard from you.

Example: The very first message to a principal who didn't ask to be contacted.

Follow-up
A second/third email to someone who didn't reply to the first.

Example: "Hi Mr. Sharma, following up on my email from last week..."

Calendly
A scheduling tool — you send someone a link, they pick a time, calendar invite auto-created.

Example: Principal clicks "Book a demo" → sees your available slots → books Tuesday 4 PM.

Sales Funnel Terms
Top of Funnel (TOFU)
People just becoming aware you exist. Largest group.

Example: 1000 principals receiving your first cold email.

Middle of Funnel (MOFU)
People considering you — engaged but not buying yet.

Example: 200 principals who opened your email and clicked a link.

Bottom of Funnel (BOFU)
People close to buying — talking pricing, demos, contracts.

Example: 20 principals scheduling demo calls.

Conversion Rate
% of people moving from one stage to the next.

Example: 200 engaged → 20 demos = 10% conversion from MOFU to BOFU.

Quick Cheat Sheet for the Augustine Project
TermIn One LineICPThe type of customer you wantLeadA specific person matching the ICPProductWhat you sellOfferA specific pitch of the product to a specific ICPCampaignA planned outreach pushOutreachThe actual emailing/messagingN8NThe robot doing the workSupabaseThe filing cabinet storing all dataSlackThe walkie-talkie alerting the teamEngagedLead responded with interestMQLLead is warm enough for salesDisqualifiedLead said no
How They All Connect (Mental Model)

You define an ICP (type of customer) → real people who match become Leads → you create a Product → you wrap it into an Offer for that ICP → you launch a Campaign with that offer → N8N runs outreach → leads reply and move through stages (Cold → Engaged → MQL → Closed-Won) → Slack alerts you at key moments.

Want me to go deeper on any specific term? Or should I create a glossary diagram that visualizes how all these terms connect to each other? That could be a handy reference for your client too.You said: How They All Connect (Mental Model)How They All Connect (Mental Model)
You define an ICP (type of customer) → real people who match become Leads → you create a Product → you wrap it into an Offer for that ICP → you launch a Campaign with that offer → N8N runs outreach → leads reply and move through stages (Cold → Engaged → MQL → Closed-Won) → Slack alerts you at key momentscreate a complete flo diagram or visualization digrame for me to help me to understand that whole flow prepare a best digrame2:00 PMI'll create a comprehensive flow diagram that visualizes the entire system from end to end.
::view-transition-group(_),
::view-transition-old(_),
::view-transition-new(\*) {
animation-duration: 0.25s;
animation-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
}
VvisualizeVvisualize show_widgetWant to be notified when Claude responds?Notify
