document.addEventListener('DOMContentLoaded', function() {
    const currentMonth = new Date();
    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    renderCalendar(previousMonth, 'previousMonth');
    renderCalendar(currentMonth, 'currentMonth');
    renderCalendar(nextMonth, 'nextMonth');

    // Handle tab switching
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const tabContent = document.querySelectorAll('.tab-pane');
            tabContent.forEach(content => content.classList.remove('active'));
            document.getElementById(this.dataset.tab).classList.add('active');
        });
    });
});

function renderCalendar(date, containerId) {
    const container = document.getElementById(containerId);
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];

    container.innerHTML = `
        <div class="calendar-header">
            <h4>${monthNames[month]} ${year}</h4>
        </div>
        <table class="w-100">
            <thead>
                <tr>
                    <th>Sun</th>
                    <th>Mon</th>
                    <th>Tue</th>
                    <th>Wed</th>
                    <th>Thu</th>
                    <th>Fri</th>
                    <th>Sat</th>
                </tr>
            </thead>
            <tbody>
                ${generateCalendarRows(year, month, daysInMonth, firstDay)}
            </tbody>
        </table>
    `;
}

function generateCalendarRows(year, month, daysInMonth, firstDay) {
    let rows = '';
    let day = 1;
    let currentRow = '<tr>';
    let cellsInRow = 0;
    const today = new Date();
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        currentRow += '<td></td>';
        cellsInRow++;
    }
    
    // Add all days of the month
    while (day <= daysInMonth) {
        const isToday = isCurrentMonth && day === today.getDate();
        currentRow += `<td class="${isToday ? 'today' : ''}">${day}</td>`;
        cellsInRow++;
        
        // If we've reached 7 cells, close the row and start a new one
        if (cellsInRow === 7) {
            currentRow += '</tr>';
            rows += currentRow;
            currentRow = '<tr>';
            cellsInRow = 0;
        }
        
        day++;
    }
    
    // Add remaining empty cells to complete the last row
    while (cellsInRow < 7) {
        currentRow += '<td></td>';
        cellsInRow++;
    }
    
    currentRow += '</tr>';
    rows += currentRow;
    
    return rows;
}