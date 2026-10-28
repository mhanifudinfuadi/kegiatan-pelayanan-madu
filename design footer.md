# Design Specification --- Footer "And Then, There Was You."

**Project:** Kawaguchiko\
**Area:** Global website footer\
**Change type:** Full footer replacement\
**Design direction:** Elegant Japanese romance, quiet obsession,
intimate literary atmosphere\
**Primary language:** English for the emotional copy; Indonesian can
remain for functional labels if needed

------------------------------------------------------------------------

## 1. Design Intent

Replace the existing footer completely. Do not preserve the current
"Kawaguchiko" title, generic service description, navigation/contact
columns, email address, phone number, physical address, or the existing
copyright sentence.

The new footer should feel like the final page of a private love letter:
composed, masculine, restrained, romantic, and emotionally intense. The
mood should suggest a man whose usual certainty is undone by one
person---not a loud, sugary, or cliché romance.

**Core concept:** *The World Goes Quiet*\
**Signature line:** *And Then, There Was You.*

The footer must still be usable as a real website footer. Keep
navigation accessible, links functional, text readable, and the layout
responsive.

------------------------------------------------------------------------

## 2. Visual Direction

### Color palette

  -----------------------------------------------------------------------------
  Token                   Hex                           Usage
  ----------------------- ----------------------------- -----------------------
  Midnight Ink            `#090B20`                     Main footer background

  Deep Plum               `#151326`                     Subtle gradient / depth

  Dusty Sakura            `#E9B6C9`                     Japanese subtitle, tiny
                                                        accents, hover states

  Antique Ivory           `#F3EBDD`                     Main heading and
                                                        primary copy

  Silver Dusk             `#8F8BA8`                     Secondary copy, labels,
                                                        copyright

  Hairline                `rgba(243, 235, 221, 0.14)`   Dividers and delicate
                                                        borders
  -----------------------------------------------------------------------------

Use the existing site background if consistency requires it, but move
the footer toward midnight navy with restrained plum depth. Avoid bright
pink blocks, saturated neon, heavy gradients, or large decorative
hearts.

### Typography

-   **Display heading:** high-contrast editorial serif; use the site's
    existing serif if available. Suitable fallbacks: `Georgia`,
    `Times New Roman`, serif.
-   **Navigation and utility labels:** clean sans-serif; use the site's
    existing sans-serif.
-   **Eyebrow / Japanese line:** small uppercase or restrained Japanese
    text with generous letter spacing.
-   Use comfortable line-height and avoid overly thin text at small
    sizes.

### Decorative atmosphere

-   Retain the existing starfield and sakura-petal motif only if it is
    already part of the site's visual language.
-   Reduce particle density inside the footer so the copy remains
    legible.
-   Add a very subtle radial glow behind the main heading, like distant
    moonlight.
-   Keep petals slow, sparse, and low-opacity. Respect
    `prefers-reduced-motion`.
-   Decorations must be `pointer-events: none` and must never cover
    links or text.
-   No large illustrations, heart icons, or obvious romantic clip art.

------------------------------------------------------------------------

## 3. New Footer Content and Structure

Build the footer as four deliberate zones.

### Zone A --- Opening signature

Small eyebrow:

`私の静かな宇宙 · MY QUIET UNIVERSE`

Main title:

`And Then, There Was You.`

Japanese subtitle:

`そして、君がいた。`

Short lead:

`Of all the things this world has given me, you are the one I was never prepared to feel.`

The title should be the dominant element. Use a generous amount of empty
space around it.

### Zone B --- The letter

Use this paragraph as the emotional centerpiece:

> I used to believe that a man could keep his world in order, that every
> feeling had its place and every longing its end. Then you came along,
> and suddenly, even silence began to speak your name.

Keep the paragraph to a comfortable reading width of approximately
38--58 characters per line on desktop. On mobile, allow natural wrapping
with adequate side padding.

Optional small signature beneath the paragraph:

`— A love beyond reason`

Do not use a fake handwritten signature or imply that this text is a
real personal message from a named person.

### Zone C --- Navigation and closing note

Retain the site's real navigation destinations, but redesign them as a
quiet, compact row or a small vertical list on narrow screens.

Suggested label:

`EXPLORE`

Keep the existing valid links, for example:

-   Beranda
-   Kegiatan
-   Statistik
-   Tentang
-   Galeri
-   Scan

Only render links that actually exist in the project. Do not create
broken placeholder routes.

Replace the current contact block with a short closing note:

`Somewhere between the stars and the silence, a thought of you remains.`

Do not display example email addresses, fake phone numbers, or fictional
physical addresses. If the site genuinely requires contact information,
place only verified contact details in a discreet utility link.

### Zone D --- Final line

Separate the bottom row with a very thin, low-contrast divider.

Left or centered closing line:

`The world remains. I am simply no longer quite the same.`

Copyright:

`© {current year} Kawaguchiko. Made with quiet devotion.`

Use the actual current year dynamically if the project supports it;
otherwise use the project's established year convention. Avoid
hard-coding a year that will become stale.

------------------------------------------------------------------------

## 4. Desktop Layout

At desktop widths, use a spacious, editorial composition:

1.  **Top section:** eyebrow, large title, Japanese subtitle, and lead
    sentence. Align to the left with a maximum content width.
2.  **Middle section:** a thin divider followed by a two-column layout:
    -   Left: the letter paragraph and small signature.
    -   Right: compact navigation and the closing note.
3.  **Bottom section:** another subtle divider, then the final line and
    copyright.

Recommended constraints:

