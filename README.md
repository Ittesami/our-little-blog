# Our Little Blog 💌

A cozy, private blogging site built with Next.js, MongoDB, and Cloudinary. You post memories and daily notes from `/admin` (password protected); anyone with the link can read and leave comments.

## Features

- Posts are tied to a date you choose, with a title, story, and an optional photo
- A "message for the day" you can set per date, shown at the top of the home page
- Posts feed with a grid (tile) view and a list view, like Instagram
- Comments open to anyone — no account needed, just a name
- Only `/admin` can create posts or messages, gated by a password

## 1. Install dependencies

```bash
npm install
```

## 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in real values (`.env.local` currently has placeholders):

```bash
cp .env.example .env.local
```

| Variable | What it's for | Where to get it |
| --- | --- | --- |
| `MONGODB_URI` | Database connection string | Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas), then "Connect" → "Drivers" for the URI |
| `CLOUDINARY_CLOUD_NAME` | Image hosting | [Cloudinary dashboard](https://console.cloudinary.com/) home page |
| `CLOUDINARY_API_KEY` | Image hosting | Same Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Image hosting | Same Cloudinary dashboard |
| `ADMIN_PASSWORD` | The password you'll type at `/admin` to log in | Pick your own |
| `ADMIN_SESSION_SECRET` | Signs the admin login cookie so it can't be forged | Generate with the command below |

Generate a random secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. Run it

```bash
npm run dev
```

Visit `http://localhost:3000` for the blog, and `http://localhost:3000/admin` to log in and post.

## Notes

- Everyone can read posts and leave comments; only someone with `ADMIN_PASSWORD` can create posts or set the daily message.
- Deleting a post also removes its photo from Cloudinary and its comments.
- To deploy (e.g. on Vercel), set the same environment variables in your hosting provider's dashboard.
