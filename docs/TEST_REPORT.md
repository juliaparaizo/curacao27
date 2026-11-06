# Test report

Checked on 2026-11-05 with `tools/check_trip.py`, in Chrome on a MacBook Air, at 1440x900 and 390x844. Every day of every trip was opened on both screen sizes.

| Trip | Clean build | dist/ | Pins fit | Route clear of card | No empty background | Search, filters, weather | Today, blue dot | Offline | JS errors | fps desktop / phone size |
|---|---:|---:|---|---|---|---|---|---|---:|---|
| O'ahu | 180 s | 3.8 MB | yes | yes | yes | yes | yes | yes | 0 | 30 / 58 |
| Rio de Janeiro, 5 days | 84 s | 4.8 MB | yes | yes | yes | yes | yes | yes | 0 | 60 / 60 |
| Utah parks, 7 days | 53 s | 4.8 MB | yes | yes | yes | yes | yes | yes | 0 | 60 / 61 |
| Toledo, 1 day | 34 s | 3.6 MB | yes | yes | yes | yes | yes | yes | 0 | 60 / 60 |
| Lisbon + Rome + Alps, 12 days | 72 s | 13.8 MB | yes | yes | yes | yes | yes | yes | 0 | 60 / 60 |

## Limits of this report

- **Frame rate on real phones was not measured.** The phone column is this Mac's GPU at a phone-sized viewport. The site drops to a lighter picture by itself below 24 fps.
- **The blue dot** was tested with a simulated position.
- **Weather** was checked against the live API with a trip starting the next day. Dates beyond the 16-day window show sunrise and sunset only.
- **Build times** are on this Mac with an empty data cache, including all downloads, from the run before the last fixes. With a full cache they take 6 to 24 s. They were not measured on GitHub Actions.
- **The checker was validated** by moving a card over a route and zooming pins off screen on purpose: it caught both.
- Edge cases also tested: a day with no places, stories with places, a place on several days, and a trip across the antimeridian (Fiji).
