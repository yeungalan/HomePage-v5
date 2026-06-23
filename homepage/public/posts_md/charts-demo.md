### AUTOMATE FIELD
Topic=Charts in Posts: Line, Pie & Map
ID=charts-demo
CREATED_DATE=2026-06-23T00:00:00Z
EDITED_DATE=2026-06-23T00:00:00Z
TAG=Meta, Charts, Demo
CATEGORY=Meta
CATEGORY_CAPTION=Embedding data visualisations directly inside a post
CATEGORY_AVATAR=https://via.placeholder.com/150/0088cc/FFFFFF?text=Charts
### AUTOMATE FIELD END

# Charts in Posts

Posts can now embed interactive charts. Write a fenced code block tagged with
`chart` and put a JSON definition inside it. The markdown renderer reads the
JSON and draws the graph. Three chart types are supported: **line**, **pie**,
and **map**.

## Line chart

Great for showing a trend over time. Provide shared `labels` for the x-axis and
one or more `series`, each with its own `values`.

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

You can also describe each series as `{ "x": ..., "y": ... }` points instead of
using a shared `labels` array:

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

## Pie chart

Use `slices`, each with a `label` and `value`. Add `"donut": true` for a donut
variant with the total in the middle.

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

## Map chart

Draw routes from Point A to Point B on a 3D globe. List your `points`
(with `lat`/`lng`) and the `routes` between them. A route's `from`/`to` can
reference a point by `name` or carry inline coordinates.

```chart
{
  "type": "map",
  "title": "From Hong Kong to a New Life in Tokyo",
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

That's it — drop a `chart` code block anywhere in a post and it renders inline.
