export function addBusinessDays(startDate: Date, daysToAdd: number): Date {
    let currentDate = new Date(startDate);
    let daysAdded = 0;

    // Start from the next day
    currentDate.setDate(currentDate.getDate() + 1);

    while (daysAdded < daysToAdd) {
        const dayOfWeek = currentDate.getDay();

        // Skip weekends (0 = Sunday, 6 = Saturday)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            daysAdded++;
        }

        // Only move to next day if we haven't reached the target
        if (daysAdded < daysToAdd) {
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    return currentDate;
}

export function isBusinessDay(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6;
}

export function getNextBusinessDay(date: Date): Date {
    let nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    while (!isBusinessDay(nextDay)) {
        nextDay.setDate(nextDay.getDate() + 1);
    }

    return nextDay;
}

// Helper: Format date for display
export function formatBusinessDate(date: Date): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}


