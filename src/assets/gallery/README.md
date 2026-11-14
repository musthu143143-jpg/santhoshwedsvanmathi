# Gallery photos — Option 2 (public links)

The gallery can load photos from public links. Two ways to use it:

## Way A — paste links in `links.ts` (shows for all visitors)

1. Upload your 10 photos to **Google Drive** (or Imgur / any host).
2. For each photo: **Share → "Anyone with the link can view" → Copy link**.
3. Open `links.ts` in this folder and paste the links, one per line, in order.
4. Rebuild / restart. Done — the photos show for every guest.

Google Drive links like
`https://drive.google.com/file/d/FILE_ID/view?usp=sharing`
are converted automatically — no need to edit them.

## Way B — add photos on the page itself

Open the website's **Gallery** section and use:

- **Upload from device** — pick photos from your phone/computer. They appear
  instantly and are remembered on that device.
- **Paste a link** — paste a Google Drive / Imgur link and tap Add.

## Way C — local files (also supported)

Save files here as `gallery-1.jpg`, `gallery-2.jpg`, … `gallery-10.jpg`.
The number sets the order. `.jpg`, `.png`, `.webp` all work.

Priority: links in `links.ts` → local files → numbered placeholders.

## Captions and tile shapes

Edit `META` in `index.ts`:

- `alt` — caption shown on hover and read by screen readers.
- `ratio` — tile shape: `"3 / 2"` landscape, `"2 / 3"` portrait,
  `"9 / 16"` tall, `"16 / 9"` wide.

## Suggested order for your photos

| # | Photo | Shape |
|---|-------|-------|
| 1 | Couple under the floral arch (bride looking up) | landscape |
| 2 | Couple standing, green saree | portrait |
| 3 | Blessing / garland ceremony with family | landscape |
| 4 | Couple seated on the sofa | landscape |
| 5 | Couple inside the floral ring | landscape |
| 6 | Couple outdoors under the palm shade | portrait |
| 7 | Groom's illustrated portrait | portrait |
| 8 | Illustrated couple (red / green) | landscape |
| 9 | Painted-style couple portrait | landscape |
| 10 | Illustrated couple at the temple at night | portrait |

> Note: local files are packed into the single website file, so keep them
> around 1200–1600 px and under ~400 KB each. Public links don't add to the
> file size at all — that's the advantage of Option 2.
