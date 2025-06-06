

const reportUrls = {
  customers: {
    pie: 'https://app.powerbi.com/view?r=eyJrIjoiMjk3YzM0ZTYtZGM5Ny00MDE5LWI3NTEtZjY2MmRkN2I4MjA5IiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9&cb=${Date.now()}&filterPaneEnabled=true',
    line: 'https://app.powerbi.com/view?r=eyJrIjoiYWNlNTVlNzAtMDI0OS00ODYyLTk5MzItOWNiZjc2ZDZiMDE3IiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9&cb=${Date.now()}&filterPaneEnabled=true',
    bar: 'https://app.powerbi.com/view?r=eyJrIjoiOWY3MjdkNjctMTRhYS00ZThiLTk0OWEtY2NkODRjNmYzMGJkIiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9&cb=${Date.now()}&filterPaneEnabled=true',
    area:'https://app.powerbi.com/view?r=eyJrIjoiYjcxZWVlMDktZDMzNC00ODEwLWI3MWMtOTdkNGEyODE2ZTNiIiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9&cb=${Date.now()}&filterPaneEnabled=true',
    funnel:'https://app.powerbi.com/view?r=eyJrIjoiZGYwODNhYjYtNDVlYS00YWU3LTljOTMtNTZmMzA2NjYyMTg3IiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9',
    donut:'https://app.powerbi.com/view?r=eyJrIjoiOGJjNDAyZmYtYmY1ZC00MjZiLWE5OTAtYWE1ZTlhMDAyMDFmIiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9',
    water:'https://app.powerbi.com/view?r=eyJrIjoiNTRiZGQ0MWMtMzJjZS00YmFkLTg0MDMtYzBhM2RkNDhkOWY5IiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9'
  },
  orders: {
    pie: 'https://app.powerbi.com/view?r=eyJrIjoiNDNlYzUxYzAtMDhiNS00YmFjLWFiMmYtMTY5MTllMDE4MTA1IiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9&cb=${Date.now()}&filterPaneEnabled=true',
    line: 'https://app.powerbi.com/view?r=eyJrIjoiNDdmYjA2MDMtMGMzMS00NGI4LTgwZGUtYjIzZDcyN2E4OGU1IiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9&cb=${Date.now()}&filterPaneEnabled=true',
    bar: 'https://app.powerbi.com/view?r=eyJrIjoiODMwM2JlOWEtZmMxNS00NGM0LWE3NzgtZTMzMjIwNTBiYmNjIiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9&cb=${Date.now()}&filterPaneEnabled=true',
    area:'https://app.powerbi.com/view?r=eyJrIjoiYmJjYmMzZDUtNDEwNS00OWVjLTk3MWEtMmRiYzI5YzMwN2FlIiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9',
    funnel:'https://app.powerbi.com/view?r=eyJrIjoiNDgwNzU5YzAtZjFkNS00YmFlLWIwZjctODQwY2EzNDc4MjcyIiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9',
    donut:'https://app.powerbi.com/view?r=eyJrIjoiNDM2NzdjZjYtOTRkNS00ZTdkLWI2NmMtYzY3MDVlM2I0NzcxIiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9' ,
    water:'https://app.powerbi.com/view?r=eyJrIjoiMWE0NmQ3ZWMtYjU3Ny00ZGJiLTk3N2QtZWVkZGI5MDgzNDE0IiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9'
  },
  invoices: {
    pie: 'https://app.powerbi.com/view?r=eyJrIjoiYjc5MGRmZjUtMDMzOS00YWE4LWIyYjAtYWViN2QzODQwY2Q4IiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9&cb=${Date.now()}&filterPaneEnabled=true',
    line: 'https://app.powerbi.com/view?r=eyJrIjoiZTU2OWQ2Y2ItMjJkNS00ZmVlLTgyMWMtZTgwMTA4NjZjNWE0IiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9&cb=${Date.now()}&filterPaneEnabled=true',
    bar: 'https://app.powerbi.com/view?r=eyJrIjoiYTdhNDMwYzYtMzRiMy00YTc3LWI3YzEtODQyZmU0ZjY4N2VkIiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9&cb=${Date.now()}&filterPaneEnabled=true',
    area:'https://app.powerbi.com/view?r=eyJrIjoiODk2NjRlMzgtNGYyYi00YTVjLTk4ZTAtODM5N2FlMWE1YjJkIiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9',
    funnel:'https://app.powerbi.com/view?r=eyJrIjoiNzNlNWQwYWEtN2U4MS00ZjcxLWFlMjYtYWE2NTA4YjAxYzg2IiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9',
    donut:'https://app.powerbi.com/view?r=eyJrIjoiYzNiZDU0MWUtMTI3MC00MGRhLTk5ZWUtMzczNTkwNTIyZGQ4IiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9',
    water:'https://app.powerbi.com/view?r=eyJrIjoiZWFlNDIwOTQtNGU0Yy00NTVhLTgwNTgtNjM0ODQ1ZmM2NWRkIiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9'
  }
};

export function getPowerBIUrl(dataType, chartType) {
  if (reportUrls[dataType] && reportUrls[dataType][chartType]) {
    return reportUrls[dataType][chartType];
  }
  return null;
}
