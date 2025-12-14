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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-around;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .stat-box {
      flex: 1;
      padding: 10px;
    }
    
    .stat-number {
      font-size: 36pt;
      font-weight: bold;
      color: white;
      display: block;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    
    .stat-label {
      color: rgba(255,255,255,0.95);
      font-size: 11pt;
      font-weight: 500;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      font-size: 10pt;
      page-break-inside: auto;
    }
    
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
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
      padding: 14px 8px;
      border: 1px solid #ddd;
      min-height: 40px;
    }
    
    tr:nth-child(even) {
      background: #f9f9f9;
    }
    
    .signature-cell {
      width: 200px;
      border-bottom: 2px solid #333;
      min-height: 30px;
    }
    
    .checkbox {
      width: 24px;
      height: 24px;
      border: 2px solid #333;
      display: inline-block;
      margin-right: 8px;
      vertical-align: middle;
      border-radius: 4px;
      background: white;
    }
    
    .checkbox.checked {
      background: #107c10;
      border-color: #107c10;
    }
    
    .checkbox.checked::after {
      content: '✓';
      display: block;
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      line-height: 20px;
      color: white;
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
      page-break-inside: avoid;
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

    .instructions-box {
      margin-top: 30px;
      padding: 20px;
      background: #fffacd;
      border-radius: 5px;
      border-left: 4px solid #ffd700;
      page-break-inside: avoid;
    }

    .instructions-box h3 {
      margin: 0 0 10px 0;
      color: #b8860b;
    }

    .instructions-box ol {
      margin: 0;
      padding-left: 20px;
      line-height: 1.8;
    }

    .checklist-box {
      margin-top: 30px;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 5px;
      border-left: 4px solid #0078d4;
      page-break-inside: avoid;
    }

    .checklist-box h3 {
      margin: 0 0 10px 0;
      color: #0078d4;
    }

    .checklist-item {
      margin: 10px 0;
    }

    .checklist-item input[type="checkbox"] {
      margin-right: 10px;
    }

    .warning-box {
      margin-top: 15px;
      padding: 10px;
      background: #fff4ce;
      border-radius: 4px;
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

  <div class="instructions-box">
    <h3>📋 Instructions for Event Day</h3>
    <ol>
      <li><strong>Print this sheet</strong> and bring it to your event</li>
      <li><strong>Have participants sign</strong> in the "Signature" column when they arrive</li>
      <li><strong>After the event</strong>, return to the platform and mark attendance online</li>
      <li><strong>Save attendance</strong> - Only checked-in participants will receive credit</li>
    </ol>
  </div>
  
  <table>
    <thead>
      <tr>
        <th style="width: 50px;">#</th>
        <th>Participant Name</th>
        <th style="width: 150px;">Registered On</th>
        <th style="width: 200px; text-align: center;">Signature</th>
        <th style="width: 120px; text-align: center;">Present</th>
      </tr>
    </thead>
    <tbody>
      ${participants.map((participant, index) => `
        <tr>
          <td>${index + 1}</td>
          <td><strong>${participant.user_name}</strong></td>
          <td>${new Date(participant.joined_at).toLocaleDateString()}</td>
          <td class="signature-cell"></td>
          <td style="text-align: center;">
            <span class="checkbox"></span>
          </td>
        </tr>
      `).join('')}
      
      ${Array(5).fill(0).map((_, index) => `
        <tr style="background: #f0f8ff;">
          <td>${participants.length + index + 1}</td>
          <td style="color: #666;"><em>Walk-in participant</em></td>
          <td style="color: #666;"><em>N/A</em></td>
          <td class="signature-cell"></td>
          <td style="text-align: center;">
            <span class="checkbox"></span>
          </td>
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
  
  <div class="checklist-box">
    <h3>📊 Post-Event Checklist</h3>
    <div class="checklist-item">
      <input type="checkbox"> Return to the platform: <strong>Colorado Springs Community Service Hub</strong>
    </div>
    <div class="checklist-item">
      <input type="checkbox"> Navigate to "My Posts" → Click menu (⋯) → "Manage Attendance"
    </div>
    <div class="checklist-item">
      <input type="checkbox"> Check the boxes for participants who attended
    </div>
    <div class="checklist-item">
      <input type="checkbox"> Click "Save Attendance" to record attendance
    </div>
    <div class="warning-box">
      <strong>⚠️ Important:</strong> Only participants you mark as attended will receive credit for this event in their profile.
    </div>
  </div>
  
  <div class="footer">
    <p>This attendance sheet was generated by Colorado Springs Community Service Hub</p>
    <p>For questions or corrections, please contact the event organizer</p>
    <p style="font-size: 8pt; color: #999; margin-top: 10px;">Generated on ${new Date().toLocaleString()}</p>
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