-   Footer content max-width: `1440px` or match the site's global
    container.
-   Horizontal padding: `clamp(24px, 5vw, 80px)`.
-   Vertical padding: `clamp(56px, 8vw, 112px)`.
-   Display heading: `clamp(3rem, 7vw, 6.5rem)`.
-   Main paragraph max-width: `42rem`.
-   Use generous gaps instead of large decorative blocks.
-   Keep all content aligned to a consistent grid.

The heading should not be pushed to the extreme top edge. Keep enough
top padding that the footer feels intentional and luxurious.

------------------------------------------------------------------------

## 5. Mobile Layout

At mobile widths:

-   Stack the title, letter, navigation, and closing note vertically.
-   Use approximately `22–26px` horizontal padding.
-   Set the title to `clamp(2.6rem, 12vw, 4rem)` and allow it to wrap
    naturally.
-   Keep the Japanese subtitle close to the title.
-   Use body copy around `15–17px` with line-height of at least `1.7`.
-   Make navigation links comfortably tappable, with clear spacing.
-   Prevent horizontal overflow from long words, decorative elements, or
    letter spacing.
-   Reduce or disable floating petals on small screens if they compete
    with reading.
-   Ensure all links have visible focus styles and sufficient contrast.

Do not shrink the desktop footer into a tiny version. Recompose it for a
vertical reading flow.

------------------------------------------------------------------------

## 6. Motion and Interaction

Motion should feel like a quiet breath, not a presentation animation.

-   On first view, the eyebrow, title, and lead may fade in with a
    subtle upward movement.
-   Keep transitions around `500–900ms`, using a gentle ease-out.
-   Navigation hover: transition the text toward `Dusty Sakura`;
    optionally add a short underline or a tiny arrow.
-   Avoid continuous movement on the main title.
-   Respect `prefers-reduced-motion: reduce` by removing entrance
    animations and disabling nonessential floating petals.
-   Keep all interactive elements keyboard accessible.

Do not add autoplay audio, music, cursor trails, or scroll-jacking.

------------------------------------------------------------------------

## 7. Accessibility and Technical Requirements

-   Use a semantic `<footer>` landmark.
-   Use a heading hierarchy that does not disrupt the rest of the page;
    the main footer title can be an `<h2>` or another level appropriate
    to the document.
-   Use real anchor elements for navigation.
-   Provide a visible keyboard focus indicator.
-   Maintain readable contrast for all copy and links.
-   Mark purely decorative stars and petals as hidden from assistive
    technology.
-   Do not place essential text inside images.
-   Avoid layout shift when animations or decorative particles
    initialize.
-   Reuse the project's existing design tokens, fonts, navigation data,
    and animation utilities where possible.
-   Do not introduce a new dependency solely for this footer.
-   Keep the footer implementation isolated so it does not
    unintentionally alter the page header, hero, or other sections.

------------------------------------------------------------------------

## 8. Remove from the Existing Footer

Remove or replace all of the following existing content and
presentation:

-   The large `Kawaguchiko` footer title.
-   The line `Pelayanan Unit Kerja yang tenang dan etereal.`
-   The pill-shaped `BERI KOMENTAR` button, unless it is a real required
    action. If it is required, restyle it as a subtle text link such as
    `Leave a thought ↗`.
-   The current navigation/contact two-column arrangement if it
    conflicts with the new editorial structure.
-   Placeholder contact details such as `info@kawaguchiko.example`,
    `+62 812 0000 0000`, and `Jl. Danau Kawaguchiko, Yamanashi`.
-   The copyright phrase `Dibuat dengan tenang.` if it appears in the
    old footer.
-   Any excessive petal overlays that obscure the new copy.

Do not delete working navigation routes or real functionality. Replace
their presentation, not their underlying destinations.

------------------------------------------------------------------------

## 9. Suggested Content Snapshot

Use this as the canonical copy for the first implementation:

**Eyebrow**\
`私の静かな宇宙 · MY QUIET UNIVERSE`

**Heading**\
`And Then, There Was You.`

**Japanese subtitle**\
`そして、君がいた。`

**Lead**\
`Of all the things this world has given me, you are the one I was never prepared to feel.`

**Letter**\
`I used to believe that a man could keep his world in order, that every feeling had its place and every longing its end. Then you came along, and suddenly, even silence began to speak your name.`

**Navigation label**\
`EXPLORE`

**Closing note**\
`Somewhere between the stars and the silence, a thought of you remains.`

**Final line**\
`The world remains. I am simply no longer quite the same.`

**Copyright**\
`© {current year} Kawaguchiko. Made with quiet devotion.`

------------------------------------------------------------------------

## 10. Acceptance Checklist

-   [ ] The old footer has been replaced in full, not merely recolored.
-   [ ] The new footer reads like an elegant, intimate closing page.
-   [ ] Midnight navy, dusty sakura, ivory, and muted silver form a
    coherent palette.
-   [ ] The title is the strongest typographic element.
-   [ ] The letter copy is readable and not overly wide.
-   [ ] Existing navigation links still work.
-   [ ] Fake contact information is removed.
-   [ ] Desktop and mobile layouts are both deliberately composed.
-   [ ] Petals and starfield are subtle and never interfere with
    content.
-   [ ] Reduced-motion preferences are respected.
-   [ ] Keyboard focus and text contrast remain accessible.
-   [ ] No unrelated page sections or routes have been changed.

**Implementation note:** Treat this document as the footer design
contract. Inspect the current footer component and existing site tokens
before coding, then implement the design using the project's current
framework and conventions.
