# Job Discovery - Feature Guide

## Quick Reference: All 10 New Features

### 🔍 1. Search Bar
**Location**: Top of page, below header
- Search across titles, companies, locations, and descriptions
- Clear button (X) appears when typing
- Real-time filtering as you type

### 🎛️ 2. Advanced Filters
**Location**: Click "Advanced Filters" button
- **Salary Range**: Set min/max salary in thousands
- **Employment Type**: Filter by Full-time, Part-time, Contract, Internship
- **Company**: Search for specific companies
- **Clear All**: Reset all filters at once

### 📊 3. Sorting
**Location**: Top right, next to "Advanced Filters"
- Sort by: Date Posted, Fit Score, Salary, Company
- Toggle ascending/descending with arrow button
- Default: Most recent first

### 📄 4. Pagination
**Location**: Bottom of job list
- 10 jobs per page
- Smart page numbers (shows 5 at a time)
- Previous/Next buttons
- Shows current range (e.g., "1-10 of 45 jobs")

### 📖 5. Expandable Details
**Location**: "More Details" button on each job card
- Click to expand full job description
- Click "Less Details" to collapse
- Smooth animation

### 🎨 6. Skeleton Loaders
**When**: During initial load or refresh
- 5 animated skeleton cards
- Pulse effect
- Better than spinner

### ☑️ 7. Bulk Actions
**How to use**:
1. Click checkboxes on job cards
2. Or click "Select All on Page"
3. Bulk actions bar appears
4. Choose "Save Selected" or "Dismiss Selected"

**Visual**: Selected jobs have blue ring and light background

### ⚖️ 8. Job Comparison
**How to use**:
1. Click comparison icon (⚖️) on up to 3 jobs
2. Comparison bar appears at top
3. Click "Show Comparison" for side-by-side view
4. Compare fit scores, salaries, locations, etc.

**Limit**: Maximum 3 jobs at once

### ✅ 9. Application Tracking
**Location**: Badge on job cards
- Green "Applied" badge appears on jobs you've applied to
- Automatically tracked when using Quick Apply
- Persists across sessions

### 📈 10. Fit Score Breakdown
**How to use**:
1. Click on any fit score badge (e.g., "85% Match")
2. Modal shows detailed breakdown:
   - Keywords match (40 points)
   - Location match (20 points)
   - Recency bonus (10 points)
3. Progress bars show each category
4. Descriptions explain the scoring

---

## Common Workflows

### Finding the Perfect Job
1. Use **Search** to find jobs by keyword
2. Apply **Advanced Filters** for salary and type
3. **Sort** by Fit Score to see best matches
4. Click **Fit Score** badges to understand why jobs match

### Comparing Opportunities
1. Add 2-3 jobs to **Comparison**
2. Click "Show Comparison"
3. Review side-by-side metrics
4. Click "View Job" on your favorite

### Batch Processing Jobs
1. **Select All on Page** or individual jobs
2. **Save Selected** for jobs to review later
3. **Dismiss Selected** for jobs not interested in

### Efficient Browsing
1. Use **Pagination** to browse through pages
2. **Expand Details** only for interesting jobs
3. Track which jobs show **Applied** badge
4. Use filters to narrow down results

---

## Tips & Tricks

💡 **Tip**: Click the fit score badge to see exactly why a job matches your profile

💡 **Tip**: Use salary filters to only see jobs in your range

💡 **Tip**: Compare jobs before applying to make informed decisions

💡 **Tip**: Select multiple jobs and save them all at once for later review

💡 **Tip**: The "Applied" badge helps you avoid duplicate applications

💡 **Tip**: Sort by Fit Score to see your best matches first

💡 **Tip**: Use the search bar for quick keyword searches

💡 **Tip**: Advanced filters are collapsible - hide them when not needed

---

## Keyboard Shortcuts (Future Enhancement)
- `Ctrl/Cmd + K`: Focus search bar
- `Ctrl/Cmd + F`: Open advanced filters
- `←` / `→`: Navigate pages
- `Escape`: Close modals

---

## Performance Notes

- **Pagination**: Only 10 jobs load at once for faster rendering
- **Client-side filtering**: Instant results without server calls
- **Skeleton loaders**: Better perceived performance
- **Optimized rendering**: Smooth animations without lag

---

## Browser Support

✅ Chrome, Edge, Firefox, Safari (latest versions)
✅ Mobile responsive
✅ Tablet optimized
✅ Desktop enhanced

---

Need help? All features have tooltips and visual feedback to guide you!
