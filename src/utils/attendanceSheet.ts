interface AttendanceRecord {
  user_name: string;
  joined_at: string;
  attended: number;
  checked_in_at?: string;
}

interface EventDetails {
  title: string;
  description: string;
  location: string;
  start_datetime: string;
  end_datetime: string;
  organizer: string;
}

export function generateAttendanceHTML(
  event: EventDetails,
  participants: AttendanceRecord[]
): string {
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimestamp = (timestamp: string | undefined) => {
    if (!timestamp) return 'N/A';
    return new Date(parseInt(timestamp)).toLocaleString();
  };

  const attendedCount = participants.filter(p => p.attended).length;
  const attendanceRate = participants.length > 0 
    ? ((attendedCount / participants.length) * 100).toFixed(1)
    : '0';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Attendance Sheet - ${event.title}</title>
  <style>
    @media print {
      @page { margin: 0.5in; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none; }
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 20px;
      background: white;
      color: #000;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #0078d4;
      padding-bottom: 20px;
    }
    
    h1 {
      margin: 0 0 10px 0;
      color: #0078d4;
      font-size: 24pt;
    }
    
    .subtitle {
      color: #666;
      font-size: 12pt;
      margin: 5px 0;
    }
    
    .event-details {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
      border-left: 4px solid #0078d4;
    }
    
    .detail-row {
      margin: 8px 0;
      display: flex;
      line-height: 1.6;
    }
    
    .detail-label {
      font-weight: bold;
      min-width: 120px;
      color: #333;
    }
    
    .detail-value {
      color: #555;
    }
    
    .stats {
      background: #e3f2fd;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-around;
      text-align: center;
    }
    
    .stat-box {
      flex: 1;
    }
    
    .stat-number {
      font-size: 32pt;
      font-weight: bold;
      color: #0078d4;
      display: block;
    }
    
    .stat-label {
      color: #666;
      font-size: 10pt;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      font-size: 10pt;
    }
    
    th {
      background: #0078d4;
      color: white;
      padding: 12px 8px;
      text-align: left;
      font-weight: 600;
      border: 1px solid #0078d4;
    }
    
    td {
      padding: 10px 8px;
      border: 1px solid #ddd;
    }
    
    tr:nth-child(even) {
      background: #f9f9f9;
    }
    
    tr:hover {
      background: #f0f0f0;
    }
    
    .attended-yes {
      color: #107c10;
      font-weight: bold;
    }
    
    .attended-no {
      color: #d13438;
    }
    
    .checkbox {
      width: 20px;
      height: 20px;
      border: 2px solid #333;
      display: inline-block;
      margin-right: 5px;
      vertical-align: middle;
    }
    
    .checkbox.checked::after {
      content: '✓';
      display: block;
      text-align: center;
      font-size: 16px;
      font-weight: bold;
      line-height: 18px;
      color: #107c10;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #ddd;
      text-align: center;
      color: #666;
      font-size: 9pt;
    }
    
    .signature-section {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
      gap: 40px;
    }
    
    .signature-box {
      flex: 1;
      border-top: 2px solid #333;
      padding-top: 10px;
      margin-top: 60px;
    }
    
    .print-button {
      background: #0078d4;
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 14px;
      border-radius: 4px;
      cursor: pointer;
      margin: 20px 0;
      display: block;
      margin-left: auto;
      margin-right: auto;
    }
    
    .print-button:hover {
      background: #106ebe;
    }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">Print Attendance Sheet</button>
  
  <div class="header">
    <h1>Attendance Sheet</h1>
    <div class="subtitle">Colorado Springs Community Service Hub</div>
  </div>
  
  <div class="event-details">
    <div class="detail-row">
      <span class="detail-label">Event Name:</span>
      <span class="detail-value">${event.title}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Location:</span>
      <span class="detail-value">${event.location}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Start Time:</span>
      <span class="detail-value">${formatDate(event.start_datetime)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">End Time:</span>
      <span class="detail-value">${formatDate(event.end_datetime)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Organizer:</span>
      <span class="detail-value">${event.organizer}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Generated:</span>
      <span class="detail-value">${new Date().toLocaleString()}</span>
    </div>
  </div>
  
  <div class="stats">
    <div class="stat-box">
      <span class="stat-number">${participants.length}</span>
      <span class="stat-label">Total Registered</span>
    </div>
    <div class="stat-box">
      <span class="stat-number">${attendedCount}</span>
      <span class="stat-label">Attended</span>
    </div>
    <div class="stat-box">
      <span class="stat-number">${attendanceRate}%</span>
      <span class="stat-label">Attendance Rate</span>
    </div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th style="width: 50px;">#</th>
        <th>Participant Name</th>
        <th style="width: 150px;">Registered On</th>
        <th style="width: 100px; text-align: center;">Attended</th>
        <th style="width: 150px;">Check-In Time</th>
      </tr>
    </thead>
    <tbody>
      ${participants.map((participant, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${participant.user_name}</td>
          <td>${new Date(participant.joined_at).toLocaleDateString()}</td>
          <td style="text-align: center;">
            <span class="checkbox ${participant.attended ? 'checked' : ''}"></span>
            <span class="${participant.attended ? 'attended-yes' : 'attended-no'}">
              ${participant.attended ? 'Yes' : 'No'}
            </span>
          </td>
          <td>${formatTimestamp(participant.checked_in_at)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <div class="signature-section">
    <div class="signature-box">
      <strong>Event Organizer Signature</strong>
    </div>
    <div class="signature-box">
      <strong>Date</strong>
    </div>
  </div>
  
  <div class="footer">
    <p>This attendance sheet was generated by Colorado Springs Community Service Hub</p>
    <p>For questions or corrections, please contact the event organizer</p>
  </div>
</body>
</html>
  `;
}

export function downloadAttendanceSheet(
  event: EventDetails,
  participants: AttendanceRecord[]
): void {
  const html = generateAttendanceHTML(event, participants);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `attendance-${event.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function printAttendanceSheet(
  event: EventDetails,
  participants: AttendanceRecord[]
): void {
  const html = generateAttendanceHTML(event, participants);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}