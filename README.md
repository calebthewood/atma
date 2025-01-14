# ATMA Reserve

## Features

- Next.js 15 App Directory
- React 19
- Radix UI Primitives via ShadCN
- Tailwind CSS
- Icons from [Lucide](https://lucide.dev)
- Dark mode with `next-themes`
- Tailwind CSS class sorting, merging and linting.

## Getting Started

```bash
# I find bun actually works a bit better for installing dependencies for React19
# bun install
npm install
npm run dev
```

## Building

```bash
npm run format # runs prettier with plugins
npm run lint
npm run build
```

## Production Environment

Runs on a Digital Ocean linux server under the atma user account. Get login
permissions from Scarlett, use root access to create your account and ssh keys.
ssh into server, switch to atma account to build app. Then use systemctl to restart
atma service. Currenly it runs at "the-circle" domain. When ready to go live,
copy existing nginx config for atmareserve.com and copy service unit file for
systemd.

Domains are from AWS (Route 53 or something like that). Everything should be
configured for both the current staging site and atmareserve.com. Note that a
static page is currently served at atmareserve.com. Sendgrid email dns records
should also be setup already. Current site is tested for this, but not
atmareserve.com

### Deploying updates
Probably a good idea to setup a github workflow for this, but don't overcomplicate
it with Docker.

```Bash
ssh atma # or user:ip-address if you don't have ssh config alias
sudo su - atma
cd atma
git pull
npm run build
exit
sudo systemctl restart atma-staging
```

## Database
Using SQLite for database. Works great, don't move to Postgres until you
need to. KISS


### Notes on Database structure.
- Hosts (partner companies) > Properties > Programs/Retreats > Amenities/etc
That's the heirarchy. Some tables like Rooms and Notifications are underutilized
right now as I don't think they're most needed.

- Bookings table is mostly a way to maintain some internal checkout records
outside of (or in addition to) Stripe.

- Retreats and Programs are functionally the same thing right now. I kept them
as separate tables because I expect them to evolve once there are hosts making
feature requests. If/when they diverge, shared UI elements will need to be split
as well

- There are remnants from the V1 buildout like the 3 booking structures:
Fixed, Flexible, Open, that are no longer really used. I also expect the pricing
to evolve once hosts join the platform, and have more specific pricing requests.
I think the table structure has quite a bit of flexibility, but there's no UI or
actions outside the simple base price option to make use of it in place.

- It might be more accurate to call the Retreat table "RetreatTemplate", and the
RetreatInstance table the "Retreat" table. I'm not going to rename them, but
that's probably how you should think about the relationship between the two
(for both retreats and programs).

- SQLite doesn't have enums, so there's a few places where I'm just doing lazy
enums. I've been meaning to move these to a config file somewhere or a TS type
so it's at least enforced.

- Notifications table is setup and should be recording sent emails, but otherwise
not integrated anywhere else. I'm sure there's some additional quality of life
features to be added here.


## Notes on NextJS 15
Server actions. If you don't know they are functions that get compiled into api
endpoints. You can just treat them like functions though. Idk what the best
convention is so I've sort of written most of them as if they were the response
from an api endpoint, but honestly, I think a lot of people just write them like
you would a normal function. Many, but not all follow the ActionResponse type.

Classes cant be serialized, and so cant be passed as props to react components,
and so cant be server actions. You can still use classes for code exclusive to
the server or exclusive to the client, but cannot pass classes to be called
in the client and ran on the server as server actions are.

Also, server actions all show up in the logs as POST requests.


## Notes on Stripe
It's set up very simply. We haven't defined products inside of Stripe, not sure
if that's needed, but would probably make managing the Stripe side of this a bit
simpler. Idk tho, that's something they can (mostly) do with no code so if they
want to do it they can.

## Notes on Forms re Zod & ReactHookForm
IDK if I really like this setup, but it's fine. It provides some nice features,
but also just feels like a lot of extra code for every form.

## Notes on React19
None. It's in here, but I haven't really started making use of the compiler yet.

## Big TODO's
[] Checkout flow needs email confirmations still. See sendgrid acct.
[] Feel like they haven't really thought about the money part of this at all yet.
I've setup stripe, but no discussion around taxes/fees or anything like that so idk
what the plan is yet. Hopefully they're discussing it with a host/partner.

