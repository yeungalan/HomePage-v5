### AUTOMATE FIELD
Topic=Testing Post 2
ID=react-getting-started
CREATED_DATE=2025-01-20T10:00:00Z
EDITED_DATE=2025-01-22T15:30:00Z
TAG=React, JavaScript, Frontend, Tutorial
CATEGORY=Web Development
CATEGORY_CAPTION=Building modern web applications with React
CATEGORY_AVATAR=https://via.placeholder.com/150/0088cc/FFFFFF?text=React
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

## Some photos
<iframe
  src="https://photos.alanyeung.co/share/iframe?id=DSC02207-1"
  height="500"
  className="w-full"
  allowTransparency
  sandbox="allow-scripts allow-same-origin allow-popups"
/>
