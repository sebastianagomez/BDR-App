export function addBusinessDays(startDate: Date, days: number): Date {
    let current = new Date(startDate);
    let added = 0;

    while (added < days) {
        current.setDate(current.getDate() + 1);
        // Skip weekends (0=Sunday, 6=Saturday)
        if (current.getDay() !== 0 && current.getDay() !== 6) {
            added++;
        }
    }

    return current;
}

export function isBusinessDay(date: Date): boolean {
    const day = date.getDay();
    return day !== 0 && day !== 6;
}
