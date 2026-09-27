# Delta Export

Static website for Delta Export: spice export, metal scrap and Delta Realty (property listings). No build step. Open any `.html` file or host the folder on GitHub Pages (see `CNAME`).

## Structure

```
*.html                    Pages (home, about, products, scrap, copper/aluminium/brass, contact, realty-*)
assets/css/main.css       Single design system used by every page
assets/js/main.js         Navigation, reveal-on-scroll, spice search
assets/js/realty/         Realty scripts: app.js (listings UI), data.js (demo listings),
                          supabase.js / auth.js / lead.js (live backend)
assets/images/brand/      Logo
assets/images/spices/     Product photos
assets/images/realty/     Property photos
supabase/                 Database schema and migrations for the live realty backend
```

## Realty

`realty.html`, `realty-listings.html`, `realty-property.html` and `realty-post.html` run on the demo data in `assets/js/realty/data.js`. Submissions from the post form are sent to the Delta WhatsApp number.

The `*-live`, `realty-dashboard`, `realty-admin` and `realty-photo-upload` pages need Supabase. Add the project URL and anon key in `assets/js/realty/supabase.js` and run the SQL in `supabase/`.
