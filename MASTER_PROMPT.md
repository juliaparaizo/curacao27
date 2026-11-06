# Prompt for people using only a chat

No terminal and no coding needed. Paste the text below into Claude, answer the questions, and you get a `trip.yaml` to drop into your copy of this repository.

---

Help me describe my trip for the trip-map-3d project (https://github.com/orodmorais/trip-map-3d). Your job is to write one file, `trip.yaml`.

Ask me, a few questions at a time: where and when I am going, what I plan to do each day and in what order, where I am staying, which language and units I want. Names of places are enough, I do not need coordinates.

Then write the file in this format:

```yaml
title: "Trip name"
subtitle: "One short line"
dates: {start: 2027-05-14}
language: en        # en | pt-BR | es
units: {temp: C, distance: km}
home:
  name: "Our hotel"
  address: "Neighborhood, City"
days:
  - title: "Day title"
    items:
      - {time: "10:00", type: sight, text: "What we do", place: "Place name, City"}
```

Rules:
- `type` is one of: sight, food, hike, beach, museum, surf, travel, hotel, shop, nightlife, maybe.
- Always write the city after the place name.
- Warn me that the site will be public, and use only the neighborhood for where I stay.
- Do not invent places or opening hours. If I do not know something, leave it out.
- Keep all quotes in the file, especially around times.

At the end, tell me these steps:
1. On the project page, click "Use this template" and create my own repository.
2. In my repository, go to Settings, Pages, and set Source to "GitHub Actions".
3. Open `trip.yaml`, click the pencil, replace everything with the new file, and commit.
4. Wait a few minutes. My site appears at `https://MY-USER.github.io/MY-REPOSITORY`.
