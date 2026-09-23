### AUTOMATE FIELD
Topic=Testing Post 2
ID=react-getting-started
CREATED_DATE=2025-01-20T10:00:00Z
EDITED_DATE=2025-01-22T15:30:00Z
TAG=React, JavaScript, Frontend, Tutorial
CATEGORY=Web Development
CATEGORY_CAPTION=Building modern web applications with React
AI_SUMMARY=A test post that demonstrates the rich content the blog's Markdown renderer supports. The first half covers interactive charts written as fenced chart blocks with a JSON body: line charts built from shared labels or x/y points with optional smoothing and area fill, pie and donut charts built from labelled slices, and a draggable 3D globe that draws routes between named points, here from Hong Kong via Taipei to Tokyo. The second half covers LaTeX math rendered with KaTeX at build time: inline formulas in single dollar signs, centred display blocks, and fenced math blocks for aligned equations, piecewise functions and matrices. It also shows math inside lists, table cells and headings, how to escape literal dollar signs, and how an invalid formula appears in red without breaking the rest of the page. It ends with an embedded photo.
### AUTOMATE FIELD END

# Testing Post 2
This is the starter

## Charts

Posts support interactive charts. Write a fenced code block tagged `chart`
with a JSON body and the renderer draws the graph. Hover a chart to inspect
values; click a line-chart legend item to toggle that series.

### Line chart

Provide shared `labels` for the x-axis and one or more `series`, each with its
own `values`. Optional `smooth` and `area` flags.

```chart
{
  "type": "line",
  "title": "Japanese Test Scores by Month",
  "xLabel": "Month",
  "yLabel": "Score",
  "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  "series": [
    { "name": "Reading", "values": [55, 62, 70, 74, 81, 88] },
    { "name": "Listening", "values": [40, 58, 66, 79, 90, 100] },
    { "name": "Speaking", "values": [30, 38, 45, 52, 60, 65] }
  ],
  "smooth": true,
  "area": true
}
```

A series can instead be described as `{ "x": ..., "y": ... }` points:

```chart
{
  "type": "line",
  "title": "Daily Study Minutes",
  "yLabel": "Minutes",
  "series": [
    {
      "name": "Minutes",
      "color": "#10b981",
      "data": [
        { "x": "Mon", "y": 45 },
        { "x": "Tue", "y": 60 },
        { "x": "Wed", "y": 30 },
        { "x": "Thu", "y": 90 },
        { "x": "Fri", "y": 75 }
      ]
    }
  ]
}
```

### Pie chart

Use `slices`, each with a `label` and `value`. Add `"donut": true` for a donut
variant. Hover a slice (or its legend entry) to highlight it.

```chart
{
  "type": "pie",
  "title": "Final Exam Score Breakdown",
  "donut": true,
  "slices": [
    { "label": "Reading", "value": 66 },
    { "label": "Listening", "value": 15 },
    { "label": "Speaking", "value": 6.5 },
    { "label": "Kanji", "value": 12.5 }
  ]
}
```

### Map chart

Draw routes from Point A to Point B on a draggable 3D globe. List the `points`
(with `lat`/`lng`) and the `routes` between them; a route's `from`/`to` can
reference a point by `name` or carry inline coordinates. Set
`"autoRotate": false` to keep the globe still, and use the on-map button to
toggle rotation. The route line itself stays fixed.

```chart
{
  "type": "map",
  "title": "From Hong Kong to a New Life in Tokyo",
  "autoRotate": false,
  "points": [
    { "name": "Hong Kong", "lat": 22.3193, "lng": 114.1694 },
    { "name": "Taipei", "lat": 25.0330, "lng": 121.5654 },
    { "name": "Tokyo", "lat": 35.6762, "lng": 139.6503 }
  ],
  "routes": [
    { "from": "Hong Kong", "to": "Taipei", "label": "Diving trip" },
    { "from": "Taipei", "to": "Tokyo", "label": "Move to Japan" }
  ]
}
```

## Math (LaTeX)

Posts render LaTeX with [KaTeX](https://katex.org/). There are three ways to
write it: `$…$` for inline math, `$$…$$` for a centred display block, and a
fenced ` ```math ` block when the source deserves its own lines. Everything is
typeset at build time, so no client-side script has to run for the formulas to
show up.

### Inline math

Wrap the expression in single dollar signs: Euler's identity, $e^{i\pi} + 1 = 0$,
flows with the surrounding sentence, and so do symbols such as $\alpha$,
$\Sigma$, $\sqrt{2}$, fractions like $\tfrac{3}{4}$ and comparisons such as
$0 < \varepsilon \ll 1$.

### Display math

Double dollar signs on their own lines centre the formula and give it room to
breathe:

$$
\int_{-\infty}^{\infty} e^{-x^{2}}\,dx = \sqrt{\pi}
$$

$$
\hat{f}(\xi) = \int_{-\infty}^{\infty} f(x)\, e^{-2\pi i x \xi}\,dx
$$

### Fenced math blocks

A fenced block tagged `math` is equivalent to `$$…$$` and keeps long derivations
readable in the source file:

```math
\begin{aligned}
(a + b)^2 &= a^2 + 2ab + b^2 \\
(a - b)^2 &= a^2 - 2ab + b^2 \\
(a + b)(a - b) &= a^2 - b^2
\end{aligned}
```

Environments such as `aligned`, `cases`, `matrix` and `array` all work:

```math
f(n) =
\begin{cases}
  n / 2 & \text{if } n \equiv 0 \pmod{2} \\
  3n + 1 & \text{if } n \equiv 1 \pmod{2}
\end{cases}
```

```math
A =
\begin{bmatrix}
  1 & 0 & 0 \\
  0 & \cos\theta & -\sin\theta \\
  0 & \sin\theta & \cos\theta
\end{bmatrix}
```

### Math inside other blocks

Formulas are allowed anywhere inline text is, including list items:

1. Arithmetic series: $\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$
2. Geometric series: $\sum_{i=0}^{\infty} r^{i} = \frac{1}{1-r}$ for $|r| < 1$
3. Binomial coefficient: $\binom{n}{k} = \frac{n!}{k!\,(n-k)!}$

...and table cells:

| Notation | Meaning | Example |
| --- | --- | --- |
| $O(n)$ | Linear time | A single pass over $n$ items |
| $O(n \log n)$ | Linearithmic time | Comparison sorting |
| $\Theta(1)$ | Constant time | A hash lookup |

### Headings can hold math, like $a^2 + b^2 = c^2$

The table of contents on the right lists this section by the formula as it is
drawn, and the heading's anchor link is still derived from the plain source.

### Escaping dollar signs

A backslash keeps a dollar sign literal, so \$5 and \$10 stay plain text rather
than opening a formula. Inline code is never parsed as math either, so
`$not math$` renders verbatim. A formula KaTeX cannot parse is shown in red
where it sits instead of breaking the rest of the page.

## Some photos
<iframe
  src="https://photos.alanyeung.co/share/iframe?id=DSC02207-1"
  height="500"
  className="w-full"
  allowTransparency
  sandbox="allow-scripts allow-same-origin allow-popups"
/>
