

const reportUrls = {
  customers: {
    pie: 'https://app.powerbi.com/view?r=eyJrIjoiY2QwMmI2NGUtYjE2ZS00NmJlLWE2NzAtMWNmOWZhNTc1OTc4IiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9&cb=${Date.now()}&filterPaneEnabled=true',
    line: 'https://app.powerbi.com/view?r=eyJrIjoiMjAwNmJhNmYtOTcwZi00ZjhjLWE3ZjItM2JkMGM5NjdmZWEwIiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9&cb=${Date.now()}&filterPaneEnabled=true',
    bar: 'https://app.powerbi.com/view?r=eyJrIjoiZjMxZTM5ODYtNGNmMS00NTBiLWJjOTQtZmE2NjAzYzFlMzhiIiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9&cb=${Date.now()}&filterPaneEnabled=true'
  },
  orders: {
    pie: 'https://app.powerbi.com/view?r=eyJrIjoiNzhkOTJkZmMtMThiZi00NWJhLWFkNTctYWU4NTU2M2QzOWM5IiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9&cb=${Date.now()}&filterPaneEnabled=true',
    line: 'https://app.powerbi.com/view?r=eyJrIjoiNDdmYjA2MDMtMGMzMS00NGI4LTgwZGUtYjIzZDcyN2E4OGU1IiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9&cb=${Date.now()}&filterPaneEnabled=true',
    bar: 'https://app.powerbi.com/view?r=eyJrIjoiYjQ5OTEzZDUtYjI0Mi00YTNmLTkyZWYtZGU1ZWU0MDg4ODEwIiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9&cb=${Date.now()}&filterPaneEnabled=true'
  },
  invoices: {
    pie: 'https://app.powerbi.com/view?r=eyJrIjoiMmVjNTZlZTQtOWRjNC00ODc4LWFmYjMtOWFmMjkyNmNkOWI5IiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9&cb=${Date.now()}&filterPaneEnabled=true',
    line: 'https://app.powerbi.com/view?r=eyJrIjoiMjdhNmQ3YjItZjIxZS00ZWFkLWFmZTgtNWFkMjkzZWM4MTRlIiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9&cb=${Date.now()}&filterPaneEnabled=true',
    bar: 'https://app.powerbi.com/view?r=eyJrIjoiZTNlNDAyMGUtMGQ2Yi00MGQ4LTg3OGUtNzY4ZGU0MDA1ZTY3IiwidCI6ImNkYmI0MzAwLWFkZDEtNGEwNy1hYjMxLThjZDZmYzBmYjNjMiJ9&cb=${Date.now()}&filterPaneEnabled=true'
  }
};

export function getPowerBIUrl(dataType, chartType) {
  if (reportUrls[dataType] && reportUrls[dataType][chartType]) {
    return reportUrls[dataType][chartType];
  }
  return null;
}
